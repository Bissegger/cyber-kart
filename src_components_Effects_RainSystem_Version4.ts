import * as THREE from 'three'

export class RainSystem {
  private rainParticles: THREE.Points | null = null
  private rainIntensity: number = 0 // 0-1
  private windForce: THREE.Vector3 = new THREE.Vector3(5, 0, 0)
  private scene: THREE.Scene
  private camera: THREE.Camera

  constructor(scene: THREE.Scene, camera: THREE.Camera) {
    this.scene = scene
    this.camera = camera
  }

  /**
   * Initialisiere Regen-System
   */
  initialize(): void {
    const particleCount = 5000
    const geometry = new THREE.BufferGeometry()

    // Regentropfen Positionen
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 500      // X
      positions[i + 1] = Math.random() * 200          // Y
      positions[i + 2] = (Math.random() - 0.5) * 500  // Z

      velocities[i] = 0                               // X velocity
      velocities[i + 1] = -50                         // Y velocity (nach unten)
      velocities[i + 2] = 0                           // Z velocity
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.userData.velocities = velocities

    const material = new THREE.PointsMaterial({
      color: 0x88ccff,
      size: 0.3,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.6,
      fog: true
    })

    this.rainParticles = new THREE.Points(geometry, material)
    this.rainParticles.name = 'RainParticles'
    this.scene.add(this.rainParticles)
  }

  /**
   * Update Regen (mit Wind)
   */
  update(deltaTime: number): void {
    if (!this.rainParticles) return

    const positions = this.rainParticles.geometry.attributes.position.array as Float32Array
    const velocities = this.rainParticles.geometry.userData.velocities as Float32Array
    const cameraPos = this.camera.position

    // Update Regentropfen
    for (let i = 0; i < positions.length; i += 3) {
      // Bewegung anwenden
      positions[i] += velocities[i] * deltaTime + this.windForce.x * deltaTime * 0.1      // X
      positions[i + 1] += velocities[i + 1] * deltaTime                                   // Y
      positions[i + 2] += velocities[i + 2] * deltaTime + this.windForce.z * deltaTime * 0.1 // Z

      // Wenn Tropfen unten angekommen, recyclen
      if (positions[i + 1] < cameraPos.y - 50) {
        positions[i + 1] = cameraPos.y + 100
      }

      // Wenn zu weit weg, recyclen
      if (Math.abs(positions[i] - cameraPos.x) > 300) {
        positions[i] = cameraPos.x + (Math.random() - 0.5) * 200
      }
      if (Math.abs(positions[i + 2] - cameraPos.z) > 300) {
        positions[i + 2] = cameraPos.z + (Math.random() - 0.5) * 200
      }
    }

    this.rainParticles.geometry.attributes.position.needsUpdate = true
  }

  /**
   * Setze Regen-Intensität
   */
  setIntensity(intensity: number): void {
    this.rainIntensity = Math.max(0, Math.min(1, intensity))

    if (this.rainParticles) {
      const material = this.rainParticles.material as THREE.PointsMaterial
      material.opacity = 0.6 * this.rainIntensity
      material.size = 0.3 + this.rainIntensity * 0.2
    }
  }

  /**
   * Setze Wind-Kraft
   */
  setWind(windVector: THREE.Vector3): void {
    this.windForce.copy(windVector)
  }

  /**
   * Gib Regen-Intensität
   */
  getIntensity(): number {
    return this.rainIntensity
  }

  dispose(): void {
    if (this.rainParticles) {
      this.rainParticles.geometry.dispose()
      if (Array.isArray(this.rainParticles.material)) {
        this.rainParticles.material.forEach(m => m.dispose())
      } else {
        this.rainParticles.material.dispose()
      }
      this.scene.remove(this.rainParticles)
    }
  }
}