import {
  Vector2,
  InstancedBufferGeometry,
  InstancedBufferAttribute,
  Mesh,
  ShaderLib,
  ShaderMaterial,
  PlaneBufferGeometry,
  AdditiveBlending
} from 'three'

import BaseClass from './BaseClass'

// shaders
import fragmentShader from '../../shaders/particles.frag'
import vertexShader from '../../shaders/particles.vert'

class ParticlesClass extends BaseClass {
  init (numPoints = 100) {
    let numVisible = numPoints / 6

    this.material = new ParticlesMaterial({
      transparent: true,
      blending: AdditiveBlending
    })

    this.uniforms = ShaderLib.standard.uniforms
    this.uniforms.uTextureSize = { value: new Vector2(this.config.scene.width, this.config.scene.height) }
    this.uniforms.uTexture = { value: null }
    this.uniforms.uTime = { value: 0.0 }
    this.material.uniforms = this.uniforms

    this.geometry = new InstancedBufferGeometry()

    const refGeo = new PlaneBufferGeometry(1, 1)

    this.geometry.addAttribute('position', refGeo.attributes.position)
    this.geometry.addAttribute('uv', refGeo.attributes.uv)
    this.geometry.setIndex(refGeo.index)

    const offsets = new Float32Array(numVisible * 3)

    let step = 6

    for (let i = 0; i < numPoints; i++) {
      offsets[i * 3 + 0] = (i * step) % this.config.scene.width
      offsets[i * 3 + 1] = Math.floor((i * step) / this.config.scene.width)
      offsets[i * 3 + 2] = 0
    }

    this.geometry.addAttribute('offset', new InstancedBufferAttribute(offsets, 3, false))

    this.mesh = new Mesh(this.geometry, this.material)

    this.mesh.position.z = 0.1

    super.init()
  }

  renderFrame (args) {
    this.material.uniforms.uTime.value += args.dt

    super.renderFrame()
  }
}

class ParticlesMaterial extends ShaderMaterial {
  constructor (config) {
    super(config)
    this.type = 'ShaderMaterial'

    this.vertexShader = vertexShader
    this.fragmentShader = fragmentShader
    this.lights = true
  }
}

export default ParticlesClass
