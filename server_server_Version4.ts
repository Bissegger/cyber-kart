import express, { Express } from 'express'
import { Server as SocketIOServer, Socket } from 'socket.io'
import { createServer } from 'http'
import path from 'path'

interface Player {
  id: string
  username: string
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  speed: number
  inputState: {
    forward: number
    turn: number
    brake: number
  }
  lastUpdate: number
  latency: number
  score: number
  rank: number
}

interface GameRoom {
  id: string
  name: string
  players: Map<string, Player>
  maxPlayers: number
  status: 'waiting' | 'racing' | 'finished'
  createdAt: number
}

export class CyberKartServer {
  private app: Express
  private io: SocketIOServer
  private rooms: Map<string, GameRoom> = new Map()
  private players: Map<string, Player> = new Map()
  private matchmakingQueue: string[] = []
  private gameTickRate: number = 60 // Updates pro Sekunde

  constructor(port: number = 3001) {
    this.app = express()
    const httpServer = createServer(this.app)

    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling'],
      pingInterval: 25000,
      pingTimeout: 60000
    })

    this.setupRoutes()
    this.setupSocketListeners()
    this.startGameLoop()

    httpServer.listen(port, () => {
      console.log(`🎮 Cyber Kart Server läuft auf Port ${port}`)
    })
  }

  /**
   * Setup Express Routes
   */
  private setupRoutes(): void {
    this.app.use(express.static(path.join(__dirname, '../public')))
    this.app.use(express.json())

    // Health Check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        players: this.players.size,
        rooms: this.rooms.size,
        timestamp: Date.now()
      })
    })

    // Leaderboard API
    this.app.get('/api/leaderboard', (req, res) => {
      const leaderboard = Array.from(this.players.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 100)
        .map((player, index) => ({
          rank: index + 1,
          username: player.username,
          score: player.score,
          elo: player.rank
        }))

      res.json(leaderboard)
    })

    // Player Stats
    this.app.get('/api/player/:id', (req, res) => {
      const player = this.players.get(req.params.id)
      if (!player) {
        return res.status(404).json({ error: 'Player not found' })
      }

      res.json({
        id: player.id,
        username: player.username,
        score: player.score,
        rank: player.rank,
        latency: player.latency
      })
    })
  }

  /**
   * Setup Socket.io Listener
   */
  private setupSocketListeners(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`👤 Spieler verbunden: ${socket.id}`)

      // Player Registration
      socket.on('register', (data: { username: string }) => {
        this.handlePlayerRegistration(socket, data)
      })

      // Matchmaking Join
      socket.on('join_matchmaking', () => {
        this.handleMatchmakingJoin(socket)
      })

      // Leave Matchmaking
      socket.on('leave_matchmaking', () => {
        this.handleMatchmakingLeave(socket)
      })

      // Player Input (Controller State)
      socket.on('player_input', (data: any) => {
        this.handlePlayerInput(socket, data)
      })

      // Position Update
      socket.on('position_update', (data: any) => {
        this.handlePositionUpdate(socket, data)
      })

      // Chat Message
      socket.on('chat_message', (data: { message: string; room: string }) => {
        this.handleChatMessage(socket, data)
      })

      // Disconnect
      socket.on('disconnect', () => {
        this.handlePlayerDisconnect(socket)
      })

      // Latency Measurement
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: Date.now() })
      })
    })
  }

  /**
   * Handle Player Registration
   */
  private handlePlayerRegistration(socket: Socket, data: { username: string }): void {
    const player: Player = {
      id: socket.id,
      username: data.username,
      position: { x: 0, y: 1, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      speed: 0,
      inputState: { forward: 0, turn: 0, brake: 0 },
      lastUpdate: Date.now(),
      latency: 0,
      score: 0,
      rank: 1200 // ELO starting rating
    }

    this.players.set(socket.id, player)
    socket.emit('register_success', { playerId: socket.id, player })
    console.log(`✅ Spieler registriert: ${data.username}`)
  }

  /**
   * Handle Matchmaking Join
   */
  private handleMatchmakingJoin(socket: Socket): void {
    if (!this.matchmakingQueue.includes(socket.id)) {
      this.matchmakingQueue.push(socket.id)
    }

    console.log(`🎯 Spieler in Queue: ${this.matchmakingQueue.length}`)

    // Wenn 4 Spieler in Queue, starte Spiel
    if (this.matchmakingQueue.length >= 4) {
      this.createMatchFromQueue()
    }

    socket.emit('matchmaking_status', {
      queuePosition: this.matchmakingQueue.indexOf(socket.id),
      queueSize: this.matchmakingQueue.length
    })
  }

  /**
   * Handle Matchmaking Leave
   */
  private handleMatchmakingLeave(socket: Socket): void {
    const index = this.matchmakingQueue.indexOf(socket.id)
    if (index > -1) {
      this.matchmakingQueue.splice(index, 1)
    }
    socket.emit('left_matchmaking')
  }

  /**
   * Create Match from Queue
   */
  private createMatchFromQueue(): void {
    const playerIds = this.matchmakingQueue.splice(0, 4)
    const roomId = `room_${Date.now()}`

    const room: GameRoom = {
      id: roomId,
      name: `Race #${this.rooms.size + 1}`,
      players: new Map(),
      maxPlayers: 4,
      status: 'waiting',
      createdAt: Date.now()
    }

    playerIds.forEach(playerId => {
      const player = this.players.get(playerId)
      if (player) {
        room.players.set(playerId, player)
      }
    })

    this.rooms.set(roomId, room)

    // Benachrichtige Spieler
    playerIds.forEach(playerId => {
      const socket = this.io.sockets.sockets.get(playerId)
      if (socket) {
        socket.join(roomId)
        socket.emit('match_found', {
          roomId,
          players: Array.from(room.players.values()).map(p => ({
            id: p.id,
            username: p.username
          }))
        })
      }
    })

    console.log(`🎮 Match erstellt: ${roomId} mit ${playerIds.length} Spielern`)
  }

  /**
   * Handle Player Input
   */
  private handlePlayerInput(socket: Socket, data: any): void {
    const player = this.players.get(socket.id)
    if (!player) return

    player.inputState = {
      forward: Math.max(-1, Math.min(1, data.forward || 0)),
      turn: Math.max(-1, Math.min(1, data.turn || 0)),
      brake: Math.max(0, Math.min(1, data.brake || 0))
    }

    player.lastUpdate = Date.now()
  }

  /**
   * Handle Position Update (Client-to-Server)
   */
  private handlePositionUpdate(socket: Socket, data: any): void {
    const player = this.players.get(socket.id)
    if (!player) return

    // Update Player State
    player.position = data.position
    player.rotation = data.rotation
    player.speed = data.speed
    player.latency = data.latency || 0

    // Broadcast zu anderen Spielern im Room
    const room = this.findPlayerRoom(socket.id)
    if (room) {
      socket.broadcast.to(room.id).emit('player_state_update', {
        playerId: socket.id,
        position: player.position,
        rotation: player.rotation,
        speed: player.speed,
        timestamp: Date.now()
      })
    }
  }

  /**
   * Handle Chat Message
   */
  private handleChatMessage(socket: Socket, data: { message: string; room: string }): void {
    const player = this.players.get(socket.id)
    if (!player) return

    const chatData = {
      playerId: socket.id,
      username: player.username,
      message: data.message,
      timestamp: Date.now()
    }

    this.io.to(data.room).emit('chat_message', chatData)
  }

  /**
   * Handle Player Disconnect
   */
  private handlePlayerDisconnect(socket: Socket): void {
    const player = this.players.get(socket.id)
    const room = this.findPlayerRoom(socket.id)

    if (room) {
      room.players.delete(socket.id)

      // Wenn Room leer, lösche sie
      if (room.players.size === 0) {
        this.rooms.delete(room.id)
      } else {
        // Benachrichtige andere Spieler
        this.io.to(room.id).emit('player_disconnected', {
          playerId: socket.id,
          username: player?.username
        })
      }
    }

    this.players.delete(socket.id)
    console.log(`❌ Spieler disconnected: ${player?.username}`)
  }

  /**
   * Find Room by Player ID
   */
  private findPlayerRoom(playerId: string): GameRoom | null {
    for (const room of this.rooms.values()) {
      if (room.players.has(playerId)) {
        return room
      }
    }
    return null
  }

  /**
   * Game Loop (Server-seitige Physics & State Management)
   */
  private startGameLoop(): void {
    const tickInterval = 1000 / this.gameTickRate

    setInterval(() => {
      // Update alle Rooms
      this.rooms.forEach(room => {
        if (room.status !== 'racing') return

        // Server-side Physics Update
        const gameState = {
          timestamp: Date.now(),
          players: Array.from(room.players.values()).map(p => ({
            id: p.id,
            position: p.position,
            rotation: p.rotation,
            speed: p.speed
          }))
        }

        // Sende State zu allen Spielern in Room
        this.io.to(room.id).emit('game_state_update', gameState)
      })
    }, tickInterval)
  }

  /**
   * Start Race
   */
  startRace(roomId: string): void {
    const room = this.rooms.get(roomId)
    if (!room) return

    room.status = 'racing'
    this.io.to(roomId).emit('race_started', {
      timestamp: Date.now(),
      duration: 300 // 5 Minuten
    })

    console.log(`🏁 Rennen gestartet: ${roomId}`)
  }

  /**
   * End Race
   */
  endRace(roomId: string, results: any[]): void {
    const room = this.rooms.get(roomId)
    if (!room) return

    room.status = 'finished'

    // Update Player Scores & Ranks
    results.forEach((result, index) => {
      const player = this.players.get(result.playerId)
      if (player) {
        player.score += result.points
        player.rank = this.updateELO(player.rank, result.position, results.length)
      }
    })

    this.io.to(roomId).emit('race_finished', {
      results,
      timestamp: Date.now()
    })

    console.log(`✅ Rennen beendet: ${roomId}`)
  }

  /**
   * Update ELO Rating
   */
  private updateELO(currentELO: number, position: number, totalPlayers: number): number {
    const K = 32 // ELO K-Factor
    const expectedScore = 1 / (1 + Math.pow(10, (currentELO - 1200) / 400))
    const actualScore = (totalPlayers - position) / (totalPlayers - 1) // 1 für 1. Platz, 0 für letzten

    return Math.round(currentELO + K * (actualScore - expectedScore))
  }

  /**
   * Hole Server-Statistiken
   */
  getServerStats(): any {
    return {
      totalPlayers: this.players.size,
      onlinePlayers: Array.from(this.io.sockets.sockets.keys()).length,
      activeRooms: this.rooms.size,
      matchmakingQueue: this.matchmakingQueue.length,
      uptime: process.uptime()
    }
  }
}

// Server starten
const server = new CyberKartServer(3001)