import {
  Vector2
} from 'three'

import BaseClass from './BaseClass'
import RendererClass from './RendererClass'

class TouchClass extends BaseClass {
  init () {
    this.touchPos = new Vector2()
    this.prevTouchPos = new Vector2(0, 0)
    this.normalizedTouchPos = new Vector2()

    this.touchDelta = new Vector2(0, 0)
    this.movement = new Vector2()
    this.touchPos = new Vector2()
    this.normalizedTouchPos = new Vector2()
    this.prevNormalizedTouchPos = new Vector2()
  }

  onTouchMove (e) {
    if (typeof e.touches[0] === 'undefined') {
      return
    } else {
      e = e.touches[0]
    }

    this.prevNormalizedTouchPos.x = this.normalizedTouchPos.x
    this.prevNormalizedTouchPos.y = this.normalizedTouchPos.y

    this.prevTouchPos.x = this.touchPos.x
    this.prevTouchPos.y = this.touchPos.y

    this.touchPos.x = e.clientX - RendererClass.getInstance().renderer.domElement.offsetLeft
    this.touchPos.y = e.clientY - RendererClass.getInstance().renderer.domElement.offsetTop

    this.touchDelta = this.touchPos.clone().sub(this.prevTouchPos)

    this.movement.x = this.touchDelta.x
    this.movement.y = this.touchDelta.y

    const x = e.clientX - RendererClass.getInstance().renderer.domElement.offsetLeft
    const y = e.clientY - RendererClass.getInstance().renderer.domElement.offsetTop

    this.normalizedTouchPos.x = x / RendererClass.getInstance().renderer.domElement.width
    this.normalizedTouchPos.y = 1 - y / RendererClass.getInstance().renderer.domElement.height
  }

  renderFrame ({ dt } = {}) {
    super.renderFrame()
  }
}

export default TouchClass
