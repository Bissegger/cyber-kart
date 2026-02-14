import * as THREE from 'three'

export class LightingSystem {
  private scene: THREE.Scene
  private ambientLight: THREE.AmbientLight
  private directionalLight: THREE.DirectionalLight
  private neonLights: THREE.Light[] = []

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
    this.setupLighting()
  }

  /**
   * Setup grundlegende Beleuchtung
   */
  private setupLighting(): void {
    // Ambient Light
    this.ambientLight.intensity = 0.4
    this.scene.add(this.ambientLight)

    // Directional Light (Sonne/Mond)
    this.directionalLight.position.set(100, 100, 100)
    this.directionalLight.castShadow = true
    this.directionalLight.shadow.camera.left = -300
    this.directionalLight.shadow.camera.right = 300
    this.directionalLight.shadow.camera.top = 300
    this.directionalLight.shadow.camera.bottom = -300
    this.directionalLight.shadow.mapSize.width = 2048
    this.directionalLight.shadow.mapSize.height = 2048
    this.scene.add(this.directionalLight)
  }

  /**
   * Füge Neon-Punkt-Lichter hinzu
   */
  addNeonLight(
    position: THREE.Vector3,
    color: THREE.Color | number,
    intensity: number = 1.5,
    distance: number = 100
  ): THREE.PointLight {
    const light = new THREE.PointLight(color, intensity, distance)
    light.position.copy(position)
    light.castShadow = true
    this.scene.add(light)
    this.neonLights.push(light)

    return light
  }

  /**
   * Erstelle Neon-Lichter-Set für Cyberpunk-Umgebung
   */
  createCyberpunkLighting(): void {
    // Grüne Neon-Lichter
    this.addNeonLight(new THREE.Vector3(50, 30, 50), 0x00ff88, 2, 150)
    this.addNeonLight(new THREE.Vector3(-50, 30, 100), 0x00ff88, 1.5, 120)

    // Magenta-Neon-Lichter
    this.addNeonLight(new THREE.Vector3(0, 30, 200), 0xff00ff, 2, 150)
    this.addNeonLight(new THREE.Vector3(100, 30, 150), 0xff00ff, 1.5, 120)

    // Cyan-Neon-Lichter
    this.addNeonLight(new THREE.Vector3(-100, 30, 0), 0x00ffff, 1.8, 140)
    this.addNeonLight(new THREE.Vector3(75, 25, 250), 0x00ffff, 1.5, 120)
  }

  /**
   * Update Lichter-Intensität (z.B. für Pulsing-Effekt)
   */
  update(time: number): void {
    this.neonLights.forEach((light, index) => {
      const originalIntensity = [2, 1.5, 2, 1.5, 1.8, 1.5][index] || 1.5
      light.intensity = originalIntensity + Math.sin(time * 2 + index) * 0.3
    })
  }

  getNeonLights(): THREE.Light[] {
    return this.neonLights
  }

  dispose(): void {
    this.scene.remove(this.ambientLight)
    this.scene.remove(this.directionalLight)
    this.neonLights.forEach(light => this.scene.remove(light))
    this.neonLights = []
  }
}