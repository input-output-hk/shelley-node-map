import {
  HalfFloatType,
  FloatType,
  Color
} from 'three'

import Detector from '../libs/Detector'

class Config {
  constructor () {
    if (!Config.instance) {
      this.init()
      Config.instance = this
    }

    return Config.instance
  }

  init () {
    this.data = {
      curveMinAltitude: 0,
      curveMaxAltitude: 1.8,
      curveSegments: 32,
      particleScene: {
        width: 2100,
        height: 2100,
        downScaleFactor: Detector.isMobile ? 0.4 : 0.5
      },
      scene: {
        lowBandwidth: false,
        fullScreen: true,
        width: window.innerWidth,
        height: window.innerHeight,
        bgColor: new Color(0x000000),
        canvasID: 'stage', // ID of webgl canvas element
        ambientLightColor: 0xffffff,
        ambientLightIntensity: 1.0,
        sphereRadius: 2,
        globeRadius: 2.1,
        particleLifeMax: 1000,
        showAnnotations: true
      },
      post: {
        enabled: false,
        vignette: true,
        blendLighten: true,
        tranparentBackground: false,
        blendColor: new Color(0x000000) // 121326
      },
      camera: {
        fov: 60,
        initPos: { x: 0, y: 0, z: 7 },
        near: 0.1,
        far: 20,
        enableZoom: true // enable camera zoom on mousewheel/pinch gesture
      },
      dev: {
        debugPicker: false
      },
      fireBase: {
        collection: 'shelley-node-log',
        apiKey: 'AIzaSyCwfdzrjQ5GRqyz-napBM29T7Zel_6KIUY',
        authDomain: 'webgl-gource-1da99.firebaseapp.com',
        databaseURL: 'https://webgl-gource-1da99.firebaseio.com',
        projectId: 'webgl-gource-1da99',
        storageBucket: 'webgl-gource-1da99.appspot.com',
        messagingSenderId: '532264380396'
      },
      detector: Detector,
      floatType: Detector.isIOS ? HalfFloatType : FloatType
    }

    this.data.particleScene.width *= this.data.particleScene.downScaleFactor
    this.data.particleScene.height *= this.data.particleScene.downScaleFactor
  }

  get (id) {
    return this.data[id]
  }
}

const instance = new Config()
Object.freeze(instance)

export default Config
