export interface PlayerStats {
  totalMatches: number
  totalWins: number
  totalLosses: number
  winRate: number
  averageRating: number
  highestRating: number
  currentRating: number
  preferredGameMode: 'ranked' | 'casual'
  favoriteTrack: string
  averageFinishPosition: number
  totalPlayTime: number
  longestWinStreak: number
  currentWinStreak: number
  trophies: string[]
}

export class PlayerProfile {
  private playerId: string
  private username: string
  private stats: PlayerStats
  private eloRating: number
  private tier: string
  private createdAt: number
  private lastUpdate: number

  constructor(playerId: string, username: string) {
    this.playerId = playerId
    this.username = username
    this.eloRating = 1200 // Start Rating
    this.tier = 'Bronze Circuit'
    this.createdAt = Date.now()
    this.lastUpdate = Date.now()

    this.stats = {
      totalMatches: 0,
      totalWins: 0,
      totalLosses: 0,
      winRate: 0,
      averageRating: 1200,
      highestRating: 1200,
      currentRating: 1200,
      preferredGameMode: 'ranked',
      favoriteTrack: 'Megacity',
      averageFinishPosition: 2.5,
      totalPlayTime: 0,
      longestWinStreak: 0,
      currentWinStreak: 0,
      trophies: []
    }
  }

  /**
   * Update Profile nach Match
   */
  updateAfterMatch(
    position: number,
    ratingChange: number,
    matchDuration: number,
    eloRatingBefore: number
  ): void {
    this.stats.totalMatches++
    this.stats.totalPlayTime += matchDuration

    if (position === 1) {
      this.stats.totalWins++
      this.stats.currentWinStreak++
      this.stats.longestWinStreak = Math.max(
        this.stats.longestWinStreak,
        this.stats.currentWinStreak
      )
    } else {
      this.stats.totalLosses++
      this.stats.currentWinStreak = 0
    }

    // Update ELO
    this.eloRating += ratingChange
    this.stats.currentRating = this.eloRating
    this.stats.highestRating = Math.max(this.stats.highestRating, this.eloRating)

    // Update Win Rate
    this.stats.winRate = (this.stats.totalWins / this.stats.totalMatches) * 100

    // Update Average Position
    this.stats.averageFinishPosition =
      (this.stats.averageFinishPosition * (this.stats.totalMatches - 1) + position) /
      this.stats.totalMatches

    this.lastUpdate = Date.now()

    // Check Trophy Achievements
    this.checkTrophyAchievements()
  }

  /**
   * Prüfe Trophy-Achievements
   */
  private checkTrophyAchievements(): void {
    if (this.stats.totalMatches === 10 && !this.stats.trophies.includes('First10')) {
      this.stats.trophies.push('First10') // 10 Matches Trophy
    }

    if (this.stats.totalWins === 10 && !this.stats.trophies.includes('FirstWins')) {
      this.stats.trophies.push('FirstWins') // 10 Wins Trophy
    }

    if (this.stats.currentWinStreak === 5 && !this.stats.trophies.includes('WinStreak5')) {
      this.stats.trophies.push('WinStreak5') // 5 Win Streak
    }

    if (this.stats.totalPlayTime > 3600 && !this.stats.trophies.includes('PlayTime1h')) {
      this.stats.trophies.push('PlayTime1h') // 1+ Hour Played
    }
  }

  /**
   * Hole Stats
   */
  getStats(): PlayerStats {
    return this.stats
  }

  /**
   * Hole ELO Rating
   */
  getELORating(): number {
    return this.eloRating
  }

  /**
   * Setze ELO Rating
   */
  setELORating(rating: number): void {
    this.eloRating = rating
    this.stats.currentRating = rating
  }

  /**
   * Hole Tier
   */
  getTier(): string {
    return this.tier
  }

  /**
   * Setze Tier
   */
  setTier(tier: string): void {
    this.tier = tier
  }

  /**
   * Hole Username
   */
  getUsername(): string {
    return this.username
  }

  /**
   * Hole Profil als JSON
   */
  toJSON(): any {
    return {
      playerId: this.playerId,
      username: this.username,
      eloRating: this.eloRating,
      tier: this.tier,
      stats: this.stats,
      createdAt: this.createdAt,
      lastUpdate: this.lastUpdate
    }
  }
}