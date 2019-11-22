import {
  Vector2
} from 'three'

import { lerp } from '../../helpers/math'

import BaseClass from './BaseClass'
import RendererClass from './RendererClass'

class MouseClass extends BaseClass {
  init () {
    this.prevMousePos = new Vector2(0, 0)
    this.smoothedDelta = new Vector2(0, 0)
    this.mouseDelta = new Vector2(0, 0)
    this.movement = new Vector2()
    this.mousePos = new Vector2()
    this.smoothedMousePos = new Vector2()
    this.normalizedMousePos = new Vector2()
    this.prevNormalizedMousePos = new Vector2()

    this.normalizedDir = new Vector2()
    // super.init()
  }

  onMouseMove (e) {
    this.prevNormalizedMousePos.x = this.normalizedMousePos.x
    this.prevNormalizedMousePos.y = this.normalizedMousePos.y

    this.prevMousePos.x = this.mousePos.x
    this.prevMousePos.y = this.mousePos.y

    this.mousePos.x = e.clientX - RendererClass.getInstance().renderer.domElement.offsetLeft
    this.mousePos.y = e.clientY - RendererClass.getInstance().renderer.domElement.offsetTop

    this.mouseDelta = this.mousePos.clone().sub(this.prevMousePos)
    console.log(this.mouseDelta)

    this.movement.x = e.movementX
    this.movement.y = e.movementY

    const x = e.clientX - RendererClass.getInstance().renderer.domElement.offsetLeft
    const y = e.clientY - RendererClass.getInstance().renderer.domElement.offsetTop

    this.normalizedMousePos.x = x / RendererClass.getInstance().renderer.domElement.width
    this.normalizedMousePos.y = 1 - y / RendererClass.getInstance().renderer.domElement.height

    this.normalizedDir = (this.prevNormalizedMousePos.clone().sub(this.normalizedMousePos))

    super.onMouseMove()
  }

  renderFrame ({ dt } = {}) {
    this.smoothedMousePos.x = lerp(this.smoothedMousePos.x, this.normalizedMousePos.x, dt * 2)
    this.smoothedMousePos.y = lerp(this.smoothedMousePos.y, this.normalizedMousePos.y, dt * 2)

    this.smoothedDelta.x = lerp(this.smoothedDelta.x, this.mouseDelta.x, 0.1)
    this.smoothedDelta.y = lerp(this.smoothedDelta.y, this.mouseDelta.y, 0.1)

    super.renderFrame()
  }
}

export default MouseClass
