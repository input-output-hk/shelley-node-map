
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
  PointLight,
  AmbientLight,
  VideoTexture,
  MeshBasicMaterial,
  DoubleSide
} from 'three'

/* ------------------------------------------
Classes
------------------------------------------ */
import BaseClass from './BaseClass'
import GlobeSceneClass from './GlobeSceneClass'
import IcosaSceneClass from './IcosaSceneClass'
import RendererClass from './RendererClass'
import CameraClass from './CameraClass'
import QuadCameraClass from './QuadCameraClass'
import ParticlesClass from './ParticlesClass'

/* ------------------------------------------
Shaders
------------------------------------------ */
import PassThroughVert from '../../shaders/passThrough.vert'
import EdgeDetectFrag from '../../shaders/edgeDetect.frag'
import BlurFrag from '../../shaders/blur.frag'

class FBOClass extends BaseClass {
  init ({
    width,
    height
  } = {}) {
    this.width = width
    this.height = height

    this.initRenderTargets()
    this.initMaterial()
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

  resize (width, height) {
    this.RTGlobe.setSize(width, height)
    this.RTParticles.setSize(width, height)
    super.resize()
  }

  renderFrame () {
    // standard scene
    RendererClass.getInstance().renderer.setRenderTarget(this.RTGlobe)
    RendererClass.getInstance().renderer.autoClear = false
    RendererClass.getInstance().renderer.render(GlobeSceneClass.getInstance().scene, CameraClass.getInstance().camera)

    // particles scene
    ParticlesClass.getInstance().mesh.material.uniforms.uTexture.value = this.RTGlobe.texture
    // RendererClass.getInstance().renderer.setRenderTarget(this.RTParticles)
    RendererClass.getInstance().renderer.setRenderTarget(null)
    RendererClass.getInstance().renderer.autoClear = false
    RendererClass.getInstance().renderer.render(IcosaSceneClass.getInstance().scene, CameraClass.getInstance().camera)

    RendererClass.getInstance().renderer.setRenderTarget(null)
    RendererClass.getInstance().renderer.autoClear = false
    RendererClass.getInstance().renderer.render(this.particleScene, this.particleCamera)

    // // icosa scene
    // if (this.config.postProcessing.effectDownscaleDivisor <= 1) {
    //   this.mesh.material.transparent = true
    //   this.mesh.material.blending = THREE.CustomBlending
    //   this.mesh.material.blendSrc = THREE.OneFactor
    //   this.mesh.material.blendDst = THREE.OneFactor
    //   this.mesh.material.blendEquation = THREE.AddEquation
    //   this.mesh.material.blendSrcAlpha = THREE.OneFactor
    //   this.mesh.material.blendDstAlpha = THREE.ZeroFactor
    //   this.mesh.material.blendEquationAlpha = THREE.AddEquation
    // }

    super.renderFrame()
  }
}

export default FBOClass
