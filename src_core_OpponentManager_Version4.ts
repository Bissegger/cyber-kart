import * as THREE from 'three'
import { AIAgent, AIDifficulty } from './AIAgent'
import { KartModel } from '@models/KartModel'
import { Pathfinding } from './Pathfinding'
import { RacingLine } from './RacingLine'
import { DifficultyManager } from './DifficultyManager'

export class OpponentManager {
  private opponents: AIAgent[] = []
  private scene: THREE.Scene
  private pathfinding: Pathfinding
  private racingLine: RacingLine
  private maxOpponents: number = 3

  constructor(scene: THREE.Scene, pathfinding: Pathfinding, racingLine: RacingLine) {
    this.scene = scene
    this.pathfinding = pathfinding
    this.racingLine = racingLine
  }

  /**
   * Spawn Gegner
   */
  spawnOpponent(difficulty: AIDifficulty, spawnPosition: THREE.Vector3): AIAgent {
    // Erstelle Kart-Modell
    const kartModel = new KartModel(this.scene)
    kartModel.setPosition(spawnPosition)

    // Erstelle KI-Agent
    const opponent = DifficultyManager.createAIAgent(
      kartModel.getModel(),
      difficulty,
      this.pathfinding,
      this.racingLine
    )

    this.opponents.push(opponent)
    return opponent
  }

  /**
   * Spawn Standard-Gegner (Easy, Medium, Hard)
   */
  spawnDefaultOpponents(): void {
    const difficulties: AIDifficulty[] = [
      AIDifficulty.EASY,
      AIDifficulty.MEDIUM,
      AIDifficulty.HARD
    ]

    const spawnPositions: THREE.Vector3[] = [
      new THREE.Vector3(10, 1, 50),
      new THREE.Vector3(-10, 1, 100),
      new THREE.Vector3(0, 1, 150)
    ]

    difficulties.forEach((difficulty, index) => {
      this.spawnOpponent(difficulty, spawnPositions[index])
    })

    console.log(`✅ ${this.opponents.length} Gegner gespawnt`)
  }

  /**
   * Update alle Gegner
   */
  updateOpponents(deltaTime: number, playerPosition: THREE.Vector3): void {
    this.opponents.forEach(opponent => {
      opponent.update(deltaTime, playerPosition, this.opponents)
    })
  }

  /**
   * Hole alle Gegner
   */
  getOpponents(): AIAgent[] {
    return this.opponents
  }

  /**
   * Hole Gegner nach Index
   */
  getOpponent(index: number): AIAgent | undefined {
    return this.opponents[index]
  }

  /**
   * Gib Anzahl der Gegner
   */
  getOpponentCount(): number {
    return this.opponents.length
  }

  /**
   * Reset alle Gegner
   */
  resetOpponents(): void {
    this.opponents.forEach(opponent => opponent.resetLapTime())
  }

  /**
   * Dispose alle Gegner
   */
  dispose(): void {
    this.opponents.forEach(opponent => opponent.dispose())
    this.opponents = []
  }
}