// 3rd party
import {
  Vector2
} from 'three'

// classes
import BaseClass from './BaseClass'
import RendererClass from './RendererClass'

class MouseClass extends BaseClass {
  init () {
    this.prevMousePos = new Vector2(0, 0)
    this.mouseDelta = new Vector2(0, 0)
    this.movement = new Vector2()
    this.mousePos = new Vector2()
    this.normalizedMousePos = new Vector2()
    this.prevNormalizedMousePos = new Vector2()
  }

  onMouseMove (e) {
    this.prevNormalizedMousePos.x = this.normalizedMousePos.x
    this.prevNormalizedMousePos.y = this.normalizedMousePos.y

    this.prevMousePos.x = this.mousePos.x
    this.prevMousePos.y = this.mousePos.y

    this.mousePos.x = e.clientX - RendererClass.getInstance().renderer.domElement.offsetLeft
    this.mousePos.y = e.clientY - RendererClass.getInstance().renderer.domElement.offsetTop

    this.mouseDelta = this.mousePos.clone().sub(this.prevMousePos)

    this.movement.x = e.movementX
    this.movement.y = e.movementY

    const x = e.clientX - RendererClass.getInstance().renderer.domElement.offsetLeft
    const y = e.clientY - RendererClass.getInstance().renderer.domElement.offsetTop

    this.normalizedMousePos.x = x / RendererClass.getInstance().renderer.domElement.width
    this.normalizedMousePos.y = 1 - y / RendererClass.getInstance().renderer.domElement.height

    super.onMouseMove()
  }

  renderFrame ({ dt } = {}) {
    super.renderFrame()
  }
}

export default MouseClass
