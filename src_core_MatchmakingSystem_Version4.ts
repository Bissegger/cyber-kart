export interface MatchmakingRequest {
  playerId: string
  skillRating: number
  preferredGameMode: 'ranked' | 'casual'
  timestamp: number
}

export interface MatchmakingPool {
  ranked: MatchmakingRequest[]
  casual: MatchmakingRequest[]
}

export class MatchmakingSystem {
  private pool: MatchmakingPool = {
    ranked: [],
    casual: []
  }

  private skillRatingBrackets = [
    { min: 0, max: 1200, name: 'Bronze' },
    { min: 1200, max: 1400, name: 'Silver' },
    { min: 1400, max: 1600, name: 'Gold' },
    { min: 1600, max: 1800, name: 'Platinum' },
    { min: 1800, max: 2000, name: 'Diamond' },
    { min: 2000, max: Infinity, name: 'Master' }
  ]

  private searchRadius: number = 200 // ELO Punkte für Skill-Matching

  /**
   * Füge Spieler zu Matchmaking hinzu
   */
  addPlayer(request: MatchmakingRequest): void {
    const pool = request.preferredGameMode === 'ranked' ? this.pool.ranked : this.pool.casual

    pool.push(request)
    console.log(`🎯 Spieler hinzugefügt zu ${request.preferredGameMode}. Pool-Größe: ${pool.length}`)
  }

  /**
   * Entferne Spieler aus Matchmaking
   */
  removePlayer(playerId: string, gameMode: 'ranked' | 'casual'): void {
    const pool = gameMode === 'ranked' ? this.pool.ranked : this.pool.casual
    const index = pool.findIndex(p => p.playerId === playerId)

    if (index > -1) {
      pool.splice(index, 1)
    }
  }

  /**
   * Finde Match für Spieler
   */
  findMatch(request: MatchmakingRequest, maxWaitTime: number = 30000): MatchmakingRequest[] | null {
    const pool = request.preferredGameMode === 'ranked' ? this.pool.ranked : this.pool.casual

    // Entferne Request aus Pool (wird im Match sein)
    const requestIndex = pool.findIndex(p => p.playerId === request.playerId)
    if (requestIndex > -1) {
      pool.splice(requestIndex, 1)
    }

    // Finde ähnlich bewertete Spieler
    const matches = pool.filter(candidate => {
      const skillDiff = Math.abs(candidate.skillRating - request.skillRating)
      const waitTime = Date.now() - candidate.timestamp

      // Skill-Matching: nah beieinander
      if (waitTime < maxWaitTime / 2) {
        return skillDiff < this.searchRadius
      }

      // Nach halber Zeit: größerer Radius
      return skillDiff < this.searchRadius * 2
    })

    // Brauchen mindestens 3 weitere Spieler
    if (matches.length < 3) {
      // Füge Original-Request wieder hinzu
      pool.push(request)
      return null
    }

    // Wähle beste 3 Matches
    const selectedMatches = matches
      .sort((a, b) => Math.abs(a.skillRating - request.skillRating) - Math.abs(b.skillRating - request.skillRating))
      .slice(0, 3)

    // Entferne ausgewählte Spieler aus Pool
    selectedMatches.forEach(match => {
      const index = pool.findIndex(p => p.playerId === match.playerId)
      if (index > -1) {
        pool.splice(index, 1)
      }
    })

    return [request, ...selectedMatches]
  }

  /**
   * Hole Skill-Rating-Klasse
   */
  getSkillBracket(rating: number): string {
    const bracket = this.skillRatingBrackets.find(b => rating >= b.min && rating < b.max)
    return bracket ? bracket.name : 'Unknown'
  }

  /**
   * Hole Pool-Statistiken
   */
  getPoolStats(): { ranked: number; casual: number } {
    return {
      ranked: this.pool.ranked.length,
      casual: this.pool.casual.length
    }
  }
}