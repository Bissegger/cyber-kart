import * as THREE from 'three'

export class HighwaySegment {
  private scene: THREE.Scene
  private segments: THREE.Mesh[] = []

  constructor(scene: THREE.Scene) {
    this.scene = scene
  }

  /**
   * Erstelle schwebenden Autobahn-Abschnitt
   */
  createFloatingHighway(
    startPosition: THREE.Vector3,
    length: number,
    height: number = 100
  ): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(20, 2, length)

    const material = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.6,
      roughness: 0.3,
      emissive: 0x00ff88,
      emissiveIntensity: 0.2
    })

    const highway = new THREE.Mesh(geometry, material)
    highway.position.copy(startPosition)
    highway.position.y = height
    highway.castShadow = true
    highway.receiveShadow = true
    highway.name = 'FloatingHighway'

    this.scene.add(highway)
    this.segments.push(highway)

    // Füge Support-Säulen hinzu
    this.addSupportPillars(startPosition, length, height)

    return highway
  }

  /**
   * Erstelle Support-Säulen für Autobahn
   */
  private addSupportPillars(
    position: THREE.Vector3,
    length: number,
    height: number
  ): void {
    const pillarSpacing = 50
    const pillarGeometry = new THREE.CylinderGeometry(3, 3, height, 16)
    const pillarMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a0e27,
      metalness: 0.7,
      roughness: 0.2
    })

    for (let z = -length / 2; z < length / 2; z += pillarSpacing) {
      const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial)
      pillar.position.set(position.x, position.y - height / 2, position.z + z)
      pillar.castShadow = true
      pillar.receiveShadow = true
      this.scene.add(pillar)
      this.segments.push(pillar)
    }
  }

  getSegments(): THREE.Mesh[] {
    return this.segments
  }

  dispose(): void {
    this.segments.forEach(segment => {
      segment.geometry.dispose()
      if (Array.isArray(segment.material)) {
        segment.material.forEach(m => m.dispose())
      } else {
        segment.material.dispose()
      }
    })
    this.segments = []
  }
}