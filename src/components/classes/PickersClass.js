import {
  Mesh,
  BufferGeometry,
  CylinderGeometry,
  InstancedBufferGeometry,
  InstancedBufferAttribute,
  Color,
  Object3D,
  ShaderMaterial,
  WebGLRenderTarget,
  LinearFilter,
  Vector3
} from 'three'

import BaseClass from './BaseClass'

import { latLongToCartesian } from '../../helpers/math'

// shaders
import fragmentShader from '../../shaders/pickers.frag'
import vertexShader from '../../shaders/pickers.vert'

import RendererClass from './RendererClass'
import CameraClass from './CameraClass'
import PickerSceneClass from './PickerSceneClass'
import MouseClass from './MouseClass'
import MarkersClass from './MarkersClass'

class PickersClass extends BaseClass {
  init (data) {
    this.lastHoveredID = -1
    this.lastSelectedID = -1
    this.hoveredIP = ''

    this.pickingTexture = new WebGLRenderTarget(window.innerWidth, window.innerHeight)
    this.pickingTexture.texture.minFilter = LinearFilter
    this.pickingTexture.texture.generateMipmaps = false

    let coords = data

    this.nodeCount = coords.length
    this.instanceTotal = 1000 // max number of instances

    this.material = new PickersMaterial({})

    const tubeGeo = new CylinderGeometry(0.0, 0.005, 0.06, 3)
    const tubeBufferGeo = new BufferGeometry().fromGeometry(tubeGeo)
    this.geometry = new InstancedBufferGeometry().copy(tubeBufferGeo)
    this.geometry.rotateX(Math.PI / 2)

    this.offsetsAttr = new InstancedBufferAttribute(new Float32Array(this.instanceTotal * 3).fill(99999), 3)
    this.idAttr = new InstancedBufferAttribute(new Float32Array(this.instanceTotal), 1)
    this.scalesAttr = new InstancedBufferAttribute(new Float32Array(this.instanceTotal), 1)
    this.quaternionsAttr = new InstancedBufferAttribute(new Float32Array(this.instanceTotal * 4), 4)
    this.pickingColorsAttr = new InstancedBufferAttribute(new Float32Array(this.instanceTotal * 3), 3)

    this.geometry.setAttribute('offset', this.offsetsAttr)
    this.geometry.setAttribute('scale', this.scalesAttr)
    this.geometry.setAttribute('quaternion', this.quaternionsAttr)
    this.geometry.setAttribute('id', this.idAttr)
    this.geometry.setAttribute('pickerColor', this.pickingColorsAttr)

    this.pickColor = new Color(0x999999)

    for (let index = 0; index < this.nodeCount; index++) {
      if (typeof coords[index] !== 'undefined') {
        this.addNodeGeoData(coords[index], index)
      }
    }

    this.mesh = new Mesh(this.geometry, this.material)
    this.mesh.frustumCulled = false
  }

  addNodeGeoData (data, index) {
    this.pickColor.setHex(index + 1)
    this.pickingColorsAttr.array[index * 3 + 0] = this.pickColor.r
    this.pickingColorsAttr.array[index * 3 + 1] = this.pickColor.g
    this.pickingColorsAttr.array[index * 3 + 2] = this.pickColor.b

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

    this.scalesAttr.array[index] = 2.0

    this.idAttr.array[index] = index

    this.geometry.attributes.offset.needsUpdate = true
    this.geometry.attributes.scale.needsUpdate = true
    this.geometry.attributes.quaternion.needsUpdate = true
    this.geometry.attributes.id.needsUpdate = true
    this.geometry.attributes.pickerColor.needsUpdate = true
  }

  addNode (data) {
    this.nodeCount += 1
    this.addNodeGeoData(data, this.nodeCount)
  }

  resize (width, height) {
    this.width = width
    this.height = height

    this.pickingTexture.setSize(this.width, this.height)
  }

  renderFrame () {
    RendererClass.getInstance().renderer.autoClear = true
    RendererClass.getInstance().renderer.setRenderTarget(this.pickingTexture)
    RendererClass.getInstance().renderer.render(PickerSceneClass.getInstance().scene, CameraClass.getInstance().camera)

    const pixelBuffer = new Uint8Array(4)
    pixelBuffer[3] = 255

    RendererClass.getInstance().renderer.readRenderTargetPixels(
      this.pickingTexture,
      MouseClass.getInstance().mousePos.x,
      this.pickingTexture.height - (MouseClass.getInstance().mousePos.y),
      1,
      1,
      pixelBuffer
    )

    const id = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | (pixelBuffer[2] - 1)

    if (this.lastHoveredID !== id) {
      this.lastHoveredID = id

      if (typeof MarkersClass.getInstance().ipMap[id] !== 'undefined') {
        this.hoveredData = MarkersClass.getInstance().ipMap[id]
        MarkersClass.getInstance().setSelectionRef(this.hoveredData.pos)

        this.emit('nodeMouseOver', this.hoveredData)

        document.body.style.cursor = 'pointer'
      } else {
        this.emit('nodeMouseOut', {})

        // MarkersClass.getInstance().setSelectionRef(new Vector3(0, 0, 0))

        document.body.style.cursor = 'default'
      }
    }

    super.renderFrame()
  }
}

class PickersMaterial extends ShaderMaterial {
  constructor (config) {
    super(config)
    this.type = 'ShaderMaterial'

    this.uniforms = {}

    this.vertexShader = vertexShader
    this.fragmentShader = fragmentShader
  }
}

export default PickersClass
