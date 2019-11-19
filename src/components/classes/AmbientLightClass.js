import {
  AmbientLight
} from 'three'

import BaseClass from './BaseClass'

class AmbientLightClass extends BaseClass {
  init () {
    this.light = new AmbientLight(this.config.scene.ambientLightColor, this.config.scene.ambientLightIntensity)

    super.init()
  }
}

export default AmbientLightClass
