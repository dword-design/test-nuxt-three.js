import createKeyState from 'key-state'
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
  scene.add(
    (() => {
      const _ = new THREE.DirectionalLight(0xffffff, 1)
      _.position.set(0, 20, 20)
      _.castShadow = true
      _.shadow.mapSize.width = 2048
      _.shadow.mapSize.height = 2048
      _.shadow.camera = new THREE.OrthographicCamera(
        -500,
        500,
        500,
        -500,
        0.5,
        1000
      )

      return _
    })()
  )

  const groundMaterial = new THREE.MeshLambertMaterial({
    map: (() => {
      const _ = textureLoader.load('grasslight-big.jpg')
      _.wrapS = THREE.RepeatWrapping
      _.wrapT = THREE.RepeatWrapping
      _.repeat.set(50, 50)
      _.anisotropy = 16
      _.encoding = THREE.sRGBEncoding

      return _
    })(),
  })

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

  const keyState = createKeyState(window)
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
    if (keyState.Space) {
      actionManager.triggerOneTimeAction('Jump')
    }
    if (actionManager.activeAction.getClip().name !== 'Jump') {
      actionManager.setAction(
        keyState.KeyW || keyState.KeyS || keyState.KeyA || keyState.KeyD
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
