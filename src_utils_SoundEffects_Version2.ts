export class SoundEffects {
  private audioManager: AudioManager

  constructor(audioManager: AudioManager) {
    this.audioManager = audioManager
  }

  /**
   * Spiele Item-Use Sound
   */
  async playItemUseSound(itemType: string): Promise<void> {
    const soundMap: { [key: string]: string } = {
      emp_pulse: '/sounds/emp-pulse.wav',
      cyber_mine: '/sounds/mine-place.wav',
      quantum_dash: '/sounds/dash.wav',
      shield: '/sounds/shield.wav',
      data_hack: '/sounds/hack.wav'
    }

    const soundUrl = soundMap[itemType] || ''
    if (soundUrl) {
      await this.audioManager.playSoundEffect(soundUrl, 0.7)
    }
  }

  /**
   * Spiele Kollisions-Sound
   */
  async playCollisionSound(force: number): Promise<void> {
    // Force: 0-1
    const volume = 0.3 + force * 0.5
    await this.audioManager.playSoundEffect('/sounds/collision.wav', volume)
  }

  /**
   * Spiele Boost-Sound
   */
  async playBoostSound(): Promise<void> {
    await this.audioManager.playSoundEffect('/sounds/boost.wav', 0.8)
    this.audioManager.activateBassDrop(0.5)
  }

  /**
   * Spiele Finish-Line Sound
   */
  async playFinishSound(position: number): Promise<void> {
    if (position === 1) {
      await this.audioManager.playSoundEffect('/sounds/victory.wav', 1.0)
    } else if (position <= 3) {
      await this.audioManager.playSoundEffect('/sounds/podium.wav', 0.8)
    } else {
      await this.audioManager.playSoundEffect('/sounds/finish.wav', 0.6)
    }
  }

  /**
   * Spiele UI-Click Sound
   */
  async playUIClick(): Promise<void> {
    await this.audioManager.playSoundEffect('/sounds/click.wav', 0.5)
  }

  /**
   * Spiele Matchmaking-Found Sound
   */
  async playMatchFoundSound(): Promise<void> {
    await this.audioManager.playSoundEffect('/sounds/match-found.wav', 0.8)
  }

  /**
   * Spiele Countdown Sound
   */
  async playCountdownSound(number: number): Promise<void> {
    const soundMap: { [key: number]: string } = {
      3: '/sounds/countdown-3.wav',
      2: '/sounds/countdown-2.wav',
      1: '/sounds/countdown-1.wav'
    }

    const soundUrl = soundMap[number] || ''
    if (soundUrl) {
      await this.audioManager.playSoundEffect(soundUrl, 0.7)
    }
  }

  /**
   * Spiele Race-Start Sound
   */
  async playRaceStartSound(): Promise<void> {
    await this.audioManager.playSoundEffect('/sounds/race-start.wav', 1.0)
  }
}