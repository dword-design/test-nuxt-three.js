import * as THREE from 'three'

export const create = gltf => {
  const mixer = new THREE.AnimationMixer(gltf.scene)
  const runningAction = mixer.clipAction(
    THREE.AnimationClip.findByName(gltf.animations, 'Running')
  )
  runningAction.timeScale = 1.3
  const jumpAction = mixer.clipAction(
    THREE.AnimationClip.findByName(gltf.animations, 'Jump')
  )
  jumpAction.loop = THREE.LoopOnce
  return {
    actions: {
      Idle: mixer.clipAction(
        THREE.AnimationClip.findByName(gltf.animations, 'Idle')
      ),
      Jump: jumpAction,
      Running: runningAction,
    },
    mixer,
  }
}

export const setAction = (manager, name, duration = 0.5) => {
  manager.previousAction = manager.activeAction
  manager.activeAction = manager.actions[name]
  if (manager.previousAction === manager.activeAction) {
    return
  }
  if (manager.previousAction !== undefined) {
    manager.previousAction.fadeOut(duration)
  }
  manager.activeAction.reset().setEffectiveWeight(1).fadeIn(duration).play()
}

export const triggerOneTimeAction = (manager, name, duration = 0.5) => {
  manager.previousAction = manager.activeAction
  manager.activeAction = manager.actions[name]
  if (manager.previousAction === manager.activeAction) {
    return
  }
  if (manager.previousAction !== undefined) {
    manager.previousAction.fadeOut(duration)
  }
  manager.activeAction.reset().setEffectiveWeight(1).fadeIn(duration).play()
  const listener = () => {
    setAction(manager, manager.previousAction.getClip().name)
    manager.mixer.removeEventListener('finished', listener)
  }
  manager.mixer.addEventListener('finished', listener)
}

export const update = (manager, delta) => manager.mixer.update(delta)
