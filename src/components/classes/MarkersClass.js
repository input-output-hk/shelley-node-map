import {
  Mesh,
  BufferGeometry,
  CylinderGeometry,
  InstancedBufferGeometry,
  InstancedBufferAttribute,
  MeshStandardMaterial,
  ShaderLib,
  Color,
  BoxBufferGeometry,
  RingBufferGeometry,
  Vector3,
  Object3D,
  DoubleSide,
  MeshPhysicalMaterial
} from 'three'

import BaseClass from './BaseClass'

// shaders
import fragmentShader from '../../shaders/markers.frag'
import vertexShader from '../../shaders/markers.vert'

class MarkersClass extends BaseClass {
  latLongToCartesian (lat, long) {
    const radius = this.config.scene.sphereRadius * 1.1
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (long + 180) * (Math.PI / 180)
    const x = radius * Math.sin(phi) * Math.cos(theta) * -1
    const z = radius * Math.sin(phi) * Math.sin(theta)
    const y = radius * Math.cos(phi)
    return { x, y, z }
  }

  init () {
    this.instanceTotal = 100

    this.material = new MarkersMaterial({
      color: new Color(0xcccccc),
      metalness: 0.6,
      roughness: 0.5,
      flatShading: true,
      depthTest: false,
      depthWrite: false
    })

    const tubeGeo = new CylinderGeometry(0.0, 0.01, 0.1, 6)
    const tubeBufferGeo = new BufferGeometry().fromGeometry(tubeGeo)
    this.geometry = new InstancedBufferGeometry().copy(tubeBufferGeo)
    this.geometry.rotateX(Math.PI / 2)

    this.offsetsAttr = new InstancedBufferAttribute(new Float32Array(this.instanceTotal * 3).fill(99999), 3)
    this.scalesAttr = new InstancedBufferAttribute(new Float32Array(this.instanceTotal), 1)
    this.quaternionsAttr = new InstancedBufferAttribute(new Float32Array(this.instanceTotal * 4), 4)
    this.isHoveredAttr = new InstancedBufferAttribute(new Float32Array(this.instanceTotal), 1)
    this.isSelectedAttr = new InstancedBufferAttribute(new Float32Array(this.instanceTotal), 1)

    const coords = [
      { lat: 51.229424, long: -2.322441 },
      { lat: 31.0449, long: 121.4012 },
      { lat: 38.6583, long: -77.2481 },
      { lat: 37.5112, long: 126.9741 },
      { lat: 32.3485, long: -97.3311 },
      { lat: 50.1188, long: 8.6843 },
      { lat: 40.4143, long: -3.7016 },
      { lat: 51.2993, long: 9.491 },
      { lat: 35.1731, long: 149.107 },
      { lat: -27.4833, long: 153.0053 },
      { lat: 35.6882, long: 139.7532 },
      { lat: 35.6882, long: 139.7532 },
      { lat: 37.3388, long: -121.8914 },
      { lat: 37.3388, long: -121.8914 },
      { lat: 39.9653, long: -83.0235 },
      { lat: 34.8224, long: 135.4301 },
      { lat: 52.3902, long: 4.6568 },
      { lat: 38.7095, long: -78.1539 },
      { lat: 53.3338, long: -6.2488 },
      { lat: 56.752, long: -111.4398 },
      { lat: 43.6547, long: -79.3623 },
      { lat: -27.4737, long: 153.0169 },
      { lat: -33.8591, long: 151.2002 },
      { lat: 37.3387, long: -121.8914 },
      { lat: 51.5353, long: -0.6658 },
      { lat: 51.2993, long: 9.491 },
      { lat: 49.405, long: 11.1617 },
      { lat: 49.405, long: 11.1617 },
      { lat: 37.751, long: -97.822 },
      { lat: 51.2993, long: 9.491 }
    ]

    for (let index = 0; index < this.instanceTotal; index++) {
      if (typeof coords[index] !== 'undefined') {
        const pos = this.latLongToCartesian(coords[index].lat, coords[index].long)

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

class MarkersMaterial extends MeshPhysicalMaterial {
  constructor (config) {
    super(config)
    this.type = 'ShaderMaterial'

    this.uniforms = ShaderLib.physical.uniforms

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
