import { AIAgent } from './AIAgent'

/**
 * Verhindert unfaires Rubber-Banding
 * (KI wird künstlich schneller wenn hinter Spieler)
 */
export class RubberBandPrevention {
  /**
   * Berechne faire Geschwindigkeits-Anpassung
   */
  static calculateFairSpeedMultiplier(
    agent: AIAgent,
    positions: number[] // Positionen aller Spieler (1-4)
  ): number {
    const agentPosition = positions.indexOf(positions.find(p => p === agent.getDifficulty() as any) || 1)

    // Kein Rubber-Banding - nur Schwierigkeits-basierte Limits
    // Hard KI ist immer schneller
    // Easy KI ist immer langsamer
    // Medium KI ist Standard

    return 1.0 // Keine Anpassung
  }

  /**
   * Prüfe ob Rubber-Banding stattfindet
   */
  static isRubberBandingActive(
    agentPosition: THREE.Vector3,
    playerPosition: THREE.Vector3,
    agentSpeed: number,
    playerSpeed: number
  ): boolean {
    import * as THREE from 'three'

    const distance = agentPosition.distanceTo(playerPosition)

    // Wenn AI langsamer ist aber dichter wird = Rubber-Banding
    if (agentSpeed < playerSpeed && distance < 15) {
      return true
    }

    return false
  }

  /**
   * Gib Feedback ob System fair ist
   */
  static validateFairness(agents: AIAgent[], playerSpeed: number): boolean {
    // Alle KI sollten konstante Geschwindigkeiten halten
    const speeds = agents.map(a => a.getPhysics().getSpeed())

    // Prüfe auf unnatürliche Sprünge
    for (let i = 0; i < speeds.length; i++) {
      if (Math.abs(speeds[i] - speeds[i > 0 ? i - 1 : i]) > 20) {
        return false // Unnatürlicher Sprung erkannt
      }
    }

    return true // System ist fair
  }
}