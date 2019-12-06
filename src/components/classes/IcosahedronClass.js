import {
  Mesh,
  IcosahedronBufferGeometry,
  MeshBasicMaterial,
  Color,
  AdditiveBlending,
  FrontSide,
  BackSide
} from 'three'

import BaseClass from './BaseClass'

class IcosahedronClass extends BaseClass {
  init () {
    this.geometry = new IcosahedronBufferGeometry(this.config.scene.sphereRadius * 1.08, 1)
    this.material = new MeshBasicMaterial({
      color: new Color(0x711111),
      wireframe: true,
      opacity: 0.1,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      side: FrontSide
    })
    this.mesh = new Mesh(this.geometry, this.material)

    this.mesh.frustumCulled = false

    this.mesh2 = this.mesh.clone()
    this.mesh2.scale.set(0.98, 0.98, 0.98)
    this.mesh2.material = new MeshBasicMaterial({
      color: new Color(0x000000),
      side: BackSide
    })

    this.mesh3 = this.mesh.clone()
    this.mesh3.scale.set(0.98, 0.98, 0.98)
    this.mesh3.material = new MeshBasicMaterial({
      color: new Color(0x000000),
      side: BackSide
    })

    super.init()
  }
}

export default IcosahedronClass
