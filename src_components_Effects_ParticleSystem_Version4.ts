import * as THREE from 'three'

export class ParticleSystem {
  private scene: THREE.Scene
  private particles: THREE.Points[] = []

  constructor(scene: THREE.Scene) {
    this.scene = scene
  }

  /**
   * Erstelle Partikel-System für Umgebung
   */
  createAmbientParticles(): void {
    const particleCount = 100
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)

    // Random Positionen
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 300
      positions[i + 1] = Math.random() * 200
      positions[i + 2] = (Math.random() - 0.5) * 300
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({
      color: 0x00ff88,
      size: 2,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.6
    })

    const particles = new THREE.Points(geometry, material)
    particles.name = 'AmbientParticles'
    this.scene.add(particles)
    this.particles.push(particles)
  }

  /**
   * Erstelle Partikel-Explosion
   */
  createExplosion(position: THREE.Vector3, color: THREE.Color = new THREE.Color(0xff00ff)): void {
    const particleCount = 50
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = position.x
      positions[i * 3 + 1] = position.y
      positions[i * 3 + 2] = position.z

      // Zufällige Geschwindigkeiten
      velocities[i * 3] = (Math.random() - 0.5) * 10
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 10
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 10
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.userData.velocities = velocities

    const material = new THREE.PointsMaterial({
      color: color,
      size: 2,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8
    })

    const particles = new THREE.Points(geometry, material)
    this.scene.add(particles)
    this.particles.push(particles)
  }

  /**
   * Update Partikel-Animation
   */
  update(deltaTime: number): void {
    this.particles.forEach(particle => {
      if (particle.geometry.userData.velocities) {
        const positions = particle.geometry.attributes.position.array as Float32Array
        const velocities = particle.geometry.userData.velocities as Float32Array

        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += velocities[i] * deltaTime
          positions[i + 1] += velocities[i + 1] * deltaTime
          positions[i + 2] += velocities[i + 2] * deltaTime
        }

        particle.geometry.attributes.position.needsUpdate = true
      }
    })
  }

  getParticles(): THREE.Points[] {
    return this.particles
  }

  dispose(): void {
    this.particles.forEach(particle => {
      particle.geometry.dispose()
      if (Array.isArray(particle.material)) {
        particle.material.forEach(m => m.dispose())
      } else {
        particle.material.dispose()
      }
    })
    this.particles = []
  }
}