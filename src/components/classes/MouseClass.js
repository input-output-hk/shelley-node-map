import {
  Vector2
} from 'three'

import { lerp } from '../../helpers/math'

import BaseClass from './BaseClass'

class MouseClass extends BaseClass {
  init () {
    this.mousePos = new Vector2()
    this.smoothedMousePos = new Vector2()
    this.normalizedMousePos = new Vector2()
    super.init()
  }

  onMouseMove (e) {
    this.mousePos.x = e.clientX
    this.mousePos.y = e.clientY

    this.normalizedMousePos.x = e.clientX
    this.normalizedMousePos.y = window.innerHeight - (e.clientY)

    super.onMouseMove()
  }

  renderFrame ({ dt } = {}) {
    this.smoothedMousePos.x = lerp(this.smoothedMousePos.x, this.normalizedMousePos.x, dt * 2)
    this.smoothedMousePos.y = lerp(this.smoothedMousePos.y, this.normalizedMousePos.y, dt * 2)

    super.renderFrame()
  }
}

export default MouseClass
