import createKeyState from 'key-state'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import ActionManager from './three-utils/action-manager'
import PlayerMovement from './three-utils/player-movement'

export default async () => {
  const scene = (() => {
    const _ = new THREE.Scene()
    _.background = new THREE.Color(0xcce0ff)
    _.fog = new THREE.Fog(0xcce0ff, 100, 500)

    return _
  })()

  const textureLoader = new THREE.TextureLoader()

  const gltfLoader = new GLTFLoader()

  const renderer = (() => {
    const _ = new THREE.WebGLRenderer()
    _.setSize(window.innerWidth, window.innerHeight)
    _.shadowMap.enabled = true

    return _
  })()
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
  scene.add(
    (() => {
      const _ = new THREE.Mesh(
        new THREE.PlaneGeometry(1000, 1000),
        groundMaterial
      )
      _.rotation.x = -Math.PI / 2
      _.receiveShadow = true

      return _
    })()
  )

  const gltf = await new Promise((resolve, reject) =>
    gltfLoader.load('RobotExpressive.glb', resolve, undefined, reject)
  )

  const player = (() => {
    const _ = gltf.scene
    _.rotation.y = Math.PI
    _.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true
      }
    })

    return _
  })()
  scene.add(player)

  const camera = (() => {
    const _ = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    _.position.y = 2
    _.position.z = 5

    return _
  })()

  const controls = (() => {
    const _ = new OrbitControls(camera, renderer.domElement)
    _.maxDistance = 15
    _.maxPolarAngle = 0.4 * Math.PI
    _.minDistance = 15
    _.minPolarAngle = 0.25 * Math.PI
    _.target = player.position

    return _
  })()

  const playerMovement = (() => {
    const _ = new PlayerMovement(camera)
    _.target = player

    return _
  })()

  const actionManager = new ActionManager(gltf)
  actionManager.setAction('Idle')

  const keyState = createKeyState(window)
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
      actionManager.setAction('Jump', { resetAfter: true })
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
