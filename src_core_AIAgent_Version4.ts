import * as THREE from 'three'
import { Pathfinding } from './Pathfinding'
import { RacingLine } from './RacingLine'
import { KartPhysics } from './Physics'

export enum AIDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export interface AIConfig {
  difficulty: AIDifficulty
  aggressiveness: number
  skillLevel: number
  reactionTime: number
}

export class AIAgent {
  private model: THREE.Group
  private physics: KartPhysics
  private pathfinding: Pathfinding
  private racingLine: RacingLine
  private config: AIConfig
  private targetWaypoint: THREE.Vector3
  private currentLapTime: number = 0
  private behaviorState: 'racing' | 'overtaking' | 'defending' = 'racing'
  private reactionTimer: number = 0

  constructor(
    model: THREE.Group,
    pathfinding: Pathfinding,
    racingLine: RacingLine,
    config: AIConfig
  ) {
    this.model = model
    this.pathfinding = pathfinding
    this.racingLine = racingLine
    this.config = config

    // Physics für KI
    this.physics = new KartPhysics({
      mass: 200,
      maxSpeed: this.getMaxSpeedForDifficulty(),
      acceleration: this.getAccelerationForDifficulty(),
      friction: 0.5,
      maxTurnAngle: 0.5
    })

    this.targetWaypoint = racingLine.getIdealLine()[0]
  }

  /**
   * Hole maximale Geschwindigkeit basierend auf Schwierigkeit
   */
  private getMaxSpeedForDifficulty(): number {
    const baseSpeed = 50
    switch (this.config.difficulty) {
      case AIDifficulty.EASY:
        return baseSpeed * 0.7
      case AIDifficulty.MEDIUM:
        return baseSpeed * 0.9
      case AIDifficulty.HARD:
        return baseSpeed
      default:
        return baseSpeed
    }
  }

  /**
   * Hole Beschleunigung basierend auf Schwierigkeit
   */
  private getAccelerationForDifficulty(): number {
    const baseAccel = 20
    switch (this.config.difficulty) {
      case AIDifficulty.EASY:
        return baseAccel * 0.6
      case AIDifficulty.MEDIUM:
        return baseAccel * 0.8
      case AIDifficulty.HARD:
        return baseAccel
      default:
        return baseAccel
    }
  }

  /**
   * Update KI-Verhalten
   */
  update(deltaTime: number, playerPosition: THREE.Vector3, opponents: AIAgent[]): void {
    this.reactionTimer += deltaTime

    // Prüfe ob Reaktionszeit abgelaufen
    if (this.reactionTimer < this.config.reactionTime) {
      return
    }
    this.reactionTimer = 0

    // Bestimme Verhalten
    this.determineBehavior(playerPosition, opponents)

    // Berechne Input
    const input = this.calculateInput()

    // Update Physics
    this.physics.update(deltaTime, input)

    // Update Position
    this.updatePosition(deltaTime)

    this.currentLapTime += deltaTime
  }

  /**
   * Bestimme KI-Verhalten
   */
  private determineBehavior(playerPosition: THREE.Vector3, opponents: AIAgent[]): void {
    const distanceToPlayer = this.model.position.distanceTo(playerPosition)

    // Racing Mode (normal)
    if (distanceToPlayer > 50) {
      this.behaviorState = 'racing'
      return
    }

    // Overtaking Mode
    if (distanceToPlayer < 20 && this.physics.getSpeed() > 30) {
      this.behaviorState = 'overtaking'
      return
    }

    // Defending Mode
    if (distanceToPlayer < 30 && this.physics.getSpeed() < 30) {
      this.behaviorState = 'defending'
      return
    }
  }

  /**
   * Berechne Input (Steuereingaben)
   */
  private calculateInput(): { forward: number; turn: number; brake: number; drift: boolean } {
    const position = this.model.position
    const nextWaypoint = this.racingLine.getNextWaypoint(position)

    // Berechne Direction zu nächstem Wegpunkt
    const direction = new THREE.Vector3().subVectors(nextWaypoint, position).normalize()
    const forward = new THREE.Vector3(0, 0, 1)
    const angle = Math.acos(forward.dot(direction))

    // Berechne Turn-Input
    let turn = 0
    if (angle > 0.1) {
      // Prüfe ob links oder rechts
      const cross = forward.cross(direction)
      turn = cross.y > 0 ? 1 : -1
    }

    // Berechne Beschleunigung
    let forward_input = 1

    // Abbremsen wenn zu schnell für Kurve
    const lineDeviation = this.racingLine.getLineDeviation(position)
    if (lineDeviation > 5) {
      forward_input = 0.5
    }

    return {
      forward: forward_input,
      turn: turn,
      brake: 0,
      drift: Math.abs(turn) > 0.5
    }
  }

  /**
   * Update Position
   */
  private updatePosition(deltaTime: number): void {
    const velocity = this.physics.getVelocity()
    const newPosition = this.model.position.clone()
    newPosition.add(velocity.multiplyScalar(deltaTime))
    this.model.position.copy(newPosition)
  }

  /**
   * Hole aktuellen Verhaltenszustand
   */
  getBehaviorState(): string {
    return this.behaviorState
  }

  /**
   * Hole Schwierigkeit
   */
  getDifficulty(): AIDifficulty {
    return this.config.difficulty
  }

  /**
   * Hole Modell
   */
  getModel(): THREE.Group {
    return this.model
  }

  /**
   * Hole Physics
   */
  getPhysics(): KartPhysics {
    return this.physics
  }

  /**
   * Hole Lap-Zeit
   */
  getLapTime(): number {
    return this.currentLapTime
  }

  /**
   * Reset Lap-Zeit
   */
  resetLapTime(): void {
    this.currentLapTime = 0
  }

  dispose(): void {
    this.physics.dispose()
    this.pathfinding.dispose()
    this.racingLine.dispose()
  }
}