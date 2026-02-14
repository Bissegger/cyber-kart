import * as THREE from 'three'

export class CollisionSystem {
  private raycaster: THREE.Raycaster
  private colliders: THREE.Mesh[] = []

  constructor() {
    this.raycaster = new THREE.Raycaster()
  }

  /**
   * Registriere Collision-Objekt
   */
  registerCollider(mesh: THREE.Mesh): void {
    this.colliders.push(mesh)
  }

  /**
   * Prüfe Kollision zwischen zwei Objekten
   */
  checkCollision(object1: THREE.Mesh, object2: THREE.Mesh): boolean {
    const box1 = new THREE.Box3().setFromObject(object1)
    const box2 = new THREE.Box3().setFromObject(object2)
    return box1.intersectsBox(box2)
  }

  /**
   * Prüfe ob Position off-track ist
   */
  isOffTrack(position: THREE.Vector3): boolean {
    // Einfache Implementierung: wenn Y < -10, dann off-track
    return position.y < -10
  }

  /**
   * Finde nächsten Collider zu Position
   */
  getNearestCollider(position: THREE.Vector3): THREE.Mesh | null {
    let nearest: THREE.Mesh | null = null
    let minDistance = Infinity

    this.colliders.forEach(collider => {
      const distance = position.distanceTo(collider.position)
      if (distance < minDistance) {
        minDistance = distance
        nearest = collider
      }
    })

    return nearest
  }

  getColliders(): THREE.Mesh[] {
    return this.colliders
  }
}