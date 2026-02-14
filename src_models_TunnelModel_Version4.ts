import * as THREE from 'three'

export class TunnelModel {
  private scene: THREE.Scene
  private tunnels: THREE.Mesh[] = []

  constructor(scene: THREE.Scene) {
    this.scene = scene
  }

  /**
   * Erstelle einen Tunnel-Abschnitt
   */
  createTunnel(
    position: THREE.Vector3,
    length: number,
    radius: number = 15
  ): THREE.Mesh {
    // Tunnel als Zylinder
    const geometry = new THREE.CylinderGeometry(radius, radius, length, 32, 1, true)

    const material = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.5,
      roughness: 0.4,
      side: THREE.BackSide // Kamera ist innen
    })

    const tunnel = new THREE.Mesh(geometry, material)
    tunnel.position.copy(position)
    tunnel.rotation.z = Math.PI / 2
    tunnel.castShadow = true
    tunnel.receiveShadow = true
    tunnel.name = 'Tunnel'

    this.scene.add(tunnel)
    this.tunnels.push(tunnel)

    // Füge Tunnel-Lichter hinzu
    this.addTunnelLights(tunnel, position, length)

    return tunnel
  }

  /**
   * Füge Lichter im Tunnel hinzu
   */
  private addTunnelLights(tunnel: THREE.Mesh, position: THREE.Vector3, length: number): void {
    const lightSpacing = 20

    for (let z = -length / 2; z < length / 2; z += lightSpacing) {
      const light = new THREE.PointLight(0x00ff88, 1.5, 50)
      light.position.set(position.x, position.y + 10, position.z + z)
      tunnel.add(light)

      // Visuelle Darstellung der Lichter
      const lightGeometry = new THREE.SphereGeometry(1, 8, 8)
      const lightMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff88,
        emissive: 0x00ff88
      })
      const lightMesh = new THREE.Mesh(lightGeometry, lightMaterial)
      lightMesh.position.set(0, 10, z - position.z)
      tunnel.add(lightMesh)
    }
  }

  getTunnels(): THREE.Mesh[] {
    return this.tunnels
  }

  dispose(): void {
    this.tunnels.forEach(tunnel => {
      tunnel.geometry.dispose()
      if (Array.isArray(tunnel.material)) {
        tunnel.material.forEach(m => m.dispose())
      } else {
        tunnel.material.dispose()
      }
    })
    this.tunnels = []
  }
}