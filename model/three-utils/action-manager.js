import { omit } from '@dword-design/functions'
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

  setAction(name, options) {
    options = { duration: 0.5, ...options }
    if (this.actions[name] === this.activeAction) {
      return
    }
    this.previousAction = this.activeAction
    this.activeAction = this.actions[name]
    if (this.previousAction !== undefined) {
      this.previousAction.fadeOut(options.duration)
    }
    this.activeAction
      .reset()
      .setEffectiveWeight(1)
      .fadeIn(options.duration)
      .play()
    if (options.resetAfter) {
      const listener = () => {
        this.setAction(
          this.previousAction.getClip().name,
          options |> omit(['resetAfter'])
        )
        this.mixer.removeEventListener('finished', listener)
      }
      this.mixer.addEventListener('finished', listener)
    }
  }

  update(delta) {
    this.mixer.update(delta)
  }
}
