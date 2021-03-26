import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export default class {
  constructor(camera, renderer) {
    this.orbitControls = new OrbitControls(camera, renderer.domElement)
    this.orbitControls.minDistance = 15
    this.orbitControls.maxDistance = 15
    this.orbitControls.minPolarAngle = 0.25 * Math.PI
    this.orbitControls.maxPolarAngle = 0.4 * Math.PI
  }

  set target(target) {
    this.orbitControls.target = target
  }

  update() {
    this.orbitControls.update()
  }
}
