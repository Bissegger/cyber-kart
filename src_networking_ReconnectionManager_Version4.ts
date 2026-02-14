import { Socket } from 'socket.io-client'

export class ReconnectionManager {
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private reconnectDelay: number = 1000
  private sessionData: any = null
  private isReconnecting: boolean = false

  constructor(private socket: Socket) {
    this.setupReconnectionListeners()
  }

  /**
   * Setup Reconnection Listener
   */
  private setupReconnectionListeners(): void {
    this.socket.on('disconnect', (reason: string) => {
      console.log(`❌ Disconnected: ${reason}`)

      if (reason === 'io server disconnect') {
        // Server hat disconnect, reconnect
        this.attemptReconnection()
      }
    })

    this.socket.on('connect', () => {
      console.log(`✅ Reconnected`)
      this.reconnectAttempts = 0
      this.isReconnecting = false

      // Restore Session
      if (this.sessionData) {
        this.restoreSession()
      }
    })
  }

  /**
   * Versuche Reconnection
   */
  private attemptReconnection(): void {
    if (this.isReconnecting || this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached')
      return
    }

    this.isReconnecting = true
    this.reconnectAttempts++

    console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)

    setTimeout(() => {
      this.socket.connect()
    }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)) // Exponential backoff
  }

  /**
   * Speichere Session-Daten
   */
  saveSessionData(data: any): void {
    this.sessionData = data
    localStorage.setItem('session_data', JSON.stringify(data))
  }

  /**
   * Restore Session
   */
  private restoreSession(): void {
    if (!this.sessionData) {
      const saved = localStorage.getItem('session_data')
      this.sessionData = saved ? JSON.parse(saved) : null
    }

    if (this.sessionData) {
      console.log(`🔄 Session wiederhergestellt: ${this.sessionData.username}`)
      this.socket.emit('restore_session', this.sessionData)
    }
  }

  /**
   * Gib Reconnect Status
   */
  getReconnectStatus(): { isReconnecting: boolean; attempts: number; maxAttempts: number } {
    return {
      isReconnecting: this.isReconnecting,
      attempts: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts
    }
  }
}