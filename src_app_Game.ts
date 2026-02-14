import * as THREE from 'three'
import { SceneManager } from './SceneManager'
import { AudioManager } from './AudioManager'

interface GameConfig {
  canvas: HTMLCanvasElement
  width: number
  height: number
}

export class Game {
  private canvas: HTMLCanvasElement
  private renderer: THREE.WebGLRenderer
  private sceneManager: SceneManager
  private audioManager: AudioManager
  private clock: THREE.Clock
  private isRunning: boolean = false

  constructor(config: GameConfig) {
    this.canvas = config.canvas

    // Initialize Three.js renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    })
    this.renderer.setSize(config.width, config.height)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFShadowShadowMap

    // Initialize managers
    this.sceneManager = new SceneManager(this.renderer, config.width, config.height)
    this.audioManager = new AudioManager()
    this.clock = new THREE.Clock()
  }

  start(): void {
    this.isRunning = true
    console.log('🎮 Game started!')
  }

  update(time: number): void {
    if (!this.isRunning) return

    const deltaTime = this.clock.getDelta()

    this.sceneManager.update(deltaTime)
    this.render()
  }

  private render(): void {
    this.renderer.render(
      this.sceneManager.getScene(),
      this.sceneManager.getCamera()
    )
  }

  resize(width: number, height: number): void {
    this.renderer.setSize(width, height)
    this.sceneManager.resize(width, height)
  }

  stop(): void {
    this.isRunning = false
    console.log('⏹️ Game stopped')
  }

  dispose(): void {
    this.renderer.dispose()
    this.sceneManager.dispose()
    this.audioManager.dispose()
  }
}