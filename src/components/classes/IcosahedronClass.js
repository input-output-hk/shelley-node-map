import {
  Mesh,
  IcosahedronBufferGeometry,
  MeshBasicMaterial,
  Color
} from 'three'

import BaseClass from './BaseClass'

class IcosahedronClass extends BaseClass {
  init () {
    this.geometry = new IcosahedronBufferGeometry(this.config.scene.sphereRadius * 1.1, 1)
    this.material = new MeshBasicMaterial({
      color: new Color(0xeb2256),
      wireframe: true,
      opacity: 0.1,
      transparent: true
    })
    this.mesh = new Mesh(this.geometry, this.material)

    super.init()
  }
}

export default IcosahedronClass
