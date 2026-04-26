import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'

const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

const FRAGMENT_SHADER = `
  precision highp float;
  
  uniform float iTime;
  uniform vec2 iResolution;
  
  varying vec2 vUv;
  
  // Pseudo-random
  float hash(float n) {
    return fract(sin(n) * 43758.5453123);
  }
  
  float hash2(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  
  // Smooth noise
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash2(i);
    float b = hash2(i + vec2(1.0, 0.0));
    float c = hash2(i + vec2(0.0, 1.0));
    float d = hash2(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  
  // Single falling ray
  float ray(vec2 uv, float xPos, float speed, float length, float width, float offset) {
    // Horizontal distance from ray center
    float dx = abs(uv.x - xPos);
    
    // Moving y position — falls downward
    float yMov = fract(iTime * speed + offset);
    
    // Ray body: vertical streak
    float yDist = uv.y - (1.0 - yMov);
    float body = smoothstep(0.0, length, yDist) * smoothstep(length + 0.05, length * 0.3, yDist);
    
    // Horizontal falloff (width + glow)
    float core = exp(-dx * dx / (width * width * 0.5));
    float glow = exp(-dx * dx / (width * width * 8.0)) * 0.3;
    
    // Fade in at top, fade out at bottom
    float vFade = smoothstep(0.0, 0.15, uv.y) * smoothstep(1.0, 0.75, uv.y);
    
    return (core + glow) * body * vFade;
  }
  
  // Particle dust
  float particles(vec2 uv, float time) {
    float p = 0.0;
    for (float i = 0.0; i < 20.0; i++) {
      float seed = i * 7.31;
      float px = hash(seed);
      float py = fract(hash(seed + 1.0) - time * (0.02 + hash(seed + 2.0) * 0.03));
      float size = 0.001 + hash(seed + 3.0) * 0.002;
      float brightness = 0.3 + hash(seed + 4.0) * 0.5;
      
      vec2 pp = vec2(px, py);
      float d = length(uv - pp);
      p += brightness * exp(-d * d / (size * 2.0));
    }
    return p;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = iResolution.x / iResolution.y;
    
    vec3 col = vec3(0.0); // Pure black background
    
    // Neon green colors: #4ade80 = (0.290, 0.871, 0.502), #22c55e = (0.133, 0.773, 0.369)
    vec3 green1 = vec3(0.290, 0.871, 0.502); // #4ade80
    vec3 green2 = vec3(0.133, 0.773, 0.369); // #22c55e
    vec3 greenDim = vec3(0.08, 0.45, 0.2);    // Darker green for subtle rays
    
    // --- Layer 1: Background subtle rays (far, dim, slow) ---
    for (float i = 0.0; i < 12.0; i++) {
      float seed = i * 3.17;
      float xPos = hash(seed) * 1.0;
      float speed = 0.03 + hash(seed + 1.0) * 0.04;
      float length = 0.15 + hash(seed + 2.0) * 0.25;
      float width = 0.003 + hash(seed + 3.0) * 0.005;
      float offset = hash(seed + 4.0);
      float opacity = 0.1 + hash(seed + 5.0) * 0.15;
      
      float r = ray(uv, xPos, speed, length, width, offset);
      col += greenDim * r * opacity;
    }
    
    // --- Layer 2: Mid rays (medium brightness, medium speed) ---
    for (float i = 0.0; i < 10.0; i++) {
      float seed = i * 5.73 + 100.0;
      float xPos = hash(seed) * 1.0;
      float speed = 0.06 + hash(seed + 1.0) * 0.08;
      float length = 0.1 + hash(seed + 2.0) * 0.2;
      float width = 0.002 + hash(seed + 3.0) * 0.003;
      float offset = hash(seed + 4.0);
      float opacity = 0.2 + hash(seed + 5.0) * 0.3;
      
      float r = ray(uv, xPos, speed, length, width, offset);
      vec3 rayCol = mix(green2, green1, hash(seed + 6.0));
      col += rayCol * r * opacity;
    }
    
    // --- Layer 3: Foreground bright rays (close, fast, vivid) ---
    for (float i = 0.0; i < 6.0; i++) {
      float seed = i * 9.41 + 200.0;
      float xPos = hash(seed) * 1.0;
      float speed = 0.1 + hash(seed + 1.0) * 0.12;
      float length = 0.08 + hash(seed + 2.0) * 0.15;
      float width = 0.001 + hash(seed + 3.0) * 0.002;
      float offset = hash(seed + 4.0);
      float opacity = 0.4 + hash(seed + 5.0) * 0.5;
      
      float r = ray(uv, xPos, speed, length, width, offset);
      col += green1 * r * opacity;
    }
    
    // --- Particle dust ---
    float dust = particles(uv, iTime);
    col += green2 * dust * 0.4;
    
    // --- Subtle vignette ---
    float vig = 1.0 - 0.3 * length(uv - vec2(0.5));
    col *= vig;
    
    // --- Bloom / HDR soft clamp ---
    col = 1.0 - exp(-col * 1.5);
    
    gl_FragColor = vec4(col, 1.0);
  }
`

export default function VerbixBackground() {
  const mountRef = useRef(null)
  const frameRef = useRef(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    // --- Setup renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 1)
    container.appendChild(renderer.domElement)

    // --- Setup scene ---
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    const uniforms = {
      iTime: { value: 0.0 },
      iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    }

    const geometry = new THREE.PlaneGeometry(2, 2)
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms,
      depthWrite: false,
      depthTest: false,
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    // --- Animation loop ---
    const clock = new THREE.Clock()
    const animate = () => {
      uniforms.iTime.value = clock.getElapsedTime()
      renderer.render(scene, camera)
      frameRef.current = requestAnimationFrame(animate)
    }
    animate()

    // --- Resize handler ---
    const onResize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      renderer.setSize(w, h)
      uniforms.iResolution.value.set(w, h)
    }
    window.addEventListener('resize', onResize)

    // --- Cleanup ---
    return () => {
      window.removeEventListener('resize', onResize)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    />
  )
}
