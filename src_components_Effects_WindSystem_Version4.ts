import * as THREE from 'three'
import { KartPhysics } from '@core/Physics'

export class WindSystem {
  private windVector: THREE.Vector3 = new THREE.Vector3()
  private windForce: number = 0
  private windDirection: number = 0 // Winkel
  private windVariation: number = 0

  constructor() {
    this.generateWind()
  }

  /**
   * Generiere zufälligen Wind
   */
  private generateWind(): void {
    this.windForce = Math.random() * 20
    this.windDirection = Math.random() * Math.PI * 2
    this.updateWindVector()
  }

  /**
   * Update Wind-Vektor
   */
  private updateWindVector(): void {
    this.windVector.x = Math.cos(this.windDirection) * this.windForce
    this.windVector.z = Math.sin(this.windDirection) * this.windForce
  }

  /**
   * Update Wind (mit natürlichen Variationen)
   */
  update(deltaTime: number): void {
    // Gust-Effekt (Wind-Böen)
    this.windVariation += Math.random() * deltaTime * 0.5 - deltaTime * 0.25
    this.windVariation = Math.max(-0.3, Math.min(0.3, this.windVariation))

    // Winde-Richtung langsam ändern
    this.windDirection += this.windVariation * deltaTime

    // Wind-Kraft variiert
    const windGust = Math.sin(Date.now() * 0.001) * 5
    this.windForce = Math.max(0, 10 + windGust)

    this.updateWindVector()
  }

  /**
   * Wende Wind auf Kart an
   */
  applyWindToKart(kart: THREE.Group, kartPhysics: KartPhysics, deltaTime: number): void {
    // Wind beeinflusst Lenk-Input
    const windInfluence = this.windForce / 50 // Normalisiert auf 0-0.4
    const windAngle = Math.atan2(this.windVector.z, this.windVector.x)
    const kartAngle = kart.rotation.y

    // Berechne seitlichen Druck
    const angleDiff = Math.atan2(Math.sin(windAngle - kartAngle), Math.cos(windAngle - kartAngle))
    const lateralForce = Math.sin(angleDiff) * windInfluence

    // Beeinfluss Kart-Steuerung
    // (würde im Input-Manager integriert)
  }

  /**
   * Visualisiere Wind (für Debugging)
   */
  visualizeWind(scene: THREE.Scene): void {
    const arrowHelper = new THREE.ArrowHelper(
      this.windVector.clone().normalize(),
      new THREE.Vector3(0, 50, 0),
      this.windForce * 2,
      0xff0000
    )

    scene.add(arrowHelper)

    setTimeout(() => {
      scene.remove(arrowHelper)
    }, 1000)
  }

  /**
   * Gib Wind-Vektor
   */
  getWindVector(): THREE.Vector3 {
    return this.windVector.clone()
  }

  /**
   * Gib Wind-Kraft
   */
  getWindForce(): number {
    return this.windForce
  }
}