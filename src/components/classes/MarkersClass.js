import {
  Mesh,
  BufferGeometry,
  CylinderGeometry,
  InstancedBufferGeometry,
  InstancedBufferAttribute,
  ShaderLib,
  Color,
  Object3D,
  MeshBasicMaterial
} from 'three'

import BaseClass from './BaseClass'

import { latLongToCartesian } from '../../helpers/math'

import { coords } from '../../data/test'

// shaders
import fragmentShader from '../../shaders/markers.frag'
import vertexShader from '../../shaders/markers.vert'

class MarkersClass extends BaseClass {
  init () {
    this.instanceTotal = coords.length

    this.material = new MarkersMaterial({
      color: new Color(0xcccccc),
      flatShading: true
    })

    const tubeGeo = new CylinderGeometry(0.0, 0.006, 0.08, 6)
    const tubeBufferGeo = new BufferGeometry().fromGeometry(tubeGeo)
    this.geometry = new InstancedBufferGeometry().copy(tubeBufferGeo)
    this.geometry.rotateX(Math.PI / 2)

    this.offsetsAttr = new InstancedBufferAttribute(new Float32Array(this.instanceTotal * 3).fill(99999), 3)
    this.scalesAttr = new InstancedBufferAttribute(new Float32Array(this.instanceTotal), 1)
    this.quaternionsAttr = new InstancedBufferAttribute(new Float32Array(this.instanceTotal * 4), 4)
    this.isHoveredAttr = new InstancedBufferAttribute(new Float32Array(this.instanceTotal), 1)
    this.isSelectedAttr = new InstancedBufferAttribute(new Float32Array(this.instanceTotal), 1)

    for (let index = 0; index < this.instanceTotal; index++) {
      if (typeof coords[index] !== 'undefined') {
        const pos = latLongToCartesian(coords[index].lat, coords[index].long, this.config.scene.sphereRadius * 1.05)

        const x = this.offsetsAttr.array[index * 3 + 0] = pos.x
        const y = this.offsetsAttr.array[index * 3 + 1] = pos.y
        const z = this.offsetsAttr.array[index * 3 + 2] = pos.z

        const dummyObject = new Object3D()
        dummyObject.position.set(x, y, z)
        dummyObject.lookAt(0, 0, 0)

        this.quaternionsAttr.array[index * 4 + 0] = dummyObject.quaternion.x
        this.quaternionsAttr.array[index * 4 + 1] = dummyObject.quaternion.y
        this.quaternionsAttr.array[index * 4 + 2] = dummyObject.quaternion.z
        this.quaternionsAttr.array[index * 4 + 3] = dummyObject.quaternion.w
      }
    }

    this.geometry.addAttribute('offset', this.offsetsAttr)
    this.geometry.addAttribute('scale', this.scalesAttr)
    this.geometry.addAttribute('quaternion', this.quaternionsAttr)
    this.geometry.addAttribute('isHovered', this.isHoveredAttr)
    this.geometry.addAttribute('isSelected', this.isSelectedAttr)

    this.mesh = new Mesh(this.geometry, this.material)

    this.mesh.frustumCulled = false

    super.init()
  }

  renderFrame (args) {
    this.material.uniforms.uTime.value += args.dt

    super.renderFrame()
  }
}

class MarkersMaterial extends MeshBasicMaterial {
  constructor (config) {
    super(config)
    this.type = 'ShaderMaterial'

    this.uniforms = ShaderLib.basic.uniforms

    this.uniforms.uTime = {
      type: 'f',
      value: 0.0
    }

    this.vertexShader = vertexShader
    this.fragmentShader = fragmentShader
    this.lights = true
  }
}

export default MarkersClass
