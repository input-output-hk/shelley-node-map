import {
  Mesh,
  BufferGeometry,
  CylinderGeometry,
  InstancedBufferGeometry,
  InstancedBufferAttribute,
  ShaderLib,
  Color,
  Object3D,
  Vector3,
  Vector2,
  MeshBasicMaterial
} from 'three'

import TWEEN from 'tween.js'

import BaseClass from './BaseClass'

import { latLongToCartesian } from '../../helpers/math'

// import { coords } from '../../data/test'

// shaders
import fragmentShader from '../../shaders/markers.frag'
import vertexShader from '../../shaders/markers.vert'
import CameraClass from './CameraClass'
import IcosaSceneClass from './IcosaSceneClass'

class MarkersClass extends BaseClass {
  init (data) {
    let coords = data

    this.camTween = null
    this.updateCamPos = true
    this.selectionRef = new Object3D()
    this.selectionRefPos = new Vector3()
    this.selectedNodePosScreen = new Vector3()
    IcosaSceneClass.getInstance().scene.add(this.selectionRef)

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

    data.pos = pos
    this.ipMap[index] = data

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

  setNodePosInScreenSpace () {
    this.selectionRefPos.setFromMatrixPosition(this.selectionRef.matrixWorld)
    this.selectionRefPos.project(CameraClass.getInstance().camera)

    this.selectedNodePosScreen = new Vector2(
      (this.selectionRefPos.x + 1) * this.width * 0.5,
      (1 - this.selectionRefPos.y) * this.height * 0.5
    )
  }

  setSelectionRef (nodePos) {
    this.selectionRef.position.set(nodePos.x, nodePos.y, nodePos.z)
  }

  highlight (data) {
    return new Promise((resolve, reject) => {
      let that = this

      this.ipMap.forEach((nodeData, index) => {
        if (nodeData.ip === data.ip) {
          if (that.camTween) {
            that.camTween.stop()
          }

          const nodePos = new Vector3(
            that.offsetsAttr.array[index * 3 + 0],
            that.offsetsAttr.array[index * 3 + 1],
            that.offsetsAttr.array[index * 3 + 2]
          )

          this.setSelectionRef(nodePos)

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

  resize (width, height) {
    this.width = width
    this.height = height
  }

  renderFrame (args) {
    this.material.uniforms.uTime.value += args.dt
    this.material.uniforms.uDTime.value = args.dt

    this.setNodePosInScreenSpace()

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
