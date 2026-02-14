import { AIAgent, AIDifficulty, AIConfig } from './AIAgent'
import * as THREE from 'three'
import { Pathfinding } from './Pathfinding'
import { RacingLine } from './RacingLine'

export class DifficultyManager {
  /**
   * Erstelle KI-Agent mit spezifischer Schwierigkeit
   */
  static createAIAgent(
    model: THREE.Group,
    difficulty: AIDifficulty,
    pathfinding: Pathfinding,
    racingLine: RacingLine
  ): AIAgent {
    const config = this.getConfigForDifficulty(difficulty)
    return new AIAgent(model, pathfinding, racingLine, config)
  }

  /**
   * Hole Config für Schwierigkeit
   */
  private static getConfigForDifficulty(difficulty: AIDifficulty): AIConfig {
    switch (difficulty) {
      case AIDifficulty.EASY:
        return {
          difficulty: AIDifficulty.EASY,
          aggressiveness: 0.3,
          skillLevel: 0.4,
          reactionTime: 0.3 // Höhere Reaktionszeit = langsamer
        }

      case AIDifficulty.MEDIUM:
        return {
          difficulty: AIDifficulty.MEDIUM,
          aggressiveness: 0.6,
          skillLevel: 0.7,
          reactionTime: 0.15
        }

      case AIDifficulty.HARD:
        return {
          difficulty: AIDifficulty.HARD,
          aggressiveness: 0.9,
          skillLevel: 0.95,
          reactionTime: 0.05 // Sehr schnelle Reaktion
        }

      default:
        return {
          difficulty: AIDifficulty.MEDIUM,
          aggressiveness: 0.6,
          skillLevel: 0.7,
          reactionTime: 0.15
        }
    }
  }

  /**
   * Adaptive Difficulty basierend auf Spieler-Performance
   */
  static adjustDifficultyForPlayer(
    currentDifficulty: AIDifficulty,
    playerPosition: number, // Platzierung 1-4
    playerWinRate: number // 0-1, wie oft Spieler gewinnt
  ): AIDifficulty {
    // Wenn Spieler zu oft verliert, mache es einfacher
    if (playerWinRate < 0.3 && currentDifficulty !== AIDifficulty.EASY) {
      console.log('⬇️ Schwierigkeit gesenkt - Spieler gewinnt zu selten')
      return AIDifficulty.EASY
    }

    // Wenn Spieler zu oft gewinnt, mache es schwerer
    if (playerWinRate > 0.8 && currentDifficulty !== AIDifficulty.HARD) {
      console.log('⬆️ Schwierigkeit erhöht - Spieler gewinnt zu oft')
      return AIDifficulty.HARD
    }

    return currentDifficulty
  }
}