import * as THREE from 'three'

export class LightningEffect {
  private scene: THREE.Scene
  private camera: THREE.Camera

  constructor(scene: THREE.Scene, camera: THREE.Camera) {
    this.scene = scene
    this.camera = camera
  }

  /**
   * Erstelle Blitz
   */
  createLightning(
    startPosition: THREE.Vector3,
    endPosition: THREE.Vector3,
    color: THREE.Color = new THREE.Color(0xccccff)
  ): void {
    // Hauptblitz-Linie
    const mainBolt = this.createBolt(startPosition, endPosition, color, 1)
    this.scene.add(mainBolt)

    // Sekundärer Blitz (Verzweigung)
    const midpoint = startPosition.clone().lerp(endPosition, 0.4)
    const offset = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).multiplyScalar(30)
    const secondaryEnd = endPosition.clone().add(offset)
    const secondaryBolt = this.createBolt(midpoint, secondaryEnd, color, 0.6)
    this.scene.add(secondaryBolt)

    // Sound
    this.playThunderSound()

    // Flash-Effekt (Hell-Blitz)
    this.createFlash()

    // Entferne nach kurzer Zeit
    setTimeout(() => {
      this.scene.remove(mainBolt)
      this.scene.remove(secondaryBolt)
      mainBolt.geometry.dispose()
      secondaryBolt.geometry.dispose()
    }, 100)
  }

  /**
   * Erstelle einzelne Blitz-Linie
   */
  private createBolt(start: THREE.Vector3, end: THREE.Vector3, color: THREE.Color, opacity: number): THREE.Line {
    const points = [start.clone()]

    // Generate jagged path
    const segments = 10
    for (let i = 1; i < segments; i++) {
      const t = i / segments
      const point = start.clone().lerp(end, t)

      // Add randomness (jag)
      const perpendicular = new THREE.Vector3()
        .crossVectors(end.clone().sub(start), new THREE.Vector3(0, 1, 0))
        .normalize()

      const jag = Math.random() - 0.5
      point.addScaledVector(perpendicular, jag * 20)

      points.push(point)
    }

    points.push(end.clone())

    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({
      color,
      linewidth: 3,
      transparent: true,
      opacity
    })

    return new THREE.Line(geometry, material)
  }

  /**
   * Erstelle Flash-Effekt (Screen-Aufhellung)
   */
  private createFlash(): void {
    const overlay = document.createElement('div')
    overlay.style.position = 'fixed'
    overlay.style.top = '0'
    overlay.style.left = '0'
    overlay.style.width = '100%'
    overlay.style.height = '100%'
    overlay.style.backgroundColor = 'white'
    overlay.style.opacity = '0.8'
    overlay.style.pointerEvents = 'none'
    overlay.style.zIndex = '999'

    document.body.appendChild(overlay)

    // Fade out
    let opacity = 0.8
    const fadeInterval = setInterval(() => {
      opacity -= 0.1
      overlay.style.opacity = opacity.toString()

      if (opacity <= 0) {
        clearInterval(fadeInterval)
        document.body.removeChild(overlay)
      }
    }, 50)
  }

  /**
   * Spiele Thunder-Sound ab
   */
  private playThunderSound(): void {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const now = audioContext.currentTime

    // Erstelle Thunder-Sound mit Oszillator
    const osc = audioContext.createOscillator()
    const gain = audioContext.createGain()

    osc.connect(gain)
    gain.connect(audioContext.destination)

    osc.frequency.setValueAtTime(150, now)
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.5)

    gain.gain.setValueAtTime(0.3, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5)

    osc.start(now)
    osc.stop(now + 0.5)
  }

  /**
   * Erstelle Wetter-Event (mehrere Blitze)
   */
  createThunderstorm(duration: number = 5): void {
    const strikeInterval = setInterval(() => {
      const start = new THREE.Vector3(
        (Math.random() - 0.5) * 500,
        200,
        (Math.random() - 0.5) * 500
      )

      const end = start.clone()
      end.y = -50
      end.addScaledVector(
        new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5),
        50
      )

      this.createLightning(start, end)
    }, 1000 + Math.random() * 2000)

    setTimeout(() => {
      clearInterval(strikeInterval)
    }, duration * 1000)
  }
}