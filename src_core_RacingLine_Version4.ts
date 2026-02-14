import * as THREE from 'three'

export class RacingLine {
  private waypoints: THREE.Vector3[] = []
  private idealLine: THREE.Vector3[] = []
  private lineGeometry: THREE.BufferGeometry | null = null

  constructor(waypoints: THREE.Vector3[]) {
    this.waypoints = waypoints
    this.calculateIdealLine()
  }

  /**
   * Berechne idealte Rennlinie durch Spline-Interpolation
   */
  private calculateIdealLine(): void {
    const curve = new THREE.CatmullRomCurve3(this.waypoints, true)
    this.idealLine = curve.getPoints(this.waypoints.length * 10)
  }

  /**
   * Finde nächsten Punkt auf der Rennlinie
   */
  getNearestPointOnLine(position: THREE.Vector3): THREE.Vector3 {
    let nearest = this.idealLine[0]
    let minDistance = Infinity

    this.idealLine.forEach(point => {
      const distance = position.distanceTo(point)
      if (distance < minDistance) {
        minDistance = distance
        nearest = point
      }
    })

    return nearest
  }

  /**
   * Berechne Abweichung von idealter Rennlinie
   */
  getLineDeviation(position: THREE.Vector3): number {
    const nearestPoint = this.getNearestPointOnLine(position)
    return position.distanceTo(nearestPoint)
  }

  /**
   * Hole nächsten Waypoint vor Position
   */
  getNextWaypoint(position: THREE.Vector3): THREE.Vector3 {
    const nearestPoint = this.getNearestPointOnLine(position)
    const nearestIndex = this.idealLine.indexOf(nearestPoint)

    if (nearestIndex < this.idealLine.length - 1) {
      return this.idealLine[nearestIndex + 1]
    }
    return this.idealLine[this.idealLine.length - 1]
  }

  /**
   * Visualisiere Rennlinie in Scene
   */
  visualizeInScene(scene: THREE.Scene): void {
    if (this.lineGeometry) this.lineGeometry.dispose()

    this.lineGeometry = new THREE.BufferGeometry()
    this.lineGeometry.setAttribute('position', new THREE.BufferAttribute(
      new Float32Array(this.idealLine.flatMap(v => [v.x, v.y, v.z])),
      3
    ))

    const material = new THREE.LineBasicMaterial({ color: 0xff00ff, linewidth: 2 })
    const line = new THREE.Line(this.lineGeometry, material)
    line.name = 'RacingLine'
    scene.add(line)
  }

  getIdealLine(): THREE.Vector3[] {
    return this.idealLine
  }

  dispose(): void {
    if (this.lineGeometry) this.lineGeometry.dispose()
    this.waypoints = []
    this.idealLine = []
  }
}