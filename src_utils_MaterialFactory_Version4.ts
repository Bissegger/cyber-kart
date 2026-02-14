import * as THREE from 'three'

export class MaterialFactory {
  /**
   * Erstelle Cyberpunk-Road-Material
   */
  static createRoadMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.6,
      roughness: 0.4,
      map: this.createRoadTexture()
    })
  }

  /**
   * Erstelle Neon-Material
   */
  static createNeonMaterial(color: THREE.Color | number, intensity: number = 0.8): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: intensity,
      metalness: 0.7,
      roughness: 0.2
    })
  }

  /**
   * Erstelle Glas-Material (für Gebäude-Fenster)
   */
  static createGlassMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.6,
      metalness: 0.1,
      roughness: 0.1,
      transparent: true,
      opacity: 0.7
    })
  }

  /**
   * Erstelle Metal-Material
   */
  static createMetalMaterial(color: THREE.Color | number = 0x888888): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.9,
      roughness: 0.1
    })
  }

  /**
   * Erstelle einfache Road-Textur
   */
  private static createRoadTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')!

    // Asphalt-Basis
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, 256, 256)

    // Neon-Center-Line
    ctx.strokeStyle = '#00ff88'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(128, 0)
    ctx.lineTo(128, 256)
    ctx.stroke()

    // Texture-Details (Kratzer, Beschädigungen)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 256
      const y = Math.random() * 256
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + Math.random() * 20, y + Math.random() * 20)
      ctx.stroke()
    }

    return new THREE.CanvasTexture(canvas)
  }
}