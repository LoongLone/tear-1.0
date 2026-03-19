import { useEffect, useRef } from 'react'
import * as THREE from 'three'

function TearDrop({ binaryString, emotionColor = '#3a6ea5' }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return undefined
    }

    const width = container.clientWidth || 1
    const height = container.clientHeight || 1
    const particleCount = Math.min(
      900,
      Math.max(200, Math.floor((binaryString?.length || 0) * 6))
    )

    const scene = new THREE.Scene()
    const shellColor = new THREE.Color(emotionColor)
    const glowColor = shellColor.clone().offsetHSL(0.02, 0.1, 0.18)

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.z = 5
    camera.position.y = 1

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0xffffff, 18, 100)
    pointLight.position.set(5, 5, 5)
    scene.add(pointLight)

    const fillLight = new THREE.PointLight(glowColor, 10, 10)
    fillLight.position.set(-3, -2, 4)
    scene.add(fillLight)

    const geometry = new THREE.SphereGeometry(1, 64, 64)
    geometry.scale(0.8, 1.2, 0.8)

    const material = new THREE.MeshPhysicalMaterial({
      color: shellColor,
      roughness: 0.12,
      metalness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.15,
      transmission: 0.35,
      transparent: true,
      opacity: 0.82,
    })

    const tearMesh = new THREE.Mesh(geometry, material)
    scene.add(tearMesh)

    const auraGeometry = geometry.clone()
    const auraMaterial = new THREE.MeshBasicMaterial({
      color: glowColor,
      transparent: true,
      opacity: 0.09,
      side: THREE.BackSide,
    })
    const auraMesh = new THREE.Mesh(auraGeometry, auraMaterial)
    auraMesh.scale.set(1.12, 1.08, 1.12)
    tearMesh.add(auraMesh)

    const particleGeo = new THREE.BufferGeometry()
    const particlePositions = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i += 1) {
      const r = Math.random() * 0.8
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      const x = r * Math.sin(phi) * Math.cos(theta) * 0.8
      const y = r * Math.sin(phi) * Math.sin(theta) * 1.2
      const z = r * Math.cos(phi) * 0.8

      particlePositions[i * 3] = x
      particlePositions[i * 3 + 1] = y
      particlePositions[i * 3 + 2] = z
    }

    particleGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(particlePositions, 3)
    )

    const particleMat = new THREE.PointsMaterial({
      color: glowColor,
      size: 0.035,
      transparent: true,
      blending: THREE.AdditiveBlending,
    })

    const particles = new THREE.Points(particleGeo, particleMat)
    tearMesh.add(particles)

    let frameId = 0
    const clock = new THREE.Clock()

    const animate = () => {
      frameId = window.requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      tearMesh.rotation.y += 0.0025
      tearMesh.rotation.z = Math.sin(elapsed * 0.6) * 0.05
      tearMesh.position.y = Math.sin(elapsed * 1.1) * 0.08
      auraMesh.rotation.y -= 0.0015
      particles.rotation.y += 0.002
      particles.rotation.x += 0.001
      renderer.render(scene, camera)
    }

    animate()

    const handleResize = () => {
      const nextWidth = container.clientWidth || 1
      const nextHeight = container.clientHeight || 1

      camera.aspect = nextWidth / nextHeight
      camera.updateProjectionMatrix()
      renderer.setSize(nextWidth, nextHeight)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
      tearMesh.remove(auraMesh)
      tearMesh.remove(particles)
      scene.remove(tearMesh)
      auraGeometry.dispose()
      auraMaterial.dispose()
      particleGeo.dispose()
      particleMat.dispose()
      geometry.dispose()
      material.dispose()
      renderer.dispose()

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [binaryString, emotionColor])

  return <div ref={containerRef} className="tear-drop-canvas tear-container" />
}

export default TearDrop
