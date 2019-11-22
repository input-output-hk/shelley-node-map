import {
  Mesh,
  SphereBufferGeometry,
  MeshPhysicalMaterial,
  MeshBasicMaterial,
  Color,
  TextureLoader,
  MeshStandardMaterial
} from 'three'

import BaseClass from './BaseClass'

// textures
import specMap from '../../assets/earthspec1k.jpg'
// import map from '../../assets/earthmap1k.jpg'
import map from '../../assets/globeBW.jpg'
import bumpMap from '../../assets/earthbump1k.jpg'

class GlobeClass extends BaseClass {
  init () {
    this.map = new TextureLoader().load(map)
    this.specMap = new TextureLoader().load(specMap)
    this.bumpMap = new TextureLoader().load(bumpMap)

    this.geometry = new SphereBufferGeometry(this.config.scene.sphereRadius, 32, 32)
    this.material = new MeshBasicMaterial({
      // color: new Color(0xeb2256),
      color: new Color(0xffffff),
      opacity: 1.0,
      // transparent: true,
      map: this.map
      // roughness: 1.0,
      // metalness: 0.0
      // bumpMap: this.bumpMap,
      // roughnessMap: this.specMap,
      // bumpScale: 0.01
    })
    this.mesh = new Mesh(this.geometry, this.material)

    super.init()
  }
}

export default GlobeClass
