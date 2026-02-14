import * as THREE from 'three'

export interface TrackSegment {
  position: THREE.Vector3
  rotation: THREE.Euler
  scale: THREE.Vector3
  type: 'straight' | 'curve' | 'loop' | 'jump' | 'tunnel'
}

export class TrackModel {
  private scene: THREE.Scene
  private segments: TrackSegment[] = []
  private trackMesh: THREE.Group
  private collisionMeshes: THREE.Mesh[] = []

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.trackMesh = new THREE.Group()
    this.trackMesh.name = 'Track'
    this.scene.add(this.trackMesh)
  }

  /**
   * Erstelle grundlegende Streckenstruktur
   */
  createBaseTrack(): void {
    const trackWidth = 20
    const trackLength = 500

    // Hauptstrecke (gerade Sektion)
    const straightGeometry = new THREE.PlaneGeometry(trackWidth, trackLength)
    const straightMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.7,
      metalness: 0.2
    })
    const straightMesh = new THREE.Mesh(straightGeometry, straightMaterial)
    straightMesh.receiveShadow = true
    straightMesh.castShadow = true
    this.trackMesh.add(straightMesh)

    // Kurve (90° Turn)
    const curveGeometry = new THREE.PlaneGeometry(trackWidth, trackWidth)
    const curveMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f3460,
      roughness: 0.7,
      metalness: 0.2
    })
    const curveMesh = new THREE.Mesh(curveGeometry, curveMaterial)
    curveMesh.position.set(trackWidth / 2 + 10, 0, trackLength / 2)
    curveMesh.receiveShadow = true
    curveMesh.castShadow = true
    this.trackMesh.add(curveMesh)
  }

  /**
   * Füge Neon-Linien entlang der Strecke hinzu
   */
  addNeonMarkings(): void {
    const neonGeometry = new THREE.BufferGeometry()
    const positions: number[] = []

    // Center Line
    for (let i = 0; i < 500; i += 5) {
      positions.push(0, 0.01, -i)
      positions.push(0, 0.01, -(i + 5))
    }

    neonGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))

    const neonMaterial = new THREE.LineBasicMaterial({
      color: 0x00ff88,
      linewidth: 3,
      fog: false
    })

    const neonLine = new THREE.LineSegments(neonGeometry, neonMaterial)
    neonLine.name = 'NeonMarkings'
    this.trackMesh.add(neonLine)
  }

  /**
   * Erstelle Kollisions-Meshes für Physik
   */
  createCollisionMeshes(): void {
    const collisionGeometry = new THREE.BoxGeometry(20, 0.5, 500)
    const collisionMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0
    })

    const collisionMesh = new THREE.Mesh(collisionGeometry, collisionMaterial)
    collisionMesh.name = 'TrackCollision'
    collisionMesh.userData.isCollider = true
    this.trackMesh.add(collisionMesh)
    this.collisionMeshes.push(collisionMesh)
  }

  /**
   * Hole alle Kollisions-Meshes
   */
  getCollisionMeshes(): THREE.Mesh[] {
    return this.collisionMeshes
  }

  /**
   * Hole das Track-Objekt
   */
  getTrackMesh(): THREE.Group {
    return this.trackMesh
  }

  update(deltaTime: number): void {
    // Update track animations hier
  }

  dispose(): void {
    this.trackMesh.clear()
  }
}