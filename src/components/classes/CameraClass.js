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
    this.camera.position.x = this.config.camera.initPos.x
    this.camera.position.y = this.config.camera.initPos.y
    this.camera.position.z = this.config.camera.initPos.z
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
