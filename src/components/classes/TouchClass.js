import {
  Vector2
} from 'three'

import { lerp } from '../../helpers/math'

import BaseClass from './BaseClass'

class TouchClass extends BaseClass {
  init () {
    this.touchPos = new Vector2()
    this.normalizedTouchPos = new Vector2()
    this.smoothedTouchPos = new Vector2()
    super.init()
  }

  onTouchMove (e) {
    if (typeof e.touches[0] === 'undefined') {
      return
    } else {
      e = e.touches[0]
    }

    this.touchPos.x = e.clientX
    this.touchPos.y = e.clientY

    this.normalizedTouchPos.x = e.clientX
    this.normalizedTouchPos.y = window.innerHeight - (e.clientY)
  }

  renderFrame ({ dt } = {}) {
    this.smoothedTouchPos.x = lerp(this.smoothedTouchPos.x, this.normalizedTouchPos.x, dt * 2)
    this.smoothedTouchPos.y = lerp(this.smoothedTouchPos.y, this.normalizedTouchPos.y, dt * 2)

    super.renderFrame()
  }
}

export default TouchClass
