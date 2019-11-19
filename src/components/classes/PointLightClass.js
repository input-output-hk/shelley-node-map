import {
  PointLight
} from 'three'

import BaseClass from './BaseClass'

class PointLightClass extends BaseClass {
  init () {
    this.light = new PointLight(0xffffff, 3.0)
    this.light.position.set(0, 5, 0)

    super.init()
  }
}

export default PointLightClass
