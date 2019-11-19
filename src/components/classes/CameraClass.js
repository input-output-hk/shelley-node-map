import {
  PerspectiveCamera
} from 'three'

import BaseClass from './BaseClass'

class CameraClass extends BaseClass {
  init () {
    this.camera = new PerspectiveCamera(
      this.config.camera.fov,
      window.innerWidth / window.innerHeight,
      this.config.camera.near,
      this.config.camera.far
    )
    this.camera.position.x = 0
    this.camera.position.y = 0
    this.camera.position.z = 5
    this.camera.updateMatrixWorld()

    super.init()
  }

  resize (width, height) {
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    super.resize()
  }
}

export default CameraClass
