import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useLoader, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Center, Html, Grid } from '@react-three/drei'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import './ModelViewer.css'

function STLModel({ url }) {
  const geometry = useLoader(STLLoader, url)

  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#7090b0',
    metalness: 0.3,
    roughness: 0.6,
  }), [])

  return (
    <mesh geometry={geometry} material={material} castShadow receiveShadow />
  )
}

function OBJModel({ url }) {
  const obj = useLoader(OBJLoader, url)

  useEffect(() => {
    obj.traverse(child => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: '#7090b0',
          metalness: 0.3,
          roughness: 0.6,
        })
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [obj])

  return <primitive object={obj} />
}

function GLTFModel({ url }) {
  const gltf = useLoader(GLTFLoader, url)
  return <primitive object={gltf.scene} />
}

function AutoCenter({ children }) {
  const groupRef = useRef()
  const { camera } = useThree()

  useEffect(() => {
    if (!groupRef.current) return

    const box = new THREE.Box3().setFromObject(groupRef.current)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    // Center the model
    groupRef.current.position.sub(center)

    // Adjust camera distance based on model size
    const maxDim = Math.max(size.x, size.y, size.z)
    const distance = maxDim * 2.5
    camera.position.set(distance * 0.6, distance * 0.4, distance * 0.6)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [children, camera])

  return <group ref={groupRef}>{children}</group>
}

function ModelContent({ url, fileType }) {
  const Loader = {
    '.stl': STLModel,
    '.obj': OBJModel,
    '.gltf': GLTFModel,
    '.glb': GLTFModel,
  }[fileType]

  if (!Loader) {
    return (
      <Html center>
        <div className="viewer-unsupported">
          <p>Preview not available for {fileType} files</p>
          <p>Download the file to view it in your CAD software</p>
        </div>
      </Html>
    )
  }

  return (
    <AutoCenter>
      <Loader url={url} />
    </AutoCenter>
  )
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="viewer-loading">Loading model...</div>
    </Html>
  )
}

function ErrorFallback({ error }) {
  return (
    <div className="viewer-error">
      <p>Failed to load model</p>
      <p className="error-detail">{error}</p>
    </div>
  )
}

export default function ModelViewer({ model }) {
  const containerRef = useRef()
  const [error, setError] = useState(null)

  const fileUrl = `/uploads/${model.filename}`
  const fileType = model.file_type?.toLowerCase()

  const canPreview = ['.stl', '.obj', '.gltf', '.glb'].includes(fileType)

  if (error) {
    return <ErrorFallback error={error} />
  }

  if (!canPreview) {
    return (
      <div className="viewer-unsupported-container">
        <p>Preview not available for <strong>{fileType}</strong> files</p>
        <p>Download the file to view it in your CAD software</p>
        <a href={`/api/models/${model.id}/download`} className="download-btn">
          Download {model.original_name}
        </a>
      </div>
    )
  }

  return (
    <div className="model-viewer" ref={containerRef}>
      <ErrorBoundary onError={setError}>
        <Canvas
          shadows
          camera={{ position: [5, 3, 5], fov: 50, near: 0.01, far: 10000 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1 }}
        >
          <color attach="background" args={['#1a1a1a']} />

          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1.2}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-5, 5, -5]} intensity={0.4} />

          <Grid
            args={[100, 100]}
            position={[0, -0.01, 0]}
            cellSize={1}
            cellColor="#333"
            sectionSize={5}
            sectionColor="#444"
            fadeDistance={50}
            infiniteGrid
          />

          <Suspense fallback={<LoadingFallback />}>
            <ModelContent url={fileUrl} fileType={fileType} />
          </Suspense>

          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.1}
            minDistance={0.1}
            maxDistance={1000}
          />
        </Canvas>
      </ErrorBoundary>
    </div>
  )
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    this.props.onError?.(error.message)
  }

  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}
