import * as THREE from 'three'

export class SceneManager {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private lights: THREE.Light[] = []

  constructor(renderer: THREE.WebGLRenderer, width: number, height: number) {
    this.renderer = renderer

    // Create scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x0a0e27)
    this.scene.fog = new THREE.Fog(0x0a0e27, 100, 500)

    // Create camera
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000)
    this.camera.position.set(0, 10, 20)
    this.camera.lookAt(0, 0, 0)

    // Setup lighting
    this.setupLighting()
  }

  private setupLighting(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambientLight)
    this.lights.push(ambientLight)

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(100, 100, 100)
    directionalLight.castShadow = true
    directionalLight.shadow.camera.left = -200
    directionalLight.shadow.camera.right = 200
    directionalLight.shadow.camera.top = 200
    directionalLight.shadow.camera.bottom = -200
    this.scene.add(directionalLight)
    this.lights.push(directionalLight)

    // Neon accent lights
    const neonGreen = new THREE.PointLight(0x00ff88, 1, 100)
    neonGreen.position.set(50, 30, 50)
    this.scene.add(neonGreen)
    this.lights.push(neonGreen)

    const neonPurple = new THREE.PointLight(0xff00ff, 0.8, 100)
    neonPurple.position.set(-50, 30, 50)
    this.scene.add(neonPurple)
    this.lights.push(neonPurple)
  }

  update(deltaTime: number): void {
    // Update scene logic here
  }

  getScene(): THREE.Scene {
    return this.scene
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

  dispose(): void {
    this.lights.forEach(light => this.scene.remove(light))
    this.scene.clear()
  }
}