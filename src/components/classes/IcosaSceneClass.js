import {
  Scene
} from 'three'

import BaseClass from './BaseClass'

class IcosaSceneClass extends BaseClass {
  init () {
    this.scene = new Scene()

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

export default IcosaSceneClass
