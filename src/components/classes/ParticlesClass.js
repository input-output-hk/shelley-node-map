// 3rd party
import {
  Vector2,
  InstancedBufferGeometry,
  InstancedBufferAttribute,
  Mesh,
  ShaderLib,
  ShaderMaterial,
  PlaneBufferGeometry,
  AdditiveBlending,
  Scene,
  WebGLRenderTarget,
  ClampToEdgeWrapping,
  NearestFilter,
  RGBAFormat,
  OrthographicCamera,
  Vector3
} from 'three'

import BaseClass from './BaseClass'
import MouseClass from './MouseClass'

// shaders
import fragmentShader from '../../shaders/particles.frag'
import vertexShader from '../../shaders/particles.vert'
import PassThroughVert from '../../shaders/passThrough.vert'
import PositionFrag from '../../shaders/position.frag'
import PassThroughFrag from '../../shaders/passThrough.frag'

// classes
import TextureHelper from '../../helpers/TextureHelper'
import RendererClass from './RendererClass'
import FBOClass from './FBOClass'
import CameraClass from './CameraClass'

class ParticlesClass extends BaseClass {
  init (numPoints) {
    this.mouseMoved = 1
    this.frame = 0
    let step = 6

    this.particleCount = Math.round(numPoints / step)

    this.textureHelper = new TextureHelper({
      config: this.config
    })
    this.textureHelper.setTextureSize(this.particleCount)

    this.material = new ParticlesMaterial({
      transparent: true,
      blending: AdditiveBlending
    })
    this.material.uniforms.uTextureSize = { value: new Vector2(this.config.particleScene.width, this.config.particleScene.height) }
    this.material.uniforms.uAspect = { value: CameraClass.getInstance().camera.aspect }

    this.geometry = new InstancedBufferGeometry()
    const refGeo = new PlaneBufferGeometry(1, 1)
    this.geometry.setAttribute('position', refGeo.attributes.position)

    this.geometry.setAttribute('uv', refGeo.attributes.uv)
    this.geometry.setIndex(refGeo.index)

    this.offsets = new Float32Array(this.particleCount * 3)

    for (let i = 0; i < numPoints; i++) {
      this.offsets[i * 3 + 0] = (i * step) % this.config.particleScene.width
      this.offsets[i * 3 + 1] = Math.floor((i * step) / this.config.particleScene.width)
      this.offsets[i * 3 + 2] = 0
    }

    this.geometry.setAttribute('offset', new InstancedBufferAttribute(this.offsets, 3, false))

    const positionArray = new Float32Array(this.particleCount * 3)

    this.setTextureLocations(
      this.particleCount,
      positionArray
    )

    const tPosition = new InstancedBufferAttribute(positionArray, 3)
    this.geometry.setAttribute('tPosition', tPosition)

    this.mesh = new Mesh(this.geometry, this.material)

    this.mesh.position.z = 0.1

    this.positionMaterial = new ShaderMaterial({
      uniforms: {
        positionTexture: {
          type: 't',
          value: null
        },
        defaultPositionTexture: {
          type: 't',
          value: null
        },
        initialPositionTexture: {
          type: 't',
          value: null
        },
        uNoiseMix: {
          type: 'f',
          value: 1.0
        },
        uFrame: {
          type: 'f',
          value: 0.0
        },
        uMousePos: {
          type: 'v2',
          value: new Vector2(0, 0)
        },
        uPrevMousePos: {
          type: 'v2',
          value: new Vector2(0, 0)
        }
      },
      vertexShader: PassThroughVert,
      fragmentShader: PositionFrag
    })

    this.initCamera()
    this.initPassThrough()
    this.initRenderTargets()
    this.initPositions()
  }

  initPassThrough () {
    this.passThroughScene = new Scene()
    this.passThroughMaterial = new ShaderMaterial({
      uniforms: {
        texture: {
          type: 't',
          value: null
        }
      },
      vertexShader: PassThroughVert,
      fragmentShader: PassThroughFrag
    })
    const mesh = new Mesh(new PlaneBufferGeometry(2, 2), this.passThroughMaterial)
    mesh.frustumCulled = false
    this.passThroughScene.add(mesh)
  }

  initRenderTargets () {
    this.positionRenderTarget1 = new WebGLRenderTarget(this.textureHelper.textureWidth, this.textureHelper.textureHeight, {
      wrapS: ClampToEdgeWrapping,
      wrapT: ClampToEdgeWrapping,
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      format: RGBAFormat,
      type: this.config.floatType,
      depthWrite: false,
      depthBuffer: false,
      stencilBuffer: false
    })

    this.positionRenderTarget2 = this.positionRenderTarget1.clone()

    this.outputPositionRenderTarget = this.positionRenderTarget1
  }

