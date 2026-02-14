export class AudioManager {
  private audioContext: AudioContext
  private masterGain: GainNode
  private musicGain: GainNode
  private sfxGain: GainNode

  private currentTrack: AudioBufferSourceNode | null = null
  private trackBuffer: AudioBuffer | null = null
  private currentIntensity: number = 0 // 0-1
  private targetIntensity: number = 0
  private isPlaying: boolean = false

  // Frequency analyzers
  private analyser: AnalyserNode
  private dataArray: Uint8Array

  constructor() {
    // Initialize Web Audio API
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    // Create main gain nodes
    this.masterGain = this.audioContext.createGain()
    this.masterGain.gain.value = 0.8

    this.musicGain = this.audioContext.createGain()
    this.sfxGain = this.audioContext.createGain()

    this.masterGain.connect(this.audioContext.destination)
    this.musicGain.connect(this.masterGain)
    this.sfxGain.connect(this.masterGain)

    // Create analyser for frequency visualization
    this.analyser = this.audioContext.createAnalyser()
    this.analyser.fftSize = 256
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)
    this.musicGain.connect(this.analyser)
  }

  /**
   * Lade Musik-Track
   */
  async loadTrack(url: string): Promise<void> {
    try {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      this.trackBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
      console.log(`✅ Musik geladen: ${url}`)
    } catch (error) {
      console.error('❌ Fehler beim Laden der Musik:', error)
    }
  }

  /**
   * Spiele Musik ab
   */
  playTrack(loop: boolean = true): void {
    if (!this.trackBuffer || this.isPlaying) return

    this.currentTrack = this.audioContext.createBufferSource()
    this.currentTrack.buffer = this.trackBuffer
    this.currentTrack.loop = loop

    this.currentTrack.connect(this.musicGain)
    this.currentTrack.start(0)

    this.isPlaying = true
    console.log('🎵 Musik abgespielt')
  }

  /**
   * Stoppe Musik ab
   */
  stopTrack(): void {
    if (this.currentTrack) {
      this.currentTrack.stop()
      this.isPlaying = false
      console.log('⏹️ Musik gestoppt')
    }
  }

  /**
   * Update Musik-Intensität basierend auf Rennposition
   */
  updateIntensityForRacePosition(playerPosition: number, totalPlayers: number): void {
    // Position 1 = höchste Intensität
    this.targetIntensity = 1 - (playerPosition - 1) / (totalPlayers - 1)
  }

  /**
   * Update Musik (interpoliere Intensität)
   */
  update(deltaTime: number): void {
    // Smooth interpolation
    const lerpSpeed = 0.05
    this.currentIntensity += (this.targetIntensity - this.currentIntensity) * lerpSpeed

    // Apply intensity through filters/effects
    this.applyIntensityEffect(this.currentIntensity)

    // Update frequency data for visualization
    this.analyser.getByteFrequencyData(this.dataArray)
  }

  /**
   * Wende Intensitäts-Effekt an
   */
  private applyIntensityEffect(intensity: number): void {
    // Musik wird lauter wenn in Führung
    const volumeMultiplier = 0.6 + intensity * 0.4
    this.musicGain.gain.value = volumeMultiplier

    // Könnte auch EQ-Filter anpassen basierend auf Intensität
  }

  /**
   * Aktiviere Bass-Drop bei Boost
   */
  activateBassDrop(duration: number = 1.0): void {
    // Erstelle tiefen Bass-Sound
    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()

    osc.type = 'sine'
    osc.frequency.value = 60 // Tiefe Frequenz

    osc.connect(gain)
    gain.connect(this.masterGain)

    // Fade in/out
    const now = this.audioContext.currentTime
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.3, now + 0.1)
    gain.gain.linearRampToValueAtTime(0, now + duration)

    osc.start(now)
    osc.stop(now + duration)

    console.log('🎸 Bass-Drop aktiviert!')
  }

  /**
   * Spiele Sound-Effekt ab
   */
  async playSoundEffect(url: string, volume: number = 0.5): Promise<void> {
    try {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      const buffer = await this.audioContext.decodeAudioData(arrayBuffer)

      const source = this.audioContext.createBufferSource()
      source.buffer = buffer

      const gain = this.audioContext.createGain()
      gain.gain.value = volume

      source.connect(gain)
      gain.connect(this.sfxGain)

      source.start(0)
    } catch (error) {
      console.error('❌ SFX Fehler:', error)
    }
  }

  /**
   * Spiele Motor-Sound ab (looped)
   */
  playEngineSound(speed: number): void {
    // Würde einen looped engine sound mit speed-basierter Tonhöhe spielen
    const pitch = 0.5 + (speed / 50) * 1.5 // Speed-abhängige Tonhöhe
  }

  /**
   * Gib Frequenz-Daten (für Visualisierung)
   */
  getFrequencyData(): Uint8Array {
    return this.dataArray
  }

  /**
   * Setze Master-Volumen
   */
  setMasterVolume(volume: number): void {
    this.masterGain.gain.value = Math.max(0, Math.min(1, volume))
  }

  /**
   * Setze Musik-Volumen
   */
  setMusicVolume(volume: number): void {
    this.musicGain.gain.value = Math.max(0, Math.min(1, volume))
  }

  /**
   * Setze SFX-Volumen
   */
  setSFXVolume(volume: number): void {
    this.sfxGain.gain.value = Math.max(0, Math.min(1, volume))
  }

  dispose(): void {
    this.stopTrack()
    this.audioContext.close()
  }
}