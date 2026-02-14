import * as THREE from 'three'

export interface PathNode {
  position: THREE.Vector3
  neighbors: PathNode[]
  g: number // Cost von Start
  h: number // Heuristic zu Goal
  f: number // g + h
  parent: PathNode | null
}

export class Pathfinding {
  private nodes: Map<string, PathNode> = new Map()
  private trackWaypoints: THREE.Vector3[] = []

  constructor() {
    this.generateTrackWaypoints()
  }

  /**
   * Generiere Wegpunkte entlang der Rennstrecke
   */
  private generateTrackWaypoints(): void {
    // Vereinfachte Strecken-Wegpunkte (in real project würde man diese manuell setzen)
    const waypointPositions = [
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 1, 50),
      new THREE.Vector3(0, 1, 100),
      new THREE.Vector3(20, 1, 150),
      new THREE.Vector3(40, 1, 200),
      new THREE.Vector3(40, 1, 250),
      new THREE.Vector3(20, 1, 300),
      new THREE.Vector3(0, 1, 350),
      new THREE.Vector3(-20, 1, 400),
      new THREE.Vector3(-40, 1, 450),
      new THREE.Vector3(-40, 1, 500),
      new THREE.Vector3(0, 1, 500),
    ]

    waypointPositions.forEach((pos, index) => {
      const nodeId = `waypoint_${index}`
      const node: PathNode = {
        position: pos.clone(),
        neighbors: [],
        g: 0,
        h: 0,
        f: 0,
        parent: null
      }
      this.nodes.set(nodeId, node)
      this.trackWaypoints.push(pos)
    })

    // Verbinde benachbarte Wegpunkte
    const nodeArray = Array.from(this.nodes.values())
    nodeArray.forEach((node, index) => {
      if (index > 0) {
        node.neighbors.push(nodeArray[index - 1])
      }
      if (index < nodeArray.length - 1) {
        node.neighbors.push(nodeArray[index + 1])
      }
    })
  }

  /**
   * Berechne Heuristic-Distanz (Manhattan Distance)
   */
  private heuristic(from: THREE.Vector3, to: THREE.Vector3): number {
    const dx = Math.abs(from.x - to.x)
    const dy = Math.abs(from.y - to.y)
    const dz = Math.abs(from.z - to.z)
    return dx + dy + dz
  }

  /**
   * A* Pathfinding Algorithmus
   */
  findPath(start: THREE.Vector3, goal: THREE.Vector3): THREE.Vector3[] {
    const openSet: PathNode[] = []
    const closedSet: Set<PathNode> = new Set()

    // Finde Start- und Goal-Knoten
    const startNode = this.findNearestWaypoint(start)
    const goalNode = this.findNearestWaypoint(goal)

    if (!startNode || !goalNode) {
      return [goal]
    }

    startNode.g = 0
    startNode.h = this.heuristic(startNode.position, goalNode.position)
    startNode.f = startNode.h
    openSet.push(startNode)

    while (openSet.length > 0) {
      // Finde Node mit niedrigster f-Score
      let current = openSet[0]
      let currentIndex = 0

      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < current.f) {
          current = openSet[i]
          currentIndex = i
        }
      }

      if (current === goalNode) {
        // Pfad gefunden - rekonstruiere Weg
        return this.reconstructPath(current)
      }

      openSet.splice(currentIndex, 1)
      closedSet.add(current)

      // Prüfe Nachbarn
      for (const neighbor of current.neighbors) {
        if (closedSet.has(neighbor)) continue

        const tentativeG = current.g + current.position.distanceTo(neighbor.position)

        let isInOpenSet = openSet.includes(neighbor)
        if (!isInOpenSet) {
          openSet.push(neighbor)
        } else if (tentativeG >= neighbor.g) {
          continue
        }

        neighbor.parent = current
        neighbor.g = tentativeG
        neighbor.h = this.heuristic(neighbor.position, goalNode.position)
        neighbor.f = neighbor.g + neighbor.h
      }
    }

    // Kein Pfad gefunden - gib nächsten Wegpunkt
    return [this.findNearestWaypoint(start)?.position || goal]
  }

  /**
   * Rekonstruiere Pfad
   */
  private reconstructPath(node: PathNode): THREE.Vector3[] {
    const path: THREE.Vector3[] = [node.position.clone()]
    let current = node

    while (current.parent) {
      current = current.parent
      path.unshift(current.position.clone())
    }

    return path
  }

  /**
   * Finde nächsten Wegpunkt zu Position
   */
  private findNearestWaypoint(position: THREE.Vector3): PathNode | null {
    let nearest: PathNode | null = null
    let minDistance = Infinity

    this.nodes.forEach(node => {
      const distance = node.position.distanceTo(position)
      if (distance < minDistance) {
        minDistance = distance
        nearest = node
      }
    })

    return nearest
  }

  /**
   * Hole alle Strecken-Wegpunkte
   */
  getTrackWaypoints(): THREE.Vector3[] {
    return this.trackWaypoints
  }

  /**
   * Debugge Pfad (für Visualisierung)
   */
  visualizePath(path: THREE.Vector3[], scene: THREE.Scene): void {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(
      new Float32Array(path.flatMap(v => [v.x, v.y, v.z])),
      3
    ))

    const material = new THREE.LineBasicMaterial({ color: 0x00ff00 })
    const line = new THREE.Line(geometry, material)
    scene.add(line)
  }

  dispose(): void {
    this.nodes.clear()
    this.trackWaypoints = []
  }
}