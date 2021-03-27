import * as THREE from 'three'

export default class {
  constructor(camera) {
    this.camera = camera
    this.keyStates = {}
    document.addEventListener('keydown', event => {
      this.keyStates[event.code] = true
    })
    document.addEventListener(
      'keyup',
      event => (this.keyStates[event.code] = false)
    )
  }

  getCameraDirection() {
    const result = new THREE.Vector3()
    this.camera.getWorldDirection(result)
    result.y = 0
    result.normalize()

    return result
  }

  update(delta) {
    const cameraDirection = this.getCameraDirection()

    const cameraOrthogonalDirection = cameraDirection
      .clone()
      .cross(new THREE.Vector3(0, 1, 0))

    const playerCurrentDirection = new THREE.Vector3()
    this.target.getWorldDirection(playerCurrentDirection)
    let playerTargetDirection = new THREE.Vector3()
    if (this.keyStates.KeyW) {
      playerTargetDirection.add(cameraDirection)
    }
    if (this.keyStates.KeyS) {
      playerTargetDirection.sub(cameraDirection)
    }
    if (this.keyStates.KeyA) {
      playerTargetDirection.sub(cameraOrthogonalDirection)
    }
    if (this.keyStates.KeyD) {
      playerTargetDirection.add(cameraOrthogonalDirection)
    }
    playerTargetDirection.normalize()
    this.target.position.add(
      playerTargetDirection.clone().multiplyScalar(12 * delta)
    )
    if (playerTargetDirection.length() === 0) {
      playerTargetDirection = playerCurrentDirection
    }
    this.target.quaternion.rotateTowards(
      new THREE.Quaternion().setFromRotationMatrix(
        new THREE.Matrix4().lookAt(
          this.target.position.clone().add(playerTargetDirection),
          this.target.position,
          new THREE.Vector3(0, 1, 0)
        )
      ),
      6 * delta
    )
  }
}
