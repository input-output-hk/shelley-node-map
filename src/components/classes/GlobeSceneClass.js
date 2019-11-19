import {
  Scene,
  Color
} from 'three'

import BaseClass from './BaseClass'

class GlobeClass extends BaseClass {
  init () {
    this.scene = new Scene()
    this.scene.background = new Color(this.config.scene.bgColor)

    super.init()
  }

  destroy () {
    this.scene.traverse(function (object) {
      if (object.geometry) {
        object.geometry.dispose()
      }
      if (object.material) {
        object.material.dispose()
      }
    })

    super.destroy()
  }
}

export default GlobeClass
