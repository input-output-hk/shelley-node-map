
/* ------------------------------------------
3rd Party
------------------------------------------ */
import {
  WebGLRenderTarget,
  NoBlending,
  LinearFilter,
  RGBAFormat,
  PlaneBufferGeometry,
  Mesh,
  ShaderMaterial,
  Scene,
  PerspectiveCamera,
  Vector2,
  OrthographicCamera

} from 'three'

/* ------------------------------------------
Classes
------------------------------------------ */
import BaseClass from './BaseClass'
import GlobeSceneClass from './GlobeSceneClass'
import IcosaSceneClass from './IcosaSceneClass'
import RendererClass from './RendererClass'
import CameraClass from './CameraClass'

import ParticlesClass from './ParticlesClass'

/* ------------------------------------------
Shaders
------------------------------------------ */
import PassThroughVert from '../../shaders/passThrough.vert'
import MousePosFrag from '../../shaders/mousePos.frag'
import EdgeDetectFrag from '../../shaders/edgeDetect.frag'
import BlurFrag from '../../shaders/blur.frag'
import MouseClass from './MouseClass'

class FBOClass extends BaseClass {
  init ({
    width,
    height
  } = {}) {
    this.frame = 0
    this.width = width
    this.height = height

    this.initRenderTargets()
    this.initMaterial()
    this.initMousePos()
    this.addMesh()
  }

  initRenderTargets () {
    this.RTGlobe = new WebGLRenderTarget(
      this.width,
      this.height,
      {
        minFilter: LinearFilter,
        magFilter: LinearFilter,
        format: RGBAFormat,
        type: this.config.floatType,
        depthWrite: false,
        depthBuffer: false,
        stencilBuffer: false
      }
    )

    this.RTParticles = this.RTGlobe.clone()
    this.rt3 = this.RTGlobe.clone()
    this.rt4 = this.RTGlobe.clone()
  }

  initMaterial () {
    this.edgeMaterial = new ShaderMaterial({
      uniforms: {
        uTexture: { type: 't' }
      },
      vertexShader: PassThroughVert,
      fragmentShader: EdgeDetectFrag,
      blending: NoBlending,
      transparent: false,
      fog: false,
      lights: false,
      depthWrite: false,
      depthTest: false
    })

    this.blurMaterial = new ShaderMaterial({
      uniforms: {
        uTexture: { type: 't' }
      },
      vertexShader: PassThroughVert,
      fragmentShader: BlurFrag,
      blending: NoBlending,
      transparent: false,
      fog: false,
      lights: false,
      depthWrite: false,
      depthTest: false
    })
  }

  addMesh () {
    this.particleScene = new Scene()
    this.particleScene.add(ParticlesClass.getInstance().mesh)

    this.particleCamera = new PerspectiveCamera(
      this.config.camera.fov,
      1.0,
      this.config.camera.near,
      this.config.camera.far
    )
    this.particleCamera.position.x = 0
    this.particleCamera.position.y = 0
    this.particleCamera.position.z = 0.9
    this.particleCamera.updateMatrixWorld()
  }

  initMousePos () {
    this.mousePosRT1 = new WebGLRenderTarget(
      this.width,
      this.height,
      {
        minFilter: LinearFilter,
        magFilter: LinearFilter,
        format: RGBAFormat,
        type: this.config.floatType,
        depthWrite: false,
        depthBuffer: false,
        stencilBuffer: false
      })

    this.mousePosRT2 = this.mousePosRT1.clone()

    this.mousePosScene = new Scene()
    this.mousePosMaterial = new ShaderMaterial({
      uniforms: {
        uMousePosTexture: {
          type: 't',
          value: null
        },
        uMousePos: {
          type: 'v2',
          value: new Vector2(0, 0)
        },
        uPrevMousePos: {
          type: 'v2',
          value: new Vector2(0, 0)
        },
        uDir: {
          type: 'v2',
          value: new Vector2(0, 0)
        }
      },
      vertexShader: PassThroughVert,
      fragmentShader: MousePosFrag
    })
    const mesh = new Mesh(new PlaneBufferGeometry(2, 2), this.mousePosMaterial)
    mesh.frustumCulled = false
    this.mousePosScene.add(mesh)

    this.mousePosCamera = new OrthographicCamera()
    this.mousePosCamera.position.z = 1
    this.mousePosCamera.updateMatrixWorld()

    this.mousePosTexture = null
  }

  resize (width, height) {
    this.RTGlobe.setSize(width, height)
    this.RTParticles.setSize(width, height)
    super.resize()
  }

  renderFrame () {
    this.frame++

    // standard scene
    RendererClass.getInstance().renderer.setRenderTarget(this.RTGlobe)
    RendererClass.getInstance().renderer.autoClear = false
    RendererClass.getInstance().renderer.render(GlobeSceneClass.getInstance().scene, CameraClass.getInstance().camera)

    // particles scene
    ParticlesClass.getInstance().mesh.material.uniforms.uTexture.value = this.RTGlobe.texture
    RendererClass.getInstance().renderer.setRenderTarget(null)
    RendererClass.getInstance().renderer.autoClear = false
    RendererClass.getInstance().renderer.render(IcosaSceneClass.getInstance().scene, CameraClass.getInstance().camera)

    RendererClass.getInstance().renderer.setRenderTarget(null)
    RendererClass.getInstance().renderer.autoClear = false
    RendererClass.getInstance().renderer.render(this.particleScene, this.particleCamera)

    // mouse position
    this.mousePosMaterial.uniforms.uMousePos.value = MouseClass.getInstance().normalizedMousePos
    this.mousePosMaterial.uniforms.uPrevMousePos.value = MouseClass.getInstance().prevNormalizedMousePos
    this.mousePosMaterial.uniforms.uDir.value = MouseClass.getInstance().normalizedDir

    let inputPositionRenderTarget = this.mousePosRT1
    this.outputPositionRenderTarget = this.mousePosRT2
    if (this.frame % 2 === 0) {
      inputPositionRenderTarget = this.mousePosRT2
      this.outputPositionRenderTarget = this.mousePosRT1
    }

    this.mousePosMaterial.uniforms.uMousePosTexture.value = inputPositionRenderTarget.texture

    RendererClass.getInstance().renderer.setRenderTarget(this.outputPositionRenderTarget)
    RendererClass.getInstance().renderer.render(this.mousePosScene, this.mousePosCamera)

    this.mousePosTexture = this.outputPositionRenderTarget.texture

    // RendererClass.getInstance().renderer.setRenderTarget(null)
    // RendererClass.getInstance().renderer.render(this.mousePosScene, this.mousePosCamera)

    super.renderFrame()
  }
}

export default FBOClass
