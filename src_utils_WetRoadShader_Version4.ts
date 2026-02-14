import * as THREE from 'three'

export class WetRoadShader {
  /**
   * Erstelle Material für nasse Straße
   */
  static createWetRoadMaterial(dryMaterial: THREE.MeshStandardMaterial): THREE.ShaderMaterial {
    const wetness = 0.5 // 0-1, wie nass die Straße ist

    const vertexShader = `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = vec3(modelMatrix * vec4(position, 1.0));
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `

    const fragmentShader = `
      uniform sampler2D tDiffuse;
      uniform sampler2D tNormal;
      uniform float uWetness;
      uniform float uTime;

      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;

      // Simplex Noise
      float noise(vec3 p) {
        return sin(p.x * 12.9898 + p.y * 78.233 + p.z * 45.165) * 43758.5453;
      }

      void main() {
        // Base color
        vec4 texColor = texture2D(tDiffuse, vUv);
        
        // Wet effect - increase brightness
        vec3 wetColor = mix(texColor.rgb, texColor.rgb * 1.3, uWetness);
        
        // Ripple effect from rain
        float ripple = sin(vUv.y * 50.0 + uTime * 2.0) * 0.02;
        ripple += sin(vUv.x * 30.0 - uTime * 1.5) * 0.015;
        vec2 rippleUv = vUv + ripple * uWetness;
        
        // Reflections
        float reflection = 0.3 * uWetness;
        vec3 reflectionColor = mix(wetColor, vec3(0.5, 0.7, 1.0), reflection);
        
        // Final color
        vec3 finalColor = mix(texColor.rgb, reflectionColor, uWetness);
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        tDiffuse: { value: dryMaterial.map },
        tNormal: { value: dryMaterial.normalMap },
        uWetness: { value: wetness },
        uTime: { value: 0 }
      },
      side: THREE.DoubleSide,
      fog: true
    })

    return material
  }

  /**
   * Update Wet Road Shader
   */
  static updateWetness(
    material: THREE.ShaderMaterial,
    rainIntensity: number,
    deltaTime: number
  ): void {
    material.uniforms.uWetness.value = rainIntensity * 0.7
    material.uniforms.uTime.value += deltaTime
  }

  /**
   * Erstelle Wet Road Material mit Physik
   */
  static createPhysicalWetRoadMaterial(baseColor: THREE.Color = new THREE.Color(0x1a1a2e)): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness: 0.3, // Nasse Straße ist glatter
      metalness: 0.4,  // Nasse Straße reflektiert mehr
      normalScale: new THREE.Vector2(1, 1)
    })
  }
}