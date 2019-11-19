import OrbitControls from 'three-orbitcontrols'

import CameraClass from './CameraClass'
import RendererClass from './RendererClass'
import BaseClass from './BaseClass'

class ControlsClass extends BaseClass {
  init () {
    this.controls = new OrbitControls(CameraClass.getInstance().camera, RendererClass.getInstance().renderer.domElement)
    this.controls.minDistance = 1
    this.controls.maxDistance = 50
    this.controls.enablePan = false
    this.controls.enableZoom = this.config.camera.enableZoom
    this.controls.zoomSpeed = 0.7
    // this.controls.rotateSpeed = 0.3
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.01
    super.init()
  }

  destroy () {
    this.controls.dispose()
    super.destroy()
  }

  renderFrame () {
    this.controls.update()
    super.renderFrame()
  }
}

export default ControlsClass
