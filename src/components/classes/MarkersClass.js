import {
  Mesh,
  BufferGeometry,
  CylinderGeometry,
  InstancedBufferGeometry,
  InstancedBufferAttribute,
  ShaderLib,
  Color,
  Object3D,
  MeshLambertMaterial,
  Vector3
} from 'three'

import TWEEN from 'tween.js'

import BaseClass from './BaseClass'

import { latLongToCartesian } from '../../helpers/math'

// import { coords } from '../../data/test'

// shaders
import fragmentShader from '../../shaders/markers.frag'
import vertexShader from '../../shaders/markers.vert'
import CameraClass from './CameraClass'

class MarkersClass extends BaseClass {
  init (data) {
    let coords = data

    this.camTween = null
    this.updateCamPos = true

    this.nodeCount = coords.length

    this.instanceTotal = 1000 // max number of instances

    this.material = new MarkersMaterial({
      color: new Color(0x888888),
      flatShading: true,
      wireframe: true
    })

    const tubeGeo = new CylinderGeometry(0.0, 0.005, 0.06, 3)
    const tubeBufferGeo = new BufferGeometry().fromGeometry(tubeGeo)
    this.geometry = new InstancedBufferGeometry().copy(tubeBufferGeo)
    this.geometry.rotateX(Math.PI / 2)

    this.ipMap = []
    this.offsetsAttr = new InstancedBufferAttribute(new Float32Array(this.instanceTotal * 3).fill(99999), 3)
    this.idAttr = new InstancedBufferAttribute(new Float32Array(this.instanceTotal), 1)
    this.scalesAttr = new InstancedBufferAttribute(new Float32Array(this.instanceTotal), 1)
    this.quaternionsAttr = new InstancedBufferAttribute(new Float32Array(this.instanceTotal * 4), 4)
    this.isHoveredAttr = new InstancedBufferAttribute(new Float32Array(this.instanceTotal), 1)
    this.isSelectedAttr = new InstancedBufferAttribute(new Float32Array(this.instanceTotal), 1)

    this.geometry.setAttribute('offset', this.offsetsAttr)
    this.geometry.setAttribute('scale', this.scalesAttr)
    this.geometry.setAttribute('quaternion', this.quaternionsAttr)
    this.geometry.setAttribute('isHovered', this.isHoveredAttr)
    this.geometry.setAttribute('isSelected', this.isSelectedAttr)
    this.geometry.setAttribute('id', this.idAttr)

    for (let index = 0; index < this.nodeCount; index++) {
      if (typeof coords[index] !== 'undefined') {
        this.addNodeGeoData(coords[index], index)
      }
    }

    this.mesh = new Mesh(this.geometry, this.material)

    this.mesh.frustumCulled = false

    // super.init()
  }

  addNodeGeoData (data, index) {
    const pos = latLongToCartesian(data.lat, data.long, this.config.scene.sphereRadius * 1.05)

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

    this.scalesAttr.array[index] = 1.0

    this.idAttr.array[index] = index

    this.ipMap[index] = data.ip

    this.geometry.attributes.offset.needsUpdate = true
    this.geometry.attributes.scale.needsUpdate = true
    this.geometry.attributes.quaternion.needsUpdate = true
    this.geometry.attributes.isHovered.needsUpdate = true
    this.geometry.attributes.isSelected.needsUpdate = true
    this.geometry.attributes.id.needsUpdate = true
  }

  addNode (data) {
    this.nodeCount += 1
    this.addNodeGeoData(data, this.nodeCount)
  }

  getArcFromCoords (camPos, endPos, steps) {
    // get normal of both points
    let cb = new Vector3()
    let ab = new Vector3()
    let normal = new Vector3()
    cb.subVectors(new Vector3(), endPos)
    ab.subVectors(camPos, endPos)
    cb.cross(ab)
    normal.copy(cb).normalize()

    const angle = camPos.angleTo(endPos) // get the angle between vectors
    const angleDelta = angle / (steps)

    let points = []
    for (var i = 0; i <= steps; i++) {
      points.push(camPos.clone().applyAxisAngle(normal, angleDelta * i))
    }

    return points
  }

  stopUpdateCamPos () {
    this.updateCamPos = false
  }

  highlight (data) {
    return new Promise((resolve, reject) => {
      let that = this

      this.ipMap.forEach((ip, index) => {
        if (ip === data.ip) {
          if (that.camTween) {
            that.camTween.stop()
          }

          const nodePos = new Vector3(
            that.offsetsAttr.array[index * 3 + 0],
            that.offsetsAttr.array[index * 3 + 1],
            that.offsetsAttr.array[index * 3 + 2]
          )

          const steps = 25
          let points = this.getArcFromCoords(CameraClass.getInstance().camera.position, nodePos, steps)

          that.camTween = new TWEEN.Tween({ step: 0 })
            .to({ step: steps }, 3000)
            .onUpdate(function () {
              if (!that.updateCamPos) {
                return
              }

              // lerp between points on arc
              const pos1 = points[Math.floor(this.step)]
              const pos2 = points[Math.floor(this.step + 1)]
              if (typeof pos2 !== 'undefined') {
                const pos = pos1.clone().lerp(pos2, this.step % 1)
                CameraClass.getInstance().camera.position.set(pos.x, pos.y, pos.z)
              }
            })
            .onComplete(() => {
              that.updateCamPos = true
              const properties = { scale: 5.0 }
              new TWEEN.Tween(properties)
                .to({ scale: 1.0 }, 2000)
                .onUpdate(function () {
                  that.scalesAttr.array[index] = properties.scale
                  that.scalesAttr.needsUpdate = true
                })
                .onComplete(() => {
                  resolve()
                })
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start()
            })
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start()
        }
      })
    })
  }

  renderFrame (args) {
    this.material.uniforms.uTime.value += args.dt
    this.material.uniforms.uDTime.value = args.dt

    super.renderFrame()
  }
}

class MarkersMaterial extends MeshLambertMaterial {
  constructor (config) {
    super(config)
    this.type = 'ShaderMaterial'

    this.uniforms = ShaderLib.lambert.uniforms

    this.uniforms.uTime = {
      type: 'f',
      value: 0.0
    }

    this.uniforms.uDTime = {
      type: 'f',
      value: 0.0
    }

    this.vertexShader = vertexShader
    this.fragmentShader = fragmentShader
    this.lights = true
  }
}

export default MarkersClass
