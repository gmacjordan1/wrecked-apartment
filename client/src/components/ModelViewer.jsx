import React, { useRef, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Text, Box, Grid } from '@react-three/drei'
import * as THREE from 'three'
import './ModelViewer.css'

function ModelViewer({ model }) {
  const [measurementMode, setMeasurementMode] = useState(false)
  const [measurements, setMeasurements] = useState([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentMeasurement, setCurrentMeasurement] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const viewerRef = useRef()
  const controlsRef = useRef()

  const toggleFullscreen = async () => {
    try {
      const doc = document
      const docEl = doc.documentElement
      
      // Check if already in fullscreen
      const isFullscreen = !!(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      )

      if (!isFullscreen) {
        // Use the standard fullscreen API on documentElement (not a specific element)
        // This avoids macOS permission issues
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen()
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen()
        } else if (docEl.mozRequestFullScreen) {
          await docEl.mozRequestFullScreen()
        } else if (docEl.msRequestFullscreen) {
          await docEl.msRequestFullscreen()
        } else {
          alert('Fullscreen is not supported in this browser. Try pressing F11 or Cmd+Ctrl+F')
          return
        }
        setIsFullscreen(true)
      } else {
        // Exit fullscreen
        if (doc.exitFullscreen) {
          await doc.exitFullscreen()
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen()
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen()
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen()
        }
        setIsFullscreen(false)
      }
    } catch (err) {
      console.error('Fullscreen error:', err)
      // If fullscreen fails, show a helpful message
      alert('Fullscreen mode could not be activated. This might be due to browser settings or macOS permissions. You can try using your browser\'s fullscreen feature instead (F11 or Cmd+Ctrl+F).')
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      )
      setIsFullscreen(isFullscreen)
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [])

  // Handle Fusion 360 link or embedded viewer
  const renderModel = () => {
    if (model.fusion360_link) {
      // For Fusion 360 shared links, we'll embed an iframe
      // Note: Fusion 360 links may need to be converted to Autodesk Viewer format
      return (
        <iframe
          src={model.fusion360_link}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title={model.name}
        />
      )
    } else if (model.file_path) {
      // For local files, we'd use a loader (GLTFLoader, etc.)
      // For now, show a placeholder
      return (
        <Canvas>
          <PerspectiveCamera makeDefault position={[5, 5, 5]} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Grid args={[10, 10]} cellColor="#444" sectionColor="#333" />
          <Box args={[2, 2, 2]} position={[0, 1, 0]}>
            <meshStandardMaterial color="#4a9eff" />
          </Box>
          <OrbitControls ref={controlsRef} />
          {measurementMode && (
            <MeasurementTool
              onMeasurementComplete={(measurement) => {
                setMeasurements([...measurements, measurement])
                setCurrentMeasurement(null)
                setIsDrawing(false)
              }}
              onMeasurementStart={() => {
                setIsDrawing(true)
              }}
            />
          )}
          {measurements.map((m, i) => (
            <MeasurementDisplay key={i} measurement={m} />
          ))}
        </Canvas>
      )
    } else {
      return (
        <div className="model-placeholder">
          <p>No model data available</p>
          <p className="placeholder-hint">
            Add a Fusion 360 link or upload a model file in Admin Mode
          </p>
        </div>
      )
    }
  }

  const clearMeasurements = () => {
    setMeasurements([])
    setCurrentMeasurement(null)
  }

  return (
    <div className="model-viewer" ref={viewerRef}>
      <div className="viewer-toolbar">
        <div className="toolbar-left">
          <h3>{model.name}</h3>
          <span className="model-type-badge">{model.type}</span>
          {model.notes && (
            <div className="model-notes">
              <strong>Notes:</strong> {model.notes}
            </div>
          )}
        </div>
        <div className="toolbar-right">
          <button
            className={`toolbar-button ${measurementMode ? 'active' : ''}`}
            onClick={() => setMeasurementMode(!measurementMode)}
            title="Toggle measurement mode"
          >
            📏 Measure
          </button>
          {measurements.length > 0 && (
            <button
              className="toolbar-button"
              onClick={clearMeasurements}
              title="Clear measurements"
            >
              Clear
            </button>
          )}
          <button
            className="toolbar-button"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? '⛶ Exit Fullscreen' : '⛶ Fullscreen'}
          </button>
        </div>
      </div>
      <div className="viewer-content">
        {renderModel()}
      </div>
      {measurementMode && (
        <div className="measurement-hint">
          Click two points in the 3D view to measure distance
        </div>
      )}
      {measurements.length > 0 && (
        <div className="measurements-panel">
          <h4>Measurements</h4>
          {measurements.map((m, i) => (
            <div key={i} className="measurement-item">
              <span>Distance {i + 1}: {m.distance.toFixed(2)} units</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Simple measurement tool component
function MeasurementTool({ onMeasurementComplete, onMeasurementStart }) {
  const [points, setPoints] = useState([])
  const lineRef = useRef()

  useEffect(() => {
    const handleClick = (event) => {
      // This is a simplified version - in a real implementation,
      // you'd need to convert screen coordinates to 3D world coordinates
      // For now, this is a placeholder
      if (points.length === 0) {
        onMeasurementStart()
        setPoints([{ x: 0, y: 0, z: 0 }])
      } else if (points.length === 1) {
        const point2 = { x: 2, y: 0, z: 0 }
        setPoints([...points, point2])
        const distance = Math.sqrt(
          Math.pow(point2.x - points[0].x, 2) +
          Math.pow(point2.y - points[0].y, 2) +
          Math.pow(point2.z - points[0].z, 2)
        )
        onMeasurementComplete({ points, distance })
        setPoints([])
      }
    }

    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [points, onMeasurementComplete, onMeasurementStart])

  return null
}

function MeasurementDisplay({ measurement }) {
  // Display measurement line and label
  return (
    <group>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([
              measurement.points[0].x,
              measurement.points[0].y,
              measurement.points[0].z,
              measurement.points[1].x,
              measurement.points[1].y,
              measurement.points[1].z
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ff6b6b" linewidth={2} />
      </line>
    </group>
  )
}

export default ModelViewer

