import {
  Mesh,
  SphereBufferGeometry,
  MeshBasicMaterial,
  Color,
  TextureLoader
} from 'three'

import BaseClass from './BaseClass'

// textures
import map from '../../assets/globeBW.jpg'
import mapE from '../../assets/globeBWe.jpg'

class GlobeClass extends BaseClass {
  init () {
    if (this.config.scene.lowBandwidth) {
      this.map = new TextureLoader().load(mapE)
    } else {
      this.map = new TextureLoader().load(map)
    }

    this.geometry = new SphereBufferGeometry(this.config.scene.sphereRadius, 32, 32)
    this.material = new MeshBasicMaterial({
      color: new Color(0xffffff),
      opacity: 1.0,
      map: this.map
    })
    this.mesh = new Mesh(this.geometry, this.material)

    super.init()
  }
}

export default GlobeClass
