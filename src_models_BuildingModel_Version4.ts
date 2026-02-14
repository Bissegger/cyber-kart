import * as THREE from 'three'

export class BuildingModel {
  private scene: THREE.Scene
  private buildings: THREE.Mesh[] = []

  constructor(scene: THREE.Scene) {
    this.scene = scene
  }

  /**
   * Erstelle eine Neon-Hochhaus
   */
  createBuilding(
    position: THREE.Vector3,
    width: number,
    height: number,
    depth: number,
    color: THREE.Color
  ): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(width, height, depth)

    // Neon-Material mit Emissive Light
    const material = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.8,
      roughness: 0.2,
      emissive: color,
      emissiveIntensity: 0.6
    })

    const building = new THREE.Mesh(geometry, material)
    building.position.copy(position)
    building.castShadow = true
    building.receiveShadow = true
    building.name = 'Building'

    this.scene.add(building)
    this.buildings.push(building)

    // Füge Fenster hinzu
    this.addWindowsToBuilding(building, width, height, depth)

    return building
  }

  /**
   * Füge leuchtende Fenster hinzu
   */
  private addWindowsToBuilding(
    building: THREE.Mesh,
    width: number,
    height: number,
    depth: number
  ): void {
    const windowSpacing = 5
    const windowSize = 2

    for (let x = -width / 2; x < width / 2; x += windowSpacing) {
      for (let y = 0; y < height; y += windowSpacing) {
        const windowGeometry = new THREE.PlaneGeometry(windowSize, windowSize)
        const windowMaterial = new THREE.MeshBasicMaterial({
          color: 0xffff00,
          emissive: 0xffff00,
          emissiveIntensity: 0.8
        })

        const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial)
        windowMesh.position.set(x, y - height / 2 + 2, depth / 2 + 0.1)
        building.add(windowMesh)
      }
    }
  }

  /**
   * Erstelle Skyline (mehrere Gebäude)
   */
  createSkyline(): void {
    const buildingConfigs = [
      { pos: new THREE.Vector3(-100, 0, -50), w: 40, h: 200, d: 40, color: new THREE.Color(0xff00ff) },
      { pos: new THREE.Vector3(-30, 0, -100), w: 30, h: 150, d: 30, color: new THREE.Color(0x00ffff) },
      { pos: new THREE.Vector3(50, 0, -80), w: 50, h: 250, d: 40, color: new THREE.Color(0x00ff88) },
      { pos: new THREE.Vector3(120, 0, -20), w: 35, h: 180, d: 35, color: new THREE.Color(0xff0088) },
    ]

    buildingConfigs.forEach(config => {
      this.createBuilding(config.pos, config.w, config.h, config.d, config.color)
    })
  }

  getBuildings(): THREE.Mesh[] {
    return this.buildings
  }

  dispose(): void {
    this.buildings.forEach(building => {
      building.geometry.dispose()
      if (Array.isArray(building.material)) {
        building.material.forEach(m => m.dispose())
      } else {
        building.material.dispose()
      }
    })
    this.buildings = []
  }
}