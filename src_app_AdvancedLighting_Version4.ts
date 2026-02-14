import * as THREE from 'three'

export class AdvancedLighting {
  private scene: THREE.Scene
  private directionalLight: THREE.DirectionalLight | null = null
  private shadowMapSize: number = 2048

  constructor(scene: THREE.Scene) {
    this.scene = scene
  }

  /**
   * Setup Dynamic Shadows
   */
  setupDynamicShadows(): void {
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    this.directionalLight.position.set(100, 100, 100)

    // Shadow configuration
    this.directionalLight.castShadow = true
    this.directionalLight.shadow.mapSize.width = this.shadowMapSize
    this.directionalLight.shadow.mapSize.height = this.shadowMapSize
    this.directionalLight.shadow.camera.left = -300
    this.directionalLight.shadow.camera.right = 300
    this.directionalLight.shadow.camera.top = 300
    this.directionalLight.shadow.camera.bottom = -300
    this.directionalLight.shadow.camera.near = 0.5
    this.directionalLight.shadow.camera.far = 500

    // Better shadow quality
    this.directionalLight.shadow.bias = -0.0001
    this.directionalLight.shadow.mapSize.width = 4096
    this.directionalLight.shadow.mapSize.height = 4096

    this.scene.add(this.directionalLight)
  }

  /**
   * Update Dynamic Shadows basierend auf Zeit
   */
  updateShadowsForTime(timeOfDay: number): void {
    if (!this.directionalLight) return

    // timeOfDay: 0-1 (0=midnight, 0.5=noon)
    const sunHeight = Math.sin(timeOfDay * Math.PI) * 150 + 50
    const sunAngle = timeOfDay * Math.PI * 2

    this.directionalLight.position.set(
      Math.cos(sunAngle) * 150,
      sunHeight,
      Math.sin(sunAngle) * 150
    )

    // Intensity basierend auf Zeit
    const intensity = Math.max(0.2, Math.sin(timeOfDay * Math.PI))
    this.directionalLight.intensity = intensity

    // Color basierend auf Zeit (Sunrise/Sunset)
    if (timeOfDay < 0.25) {
      // Night/Early morning
      this.directionalLight.color.setHex(0x4488ff)
    } else if (timeOfDay < 0.35) {
      // Sunrise
      this.directionalLight.color.setHex(0xff8844)
    } else if (timeOfDay < 0.65) {
      // Day
      this.directionalLight.color.setHex(0xffffff)
    } else if (timeOfDay < 0.75) {
      // Sunset
      this.directionalLight.color.setHex(0xff6644)
    } else {
      // Night
      this.directionalLight.color.setHex(0x4488ff)
    }
  }

  /**
   * Setup Bloom Effect
   */
  setupBloom(renderer: THREE.WebGLRenderer, camera: THREE.Camera): THREE.ShaderPass {
    // Würde mit post-processing library implementiert
    // z.B. drei-postprocessing
    const bloomPass = new (window as any).THREE.ShaderPass(
      new (window as any).THREE.ShaderLib['bloom'],
      'tDiffuse'
    )

    return bloomPass
  }

  /**
   * Setup Ambient Occlusion
   */
  setupAmbientOcclusion(scene: THREE.Scene, renderer: THREE.WebGLRenderer): void {
    // SSAO (Screen Space Ambient Occlusion)
    // Würde mit post-processing library implementiert
  }

  /**
   * Erstelle Neon-Glow-Effekt
   */
  createNeonGlow(mesh: THREE.Mesh, color: THREE.Color): void {
    // Add emissive material
    mesh.material instanceof THREE.Material &&
      ((mesh.material as THREE.MeshStandardMaterial).emissive = color)
    ((mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6)

    // Add glow in post-processing (würde implementiert mit Bloom)
  }

  /**
   * Setup Screen Space Reflections
   */
  setupSSR(scene: THREE.Scene): void {
    // Screen Space Reflections für zusätzliche Realismus
    // Würde mit Custom ShaderMaterial implementiert
  }

  /**
   * Update Lighting basierend auf Wetter
   */
  updateLightingForWeather(rainIntensity: number, fogIntensity: number): void {
    if (!this.directionalLight) return

    // Bei Regen: dunkleres Licht
    const weatherIntensity = Math.max(rainIntensity, fogIntensity)
    this.directionalLight.intensity = Math.max(0.3, 0.8 - weatherIntensity * 0.4)

    // Bei Nebel: weniger contrast shadows
    const shadowBias = -0.0001 - fogIntensity * 0.0005
    this.directionalLight.shadow.bias = shadowBias
  }

  dispose(): void {
    if (this.directionalLight) {
      this.scene.remove(this.directionalLight)
    }
  }
}