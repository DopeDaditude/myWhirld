'use client'

import React, { useRef, useState, Suspense, useEffect } from 'react'
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function Earth({
  isSpinning,
  onSpinComplete,
  setCurrentLookAt,
  setCurrentRotation,
}: {
  isSpinning: boolean
  onSpinComplete: () => void
  setCurrentLookAt: (position: THREE.Vector3) => void
  setCurrentRotation: (rotation: number) => void
}) {
  const earthRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const [colorMap] = useLoader(THREE.TextureLoader, [
    'https://unpkg.com/three-globe@2.24.13/example/img/earth-blue-marble.jpg'
  ])
  const [spinProgress, setSpinProgress] = useState(0)

  const earthRadius = 1

  useFrame((state, delta) => {
    if (groupRef.current) {
      if (isSpinning) {
        const newProgress = spinProgress + delta * 0.5
        setSpinProgress(newProgress)

        const totalRotations = 4
        const slowdownFactor = Math.max(0, 1 - newProgress / totalRotations)
        groupRef.current.rotation.y += delta * 10 * slowdownFactor

        if (newProgress >= totalRotations) {
          onSpinComplete()
          setSpinProgress(0)
        }
      }

      setCurrentRotation(groupRef.current.rotation.y)

      const lookAtPosition = new THREE.Vector3(0, 0, -earthRadius)
      lookAtPosition.applyQuaternion(groupRef.current.quaternion)
      setCurrentLookAt(lookAtPosition)
    }
  })

  return (
    <group ref={groupRef}>
      <mesh ref={earthRef}>
        <sphereGeometry args={[earthRadius, 64, 64]} />
        <meshBasicMaterial map={colorMap} />
      </mesh>
    </group>
  )
}

function Background() {
  const texture = useLoader(THREE.TextureLoader, 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3540&q=80')
  return (
    <mesh>
      <sphereGeometry args={[100, 64, 64]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  )
}

export default function MyWhirld() {
  const [isSpinning, setIsSpinning] = useState(false)
  const [currentLookAt, setCurrentLookAt] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, -1))
  const [currentRotation, setCurrentRotation] = useState(0)
  const [cameraPosition, setCameraPosition] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 3))

  const handleExplore = () => {
    setIsSpinning(true)
  }

  const handleSpinComplete = () => {
    setIsSpinning(false)
  }

  useEffect(() => {
    const handleResize = () => {
      document.body.style.height = `${window.innerHeight}px`
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
        <Suspense fallback={null}>
          <Background />
          <Earth
            isSpinning={isSpinning}
            onSpinComplete={handleSpinComplete}
            setCurrentLookAt={setCurrentLookAt}
            setCurrentRotation={setCurrentRotation}
          />
        </Suspense>
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          onChange={(e) => {
            if (e && e.target instanceof THREE.PerspectiveCamera) {
              setCameraPosition(e.target.position)
            }
          }}
        />
      </Canvas>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
        <button
          onClick={handleExplore}
          disabled={isSpinning}
          className="px-6 py-2 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSpinning ? 'Exploring...' : 'Explore My World'}
        </button>
      </div>
    </div>
  )
}
