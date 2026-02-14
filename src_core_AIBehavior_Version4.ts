import { AIAgent, AIDifficulty } from './AIAgent'
import * as THREE from 'three'

export class AIBehavior {
  /**
   * Entscheide ob Nitro/Boost verwendet werden soll
   */
  static shouldUseBoost(agent: AIAgent, opponents: AIAgent[]): boolean {
    const speed = agent.getPhysics().getSpeed()
    const maxSpeed = 50

    // Easy: Boost nur wenn weit genug weg
    if (agent.getDifficulty() === AIDifficulty.EASY) {
      return speed > maxSpeed * 0.6 && Math.random() > 0.7
    }

    // Medium: Boost strategisch
    if (agent.getDifficulty() === AIDifficulty.MEDIUM) {
      return speed > maxSpeed * 0.8 && Math.random() > 0.5
    }

    // Hard: Boost optimal verwendet
    if (agent.getDifficulty() === AIDifficulty.HARD) {
      return speed > maxSpeed * 0.7 && Math.random() > 0.3
    }

    return false
  }

  /**
   * Entscheide ob Item/Waffe verwendet werden soll
   */
  static shouldUseItem(
    agent: AIAgent,
    opponents: AIAgent[],
    hasItem: boolean
  ): boolean {
    if (!hasItem) return false

    const agentPos = agent.getModel().position
    const nearbyOpponents = opponents.filter(
      opp => agentPos.distanceTo(opp.getModel().position) < 30
    )

    // Easy: Items nur selten verwenden
    if (agent.getDifficulty() === AIDifficulty.EASY) {
      return nearbyOpponents.length > 0 && Math.random() > 0.8
    }

    // Medium: Items strategisch
    if (agent.getDifficulty() === AIDifficulty.MEDIUM) {
      return nearbyOpponents.length > 0 && Math.random() > 0.5
    }

    // Hard: Items optimal verwenden
    if (agent.getDifficulty() === AIDifficulty.HARD) {
      return nearbyOpponents.length > 0 && Math.random() > 0.3
    }

    return false
  }

  /**
   * Berechne Aggressivität basierend auf Situation
   */
  static calculateAggressiveness(
    agent: AIAgent,
    playerPosition: THREE.Vector3,
    racingPosition: number // 1-4
  ): number {
    const agentPos = agent.getModel().position
    const distanceToPlayer = agentPos.distanceTo(playerPosition)

    let aggressiveness = agent.getDifficulty() === AIDifficulty.HARD ? 0.9 : 0.5

    // Wenn direkt hinter Spieler, aggressiver
    if (distanceToPlayer < 20) {
      aggressiveness += 0.3
    }

    // Wenn in Führung, defensiver
    if (racingPosition === 1) {
      aggressiveness -= 0.2
    }

    return Math.max(0, Math.min(1, aggressiveness))
  }

  /**
   * Berechne beste Überholstelle
   */
  static findOvertakingOpportunity(
    agentPos: THREE.Vector3,
    targetPos: THREE.Vector3,
    trackWidth: number = 20
  ): THREE.Vector3 {
    // Berechne seitlichen Abstand für Überholung
    const direction = new THREE.Vector3().subVectors(targetPos, agentPos).normalize()
    const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x).normalize()

    // Überholung von links
    const overtakeLeft = targetPos.clone().add(perpendicular.multiplyScalar(trackWidth / 2))

    return overtakeLeft
  }

  /**
   * Berechne Bremsenpunkt für Kurve
   */
  static calculateBrakingPoint(
    currentPos: THREE.Vector3,
    nextWaypoint: THREE.Vector3,
    currentSpeed: number
  ): number {
    const distance = currentPos.distanceTo(nextWaypoint)
    const brakeDistance = (currentSpeed * currentSpeed) / (2 * 5) // Bremsbeschleunigung = 5

    // Anfangen zu bremsen wenn Bremsweg > Abstand zur Kurve
    return brakeDistance > distance ? 1 : 0
  }
}