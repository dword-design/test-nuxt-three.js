import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import ActionManager from './three-utils/action-manager'
import PlayerMovement from './three-utils/player-movement'

export default async () => {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xcce0ff)
  scene.fog = new THREE.Fog(0xcce0ff, 100, 500)

  const textureLoader = new THREE.TextureLoader()

  const gltfLoader = new GLTFLoader()

  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.y = 2
  camera.position.z = 5

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.maxDistance = 15
  controls.maxPolarAngle = 0.4 * Math.PI
  controls.minDistance = 15
  controls.minPolarAngle = 0.25 * Math.PI

  const playerMovement = new PlayerMovement(camera)

  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(0, 20, 20)
  light.castShadow = true
  light.shadow.mapSize.width = 2048
  light.shadow.mapSize.height = 2048
  light.shadow.camera = new THREE.OrthographicCamera(
    -500,
    500,
    500,
    -500,
    0.5,
    1000
  )
  scene.add(light)

  const groundTexture = textureLoader.load('grasslight-big.jpg')
  groundTexture.wrapS = THREE.RepeatWrapping
  groundTexture.wrapT = THREE.RepeatWrapping
  groundTexture.repeat.set(50, 50)
  groundTexture.anisotropy = 16
  groundTexture.encoding = THREE.sRGBEncoding

  const groundMaterial = new THREE.MeshLambertMaterial({ map: groundTexture })

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000),
    groundMaterial
  )
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  const gltf = await new Promise((resolve, reject) =>
    gltfLoader.load('RobotExpressive.glb', resolve, undefined, reject)
  )

  const player = gltf.scene
  player.rotation.y = Math.PI
  player.traverse(child => {
    if (child.isMesh) {
      child.castShadow = true
    }
  })
  scene.add(player)

  const actionManager = new ActionManager(gltf)
  actionManager.setAction('Idle')

  const keyStates = {}
  document.addEventListener('keydown', event => {
    if (event.code === 'Space' && !keyStates[event.code]) {
      actionManager.triggerOneTimeAction('Jump')
    }
    keyStates[event.code] = true
  })
  document.addEventListener('keyup', event => (keyStates[event.code] = false))
  controls.target = player.position
  playerMovement.target = player
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })

  const clock = new THREE.Clock()

  const animate = () => {
    requestAnimationFrame(animate)

    const delta = clock.getDelta()
    if (actionManager.activeAction.getClip().name !== 'Jump') {
      actionManager.setAction(
        keyStates.KeyW || keyStates.KeyS || keyStates.KeyA || keyStates.KeyD
          ? 'Running'
          : 'Idle'
      )
    }
    actionManager.update(delta)
    controls.update()
    playerMovement.update(delta)
    renderer.render(scene, camera)
  }
  animate()

  return renderer
}
