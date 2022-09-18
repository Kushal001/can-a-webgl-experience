import "./style.css"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import * as dat from "dat.gui"

/**
 * Loaders
 */
const cubeTextureLoader = new THREE.CubeTextureLoader()

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

const debugObject = {
  canRotateScrollHeight: 3000,
}

// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()

/**
 * Update all materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      // child.material.envMap = environmentMap
      child.material.envMapIntensity = 3
      child.material.needsUpdate = true
    }
  })
}

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader
  .setPath("/textures/environmentMaps/0/")
  .load(["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"])

environmentMap.encoding = THREE.sRGBEncoding
// scene.background = new THREE.Color("#000")
scene.environment = environmentMap

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.set(1.5, 1.5, 0)
// camera.position.set(0, 2, 0)
camera.lookAt(0, 0, 0)
scene.add(camera)

// Debug
gui.add(camera.position, "x").min(-5).max(5).step(0.1).name("cameraX")
gui.add(camera.position, "y").min(-5).max(5).step(0.1).name("cameraY")
gui.add(camera.position, "z").min(-5).max(5).step(0.1).name("cameraZ")

/**
 * Models
 */
const gltfLoader = new GLTFLoader()

let mixer = null
let object = null

gltfLoader.load("/models/can/can.gltf", (gltf) => {
  mixer = new THREE.AnimationMixer(gltf.scene)
  const action = mixer.clipAction(gltf.animations[0])

  action.play()

  gltf.scene.scale.set(0.05, 0.05, 0.05)
  gltf.scene.position.set(0, -0.6, 0)

  scene.add(gltf.scene)

  object = gltf

  updateAllMaterials()
})

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// // Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 3
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

/**
 * Animate
 */
const clock = new THREE.Clock()

let currentTimeline = window.scrollY / 3000
let aimedTimeline = window.scrollY / 3000

// Tick
const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // Rotate can
  currentTimeline += (aimedTimeline - currentTimeline) * 0.02

  if (object) {
    const rx = 0
    const rz = Math.abs(Math.abs(currentTimeline - 0.5) - 0.5) * 1.5
    // const rz = 0
    const ry = Math.PI * 2 * currentTimeline

    object.scene.rotation.set(rx, ry, rz)
  }

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()

window.addEventListener("scroll", (e) => {
  aimedTimeline = window.scrollY / 3000
})
