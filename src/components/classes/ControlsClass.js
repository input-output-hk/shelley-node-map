import OrbitControls from 'three-orbitcontrols'

import CameraClass from './CameraClass'
import RendererClass from './RendererClass'
import BaseClass from './BaseClass'

class ControlsClass extends BaseClass {
  init () {
    this.controls = new OrbitControls(CameraClass.getInstance().camera, RendererClass.getInstance().renderer.domElement.parentNode)
    this.controls.minDistance = 2.4
    this.controls.maxDistance = 8
    this.controls.enablePan = false
    this.controls.enableZoom = this.config.camera.enableZoom
    this.controls.zoomSpeed = 0.7
    this.controls.rotateSpeed = 0.25
    this.controls.autoRotateSpeed = 0.3
    this.controls.autoRotate = false
    this.controls.enableDamping = false
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
