import io, { Socket } from 'socket.io-client'
import * as THREE from 'three'

export interface NetworkPlayerState {
  id: string
  username: string
  position: THREE.Vector3
  rotation: THREE.Euler
  speed: number
}

export class NetworkManager {
  private socket: Socket | null = null
  private playerId: string = ''
  private username: string = ''
  private isConnected: boolean = false
  private latency: number = 0
  private remoteePlayers: Map<string, NetworkPlayerState> = new Map()
  private serverURL: string = 'http://localhost:3001'

  constructor(serverURL: string = 'http://localhost:3001') {
    this.serverURL = serverURL
  }

  /**
   * Verbinde zum Server
   */
  connect(username: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(this.serverURL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      })

      this.socket.on('connect', () => {
        console.log('✅ Verbunden mit Server')
        this.isConnected = true

        // Registriere Spieler
        this.socket!.emit('register', { username })

        resolve()
      })

      this.socket.on('register_success', (data: { playerId: string }) => {
        this.playerId = data.playerId
        this.username = username
        console.log(`✅ Registriert als: ${username} (${this.playerId})`)
      })

      this.socket.on('connect_error', (error: any) => {
        console.error('❌ Verbindungsfehler:', error)
        reject(error)
      })

      this.setupEventListeners()
    })
  }

  /**
   * Setup Event Listener
   */
  private setupEventListeners(): void {
    if (!this.socket) return

    // Match Found
    this.socket.on('match_found', (data: any) => {
      console.log(`🎮 Match gefunden! Room: ${data.roomId}`)
      this.onMatchFound?.(data)
    })

    // Race Started
    this.socket.on('race_started', (data: any) => {
      console.log(`🏁 Rennen gestartet!`)
      this.onRaceStarted?.(data)
    })

    // Player State Update
    this.socket.on('player_state_update', (data: any) => {
      this.remoteePlayers.set(data.playerId, {
        id: data.playerId,
        username: '',
        position: new THREE.Vector3(data.position.x, data.position.y, data.position.z),
        rotation: new THREE.Euler(data.rotation.x, data.rotation.y, data.rotation.z),
        speed: data.speed
      })
    })

    // Game State Update
    this.socket.on('game_state_update', (data: any) => {
      this.onGameStateUpdate?.(data)
    })

    // Race Finished
    this.socket.on('race_finished', (data: any) => {
      console.log(`✅ Rennen beendet!`)
      this.onRaceFinished?.(data)
    })

    // Matchmaking Status
    this.socket.on('matchmaking_status', (data: any) => {
      console.log(`🎯 Position in Queue: ${data.queuePosition + 1}/${data.queueSize}`)
      this.onMatchmakingStatus?.(data)
    })

    // Ping/Pong für Latenz
    this.measureLatency()
  }

  /**
   * Messe Latenz
   */
  private measureLatency(): void {
    if (!this.socket) return

    setInterval(() => {
      const timestamp = Date.now()
      this.socket!.emit('ping', { timestamp })

      this.socket!.once('pong', (data: any) => {
        this.latency = Date.now() - timestamp
      })
    }, 5000)
  }

  /**
   * Sende Player-Input zum Server
   */
  sendPlayerInput(inputState: { forward: number; turn: number; brake: number }): void {
    if (!this.socket || !this.isConnected) return

    this.socket.emit('player_input', inputState)
  }

  /**
   * Sende Position-Update
   */
  sendPositionUpdate(position: THREE.Vector3, rotation: THREE.Euler, speed: number): void {
    if (!this.socket || !this.isConnected) return

    this.socket.emit('position_update', {
      position: { x: position.x, y: position.y, z: position.z },
      rotation: { x: rotation.x, y: rotation.y, z: rotation.z },
      speed,
      latency: this.latency
    })
  }

  /**
   * Sende Chat-Message
   */
  sendChatMessage(message: string, roomId: string): void {
    if (!this.socket) return

    this.socket.emit('chat_message', { message, room: roomId })
  }

  /**
   * Join Matchmaking
   */
  joinMatchmaking(): void {
    if (!this.socket) return

    this.socket.emit('join_matchmaking')
  }

  /**
   * Leave Matchmaking
   */
  leaveMatchmaking(): void {
    if (!this.socket) return

    this.socket.emit('leave_matchmaking')
  }

  /**
   * Hole Remote Players
   */
  getRemotePlayers(): NetworkPlayerState[] {
    return Array.from(this.remoteePlayers.values())
  }

  /**
   * Hole Latenz
   */
  getLatency(): number {
    return this.latency
  }

  /**
   * Prüfe Verbindung
   */
  isConnectedToServer(): boolean {
    return this.isConnected
  }

  /**
   * Disconnect
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.isConnected = false
    }
  }

  // Event Callbacks
  onMatchFound?: (data: any) => void
  onRaceStarted?: (data: any) => void
  onGameStateUpdate?: (data: any) => void
  onRaceFinished?: (data: any) => void
  onMatchmakingStatus?: (data: any) => void
}