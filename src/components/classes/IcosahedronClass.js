import {
  Mesh,
  IcosahedronBufferGeometry,
  MeshBasicMaterial,
  Color,
  AdditiveBlending,
  SphereBufferGeometry
} from 'three'

import BaseClass from './BaseClass'

class IcosahedronClass extends BaseClass {
  init () {
    this.geometry = new IcosahedronBufferGeometry(this.config.scene.sphereRadius * 1.1, 1)
    this.material = new MeshBasicMaterial({
      color: new Color(0x710000),
      wireframe: true,
      opacity: 0.13,
      transparent: true,
      blending: AdditiveBlending
    })
    this.mesh = new Mesh(this.geometry, this.material)

    this.geometry2 = new SphereBufferGeometry(this.config.scene.sphereRadius * 1.04, 10, 10)
    this.material2 = new MeshBasicMaterial({
      color: new Color(0x000000)
    })
    this.mesh2 = new Mesh(this.geometry2, this.material2)

    super.init()
  }
}

export default IcosahedronClass
