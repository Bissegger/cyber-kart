export interface PlayerELOData {
  playerId: string
  username: string
  currentRating: number
  previousRating: number
  ratingHistory: number[]
  totalMatches: number
  wins: number
  losses: number
  winRate: number
  tier: string
  tierId: number
  matchHistory: MatchRecord[]
}

export interface MatchRecord {
  matchId: string
  opponent: string
  position: number
  timestamp: number
  ratingChange: number
}

export class ELORating {
  private K_FACTOR: number = 32 // Standard ELO K-Factor
  private BASE_RATING: number = 1200

  private tiers = [
    { id: 1, name: 'Bronze Circuit', min: 0, max: 1200, color: '#CD7F32' },
    { id: 2, name: 'Silver Drift', min: 1200, max: 1400, color: '#C0C0C0' },
    { id: 3, name: 'Neon Gold', min: 1400, max: 1600, color: '#FFD700' },
    { id: 4, name: 'Plasma Elite', min: 1600, max: 1800, color: '#FF00FF' },
    { id: 5, name: 'Quantum Legend', min: 1800, max: Infinity, color: '#00FFFF' }
  ]

  /**
   * Berechne neue ELO nach Match
   */
  calculateNewRating(
    playerRating: number,
    opponentRatings: number[],
    playerPosition: number,
    totalPlayers: number
  ): { newRating: number; ratingChange: number; expectedScore: number } {
    // Berechne Average Opponent Rating
    const avgOpponentRating = opponentRatings.reduce((a, b) => a + b, 0) / opponentRatings.length

    // Berechne Expected Score
    const expectedScore = 1 / (1 + Math.pow(10, (avgOpponentRating - playerRating) / 400))

    // Berechne Actual Score basierend auf Position
    const actualScore = (totalPlayers - playerPosition) / (totalPlayers - 1)

    // Anpassung für Varianz der Gegner
    const opponentVariance = Math.sqrt(
      opponentRatings.reduce((sum, rating) => sum + Math.pow(rating - avgOpponentRating, 2), 0) /
        opponentRatings.length
    )
    const varianceBonus = Math.min(opponentVariance / 200, 0.5) // Max 50% Bonus

    // Berechne ELO Change
    const K = this.K_FACTOR * (1 + varianceBonus)
    const ratingChange = Math.round(K * (actualScore - expectedScore))

    return {
      newRating: Math.max(0, playerRating + ratingChange),
      ratingChange,
      expectedScore
    }
  }

  /**
   * Hole Tier für Rating
   */
  getTierByRating(rating: number): { id: number; name: string; color: string } {
    const tier = this.tiers.find(t => rating >= t.min && rating < t.max)
    return tier || this.tiers[0]
  }

  /**
   * Berechne Progress im Tier (0-1)
   */
  getTierProgress(rating: number): number {
    const tier = this.getTierByRating(rating)
    const tierMin = tier.min
    const tierMax = tier.max === Infinity ? tier.min + 400 : tier.max

    return Math.max(0, Math.min(1, (rating - tierMin) / (tierMax - tierMin)))
  }

  /**
   * Berechne Punkte bis nächstes Tier
   */
  getPointsUntilNextTier(rating: number): number {
    const currentTier = this.getTierByRating(rating)
    const tierMax = currentTier.max === Infinity ? currentTier.min + 400 : currentTier.max

    return Math.max(0, tierMax - rating)
  }

  /**
   * Gib alle Tiers
   */
  getAllTiers(): any[] {
    return this.tiers
  }

  /**
   * Berechne Win Rate
   */
  calculateWinRate(wins: number, totalMatches: number): number {
    return totalMatches === 0 ? 0 : (wins / totalMatches) * 100
  }

  /**
   * Berechne Skill Level (0-100)
   */
  calculateSkillLevel(rating: number): number {
    const maxRating = 2400
    return Math.min(100, (rating / maxRating) * 100)
  }
}