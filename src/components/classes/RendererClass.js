import {
  WebGLRenderer
} from 'three'

import BaseClass from './BaseClass'
import CameraClass from './CameraClass'
import GlobeSceneClass from './GlobeSceneClass'

class RendererClass extends BaseClass {
  init () {
    this.canvas = document.querySelector('#' + this.config.scene.canvasID)
    this.renderer = new WebGLRenderer({
      antialias: this.config.renderer.antialias,
      canvas: this.canvas
    })

    super.init()
  }

  resize (width, height) {
    this.renderer.setSize(width, height, false)

    super.resize()
  }

  renderFrame ({
    renderTarget = null,
    scene = GlobeSceneClass.getInstance().scene,
    camera = CameraClass.getInstance().camera
  } = {}) {
    this.renderer.setRenderTarget(renderTarget)
    this.renderer.render(scene, camera)

    super.renderFrame()
  }

  destroy () {
    this.renderer.dispose()

    super.destroy()
  }
}

export default RendererClass
