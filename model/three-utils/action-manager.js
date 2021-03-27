import * as THREE from 'three'

export default class {
  constructor(gltf) {
    this.mixer = new THREE.AnimationMixer(gltf.scene)

    const runningAction = this.mixer.clipAction(
      THREE.AnimationClip.findByName(gltf.animations, 'Running')
    )
    runningAction.timeScale = 1.3

    const jumpAction = this.mixer.clipAction(
      THREE.AnimationClip.findByName(gltf.animations, 'Jump')
    )
    jumpAction.loop = THREE.LoopOnce
    this.actions = {
      Idle: this.mixer.clipAction(
        THREE.AnimationClip.findByName(gltf.animations, 'Idle')
      ),
      Jump: jumpAction,
      Running: runningAction,
    }
  }

  setAction(name, duration = 0.5) {
    if (this.actions[name] === this.activeAction) {
      return
    }
    this.previousAction = this.activeAction
    this.activeAction = this.actions[name]
    if (this.previousAction !== undefined) {
      this.previousAction.fadeOut(duration)
    }
    this.activeAction.reset().setEffectiveWeight(1).fadeIn(duration).play()
  }

  triggerOneTimeAction(name, duration = 0.5) {
    if (this.actions[name] === this.activeAction) {
      return
    }
    this.previousAction = this.activeAction
    this.activeAction = this.actions[name]
    if (this.previousAction !== undefined) {
      this.previousAction.fadeOut(duration)
    }
    this.activeAction.reset().setEffectiveWeight(1).fadeIn(duration).play()

    const listener = () => {
      this.setAction(this.previousAction.getClip().name)
      this.mixer.removeEventListener('finished', listener)
    }
    this.mixer.addEventListener('finished', listener)
  }

  update(delta) {
    this.mixer.update(delta)
  }
}
