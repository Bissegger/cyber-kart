import * as THREE from 'three'

export interface RemotePlayerState {
  position: THREE.Vector3
  rotation: THREE.Euler
  velocity: THREE.Vector3
  timestamp: number
}

export class LagCompensation {
  private stateHistory: Map<string, RemotePlayerState[]> = new Map()
  private maxHistorySize: number = 120 // 2 Sekunden bei 60 FPS
  private interpolationDelay: number = 100 // 100ms interpolation buffer

  /**
   * Speichere Remote Player State
   */
  recordState(playerId: string, state: RemotePlayerState): void {
    if (!this.stateHistory.has(playerId)) {
      this.stateHistory.set(playerId, [])
    }

    const history = this.stateHistory.get(playerId)!
    history.push({ ...state, timestamp: Date.now() })

    // Behalte nur letzte N States
    if (history.length > this.maxHistorySize) {
      history.shift()
    }
  }

  /**
   * Interpoliere Position basierend auf Latenz
   */
  interpolatePosition(playerId: string, currentTime: number): THREE.Vector3 | null {
    const history = this.stateHistory.get(playerId)
    if (!history || history.length < 2) return null

    // Finde zwei States um current time
    const targetTime = currentTime - this.interpolationDelay
    let state1: RemotePlayerState | null = null
    let state2: RemotePlayerState | null = null

    for (let i = 0; i < history.length; i++) {
      if (history[i].timestamp <= targetTime) {
        state1 = history[i]
      }
      if (history[i].timestamp >= targetTime && !state2) {
        state2 = history[i]
      }
    }

    if (!state1 || !state2) {
      return history[history.length - 1].position
    }

    // Linear Interpolation
    const timeDiff = state2.timestamp - state1.timestamp
    if (timeDiff === 0) return state1.position

    const alpha = (targetTime - state1.timestamp) / timeDiff
    const interpolatedPos = state1.position.clone()
    interpolatedPos.lerp(state2.position, alpha)

    return interpolatedPos
  }

  /**
   * Extrapoliere Position (Vorhersage)
   */
  extrapolatePosition(playerId: string, predictionTime: number = 50): THREE.Vector3 | null {
    const history = this.stateHistory.get(playerId)
    if (!history || history.length < 2) return null

    const lastState = history[history.length - 1]
    const prevState = history[history.length - 2]

    // Berechne Velocity
    const timeDiff = lastState.timestamp - prevState.timestamp
    const velocity = lastState.position.clone().sub(prevState.position)
    velocity.multiplyScalar(predictionTime / timeDiff)

    const predictedPos = lastState.position.clone().add(velocity)
    return predictedPos
  }

  /**
   * Berechne Verzögerung (RTT)
   */
  calculateRoundTripTime(clientTimestamp: number, serverTimestamp: number, currentTime: number): number {
    return currentTime - clientTimestamp
  }

  /**
   * Gib Spieler-Verlauf
   */
  getPlayerHistory(playerId: string): RemotePlayerState[] {
    return this.stateHistory.get(playerId) || []
  }

  /**
   * Clear alte States
   */
  clearOldStates(maxAge: number = 3000): void {
    const now = Date.now()

    this.stateHistory.forEach((history, playerId) => {
      const filtered = history.filter(state => now - state.timestamp < maxAge)

      if (filtered.length === 0) {
        this.stateHistory.delete(playerId)
      } else {
        this.stateHistory.set(playerId, filtered)
      }
    })
  }
}