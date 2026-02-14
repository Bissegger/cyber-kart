import * as THREE from 'three'

export class VolumetricFog {
  private scene: THREE.Scene
  private fogVolume: THREE.Mesh | null = null
  private fogIntensity: number = 0.3

  constructor(scene: THREE.Scene) {
    this.scene = scene
  }

  /**
   * Initialisiere volumetrischen Nebel
   */
  initialize(): void {
    // Erstelle Nebel-Volumen als großen Würfel
    const geometry = new THREE.BoxGeometry(1000, 200, 1000)

    const vertexShader = `
      varying vec3 vPos;

      void main() {
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `

    const fragmentShader = `
      uniform float uIntensity;
      uniform float uTime;
      uniform vec3 uCameraPos;

      varying vec3 vPos;

      float noise(vec3 p) {
        return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
      }

      void main() {
        // Berechne Distanz zur Kamera
        float dist = length(vPos - uCameraPos) / 500.0;
        
        // Nebel-Dichte basierend auf Höhe
        float fogDensity = (vPos.y + 100.0) / 200.0;
        fogDensity = clamp(fogDensity, 0.0, 1.0);
        
        // Noise für Nebel-Variation
        float n = noise(vPos * 0.01 + uTime * 0.5);
        fogDensity *= mix(0.5, 1.5, n);
        
        // Final fog
        float fog = fogDensity * uIntensity * (1.0 - dist);
        fog = clamp(fog, 0.0, 1.0);

        gl_FragColor = vec4(0.15, 0.2, 0.3, fog);
      }
    `

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uIntensity: { value: this.fogIntensity },
        uTime: { value: 0 },
        uCameraPos: { value: new THREE.Vector3() }
      },
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false
    })

    this.fogVolume = new THREE.Mesh(geometry, material)
    this.fogVolume.name = 'VolumetricFog'
    this.scene.add(this.fogVolume)
  }

  /**
   * Update Nebel
   */
  update(deltaTime: number, cameraPos: THREE.Vector3): void {
    if (!this.fogVolume) return

    const material = this.fogVolume.material as THREE.ShaderMaterial
    material.uniforms.uTime.value += deltaTime
    material.uniforms.uCameraPos.value.copy(cameraPos)

    // Nebel folgt Kamera
    this.fogVolume.position.copy(cameraPos)
  }

  /**
   * Setze Nebel-Intensität
   */
  setIntensity(intensity: number): void {
    this.fogIntensity = Math.max(0, Math.min(1, intensity))

    if (this.fogVolume) {
      const material = this.fogVolume.material as THREE.ShaderMaterial
      material.uniforms.uIntensity.value = this.fogIntensity
    }
  }

  dispose(): void {
    if (this.fogVolume) {
      this.fogVolume.geometry.dispose()
      if (Array.isArray(this.fogVolume.material)) {
        this.fogVolume.material.forEach(m => m.dispose())
      } else {
        this.fogVolume.material.dispose()
      }
      this.scene.remove(this.fogVolume)
    }
  }
}