  initPositions () {
    this.renderer = RendererClass.getInstance().renderer

    const positionData = this.textureHelper.createPositionTexture()
    this.defaultPositionTexture = positionData.positionTexture
    this.initialPositionTexture = positionData.initialPositionTexture

    this.positionMaterial.uniforms.defaultPositionTexture.value = this.defaultPositionTexture
    this.material.uniforms.defaultPositionTexture.value = this.defaultPositionTexture

    this.positionMaterial.uniforms.initialPositionTexture.value = this.initialPositionTexture
    this.material.uniforms.initialPositionTexture.value = this.initialPositionTexture

    this.positionScene = new Scene()

    this.positionMesh = new Mesh(new PlaneBufferGeometry(2, 2), this.positionMaterial)
    this.positionMesh.frustumCulled = false
    this.positionScene.add(this.positionMesh)
  }

  initCamera () {
    this.quadCamera = new OrthographicCamera()
    this.quadCamera.position.z = 1
  }

  passThroughTexture (input, output) {
    this.passThroughMaterial.uniforms.texture.value = input
    this.renderer.setRenderTarget(output)
    this.renderer.render(this.passThroughScene, this.quadCamera)
  }

  updatePositions () {
    let inputPositionRenderTarget = this.positionRenderTarget1
    this.outputPositionRenderTarget = this.positionRenderTarget2
    if (this.frame % 2 === 0) {
      inputPositionRenderTarget = this.positionRenderTarget2
      this.outputPositionRenderTarget = this.positionRenderTarget1
    }
    this.positionMaterial.uniforms.positionTexture.value = inputPositionRenderTarget.texture

    this.renderer.setRenderTarget(this.outputPositionRenderTarget)
    this.renderer.render(this.positionScene, this.quadCamera)

    this.material.uniforms.positionTexture.value = this.outputPositionRenderTarget.texture
  }

  setTextureLocations (
    nodeCount,
    positionArray
  ) {
    for (let i = 0; i < nodeCount; i++) {
      const textureLocation = this.textureHelper.getNodeTextureLocation(i)
      positionArray[i * 3 + 0] = textureLocation.x
      positionArray[i * 3 + 1] = textureLocation.y
    }
  }

  resize (width, height) {
    this.material.uniforms.uAspect = { value: CameraClass.getInstance().camera.aspect }
    this.material.uniforms.uTextureSize = { value: new Vector2(width * this.config.particleScene.downScaleFactor, height * this.config.particleScene.downScaleFactor) }

    this.mesh.scale.set(1.0, CameraClass.getInstance().camera.aspect, 1.0)
  }

  renderFrame (args) {
    this.frame++

    this.positionMaterial.uniforms.uFrame.value = this.frame
    this.positionMaterial.uniforms.uMousePos.value = MouseClass.getInstance().normalizedMousePos
    this.positionMaterial.uniforms.uPrevMousePos.value = MouseClass.getInstance().prevNormalizedMousePos

    this.material.uniforms.uTime.value += args.dt
    this.material.uniforms.uMousePos.value = MouseClass.getInstance().normalizedMousePos
    this.material.uniforms.uPrevMousePos.value = MouseClass.getInstance().prevNormalizedMousePos
    this.material.uniforms.uMousePosTexture.value = FBOClass.getInstance().mousePosTexture
    this.material.uniforms.uCamPos.value = CameraClass.getInstance().camera.position
    this.material.uniforms.uIsMobile.value = this.config.detector.isMobile

    this.updatePositions()

    if (Math.abs(MouseClass.getInstance().mouseDelta.x) + Math.abs(MouseClass.getInstance().mouseDelta.y) > 1.0) {
      this.mouseMoved = 1.0
    }

    if (this.mouseMoved > 0) {
      this.mouseMoved -= args.dt * 0.7
    }
    if (this.mouseMoved < 0) {
      this.mouseMoved = 0
    }

    this.material.uniforms.uNoiseMix.value = this.mouseMoved
    this.positionMaterial.uniforms.uNoiseMix.value = this.mouseMoved

    super.renderFrame()
  }
}

class ParticlesMaterial extends ShaderMaterial {
  constructor (config) {
    super(config)

    this.type = 'ShaderMaterial'

    this.uniforms = ShaderLib.standard.uniforms

    this.uniforms.uTexture = {
      type: 't',
      value: null
    }

    this.uniforms.uMousePosTexture = {
      type: 't',
      value: null
    }

    this.uniforms.uTime = {
      type: 'f',
      value: 0.0
    }

    this.uniforms.positionTexture = {
      type: 't',
      value: null
    }

    this.uniforms.initialPositionTexture = {
      type: 't',
      value: null
    }

    this.uniforms.defaultPositionTexture = {
      type: 't',
      value: null
    }

    this.uniforms.uMousePos = {
      type: 'v2',
      value: new Vector2(0, 0)
    }

    this.uniforms.uPrevMousePos = {
      type: 'v2',
      value: new Vector2(0, 0)
    }

    this.uniforms.uNoiseMix = {
      type: 'f',
      value: 0.0
    }

    this.uniforms.uAspect = {
      type: 'f',
      value: 1.0
    }

    this.uniforms.uCamPos = {
      type: 'v3',
      value: new Vector3(0, 0, 0)
    }

    this.uniforms.uIsMobile = {
      type: 'f',
      value: 0.0
    }

    this.vertexShader = vertexShader
    this.fragmentShader = fragmentShader
    this.lights = true
  }
}

export default ParticlesClass
