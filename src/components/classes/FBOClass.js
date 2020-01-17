
/* ------------------------------------------
3rd Party
------------------------------------------ */
import {
  WebGLRenderTarget,
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
 Post
 ------------------------------------------ */
import { EffectComposer, ShaderPass, RenderPass, UnrealBloomPass } from '../../post/EffectComposer'
import BrightnessContrastShader from '../../post/BrightnessContrast'
import FXAAShader from '../../post/FXAAShader'
import BlendShader from '../../post/BlendLighten'
import VignetteShader from '../../post/Vignette'

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
import MouseClass from './MouseClass'

import TouchClass from './TouchClass'

class FBOClass extends BaseClass {
  init ({
    width,
    height,
    transparentBackground
  } = {}) {
    this.frame = 0
    this.width = width
    this.height = height

    this.initRenderTargets()
    this.initMousePos()
    this.addMesh()

    this.composer = new EffectComposer(RendererClass.getInstance().renderer)

    this.renderPassMain = new RenderPass(IcosaSceneClass.getInstance().scene, CameraClass.getInstance().camera)
    this.composer.addPass(this.renderPassMain)

    this.renderPassParticles = new RenderPass(this.particleScene, this.particleCamera)
    this.renderPassParticles.clear = false
    this.renderPassParticles.alpha = true
    this.renderPassParticles.transparent = true
    this.composer.addPass(this.renderPassParticles)

    this.BrightnessContrastPass = new ShaderPass(BrightnessContrastShader)
    this.composer.addPass(this.BrightnessContrastPass)

    const alphaSum = transparentBackground ? 0.0 : 1.0

    this.bloomPass = new UnrealBloomPass(new Vector2(this.width, this.height), 0.8, 2, 0.1, alphaSum) // 1.0, 9, 0.5, 512);
    this.composer.addPass(this.bloomPass)

    if (this.config.post.vignette) {
      this.VignettePass = new ShaderPass(VignetteShader)
      this.composer.addPass(this.VignettePass)
    }

    if (this.config.post.blendLighten && !transparentBackground) {
      this.BlendPass = new ShaderPass(BlendShader)
      this.BlendPass.material.uniforms['blendColor'].value = this.config.post.blendColor
      this.composer.addPass(this.BlendPass)
    }

    this.FXAAPass = new ShaderPass(FXAAShader)
    this.FXAAPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth)
    this.FXAAPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight)
    this.FXAAPass.renderToScreen = true
    this.composer.addPass(this.FXAAPass)
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
        },
        uAspect: {
          type: 'f',
          value: 1.0
        }
      },
      vertexShader: PassThroughVert,
      fragmentShader: MousePosFrag
    })
    this.mousePosMesh = new Mesh(new PlaneBufferGeometry(2, 2), this.mousePosMaterial)
    this.mousePosMesh.frustumCulled = false
    this.mousePosScene.add(this.mousePosMesh)

    this.mousePosCamera = new OrthographicCamera()
    this.mousePosCamera.position.z = 1
    this.mousePosCamera.updateMatrixWorld()

    this.mousePosTexture = null
  }

  resize (width, height) {
    this.RTGlobe.setSize(width, height)
    this.RTParticles.setSize(width, height)
    this.composer.setSize(width, height)
    this.bloomPass.setSize(width, height)
    this.FXAAPass.material.uniforms[ 'resolution' ].value.x = 1 / (width)
    this.FXAAPass.material.uniforms[ 'resolution' ].value.y = 1 / (height)
    this.mousePosMaterial.uniforms.uAspect.value = CameraClass.getInstance().camera.aspect

    super.resize()
  }

  renderFrame (args) {
    this.frame++

    // this.FilmPass.uniforms[ 'time' ].value += args.dt * 0.1

    // standard scene
    RendererClass.getInstance().renderer.setRenderTarget(this.RTGlobe)
    // RendererClass.getInstance().renderer.autoClear = false
    RendererClass.getInstance().renderer.render(GlobeSceneClass.getInstance().scene, CameraClass.getInstance().camera)

    // particles scene
    ParticlesClass.getInstance().mesh.material.uniforms.uTexture.value = this.RTGlobe.texture

    // debug picker
    // RendererClass.getInstance().renderer.setRenderTarget(null)
    // RendererClass.getInstance().renderer.render(PickerSceneClass.getInstance().scene, CameraClass.getInstance().camera)

    this.composer.render()

    // mouse position
    if (this.config.detector.isMobile) {
      this.mousePosMaterial.uniforms.uMousePos.value = TouchClass.getInstance().normalizedTouchPos
      this.mousePosMaterial.uniforms.uPrevMousePos.value = TouchClass.getInstance().prevNormalizedTouchPos
    } else {
      this.mousePosMaterial.uniforms.uMousePos.value = MouseClass.getInstance().normalizedMousePos
      this.mousePosMaterial.uniforms.uPrevMousePos.value = MouseClass.getInstance().prevNormalizedMousePos
    }

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
