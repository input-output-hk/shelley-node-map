import {
  HalfFloatType,
  FloatType
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
      renderer: {
        antialias: true
      },
      scene: {
        fullScreen: true,
        width: 500,
        height: 500,
        bgColor: 0x000000,
        canvasID: 'stage', // ID of webgl canvas element
        ambientLightColor: 0xffffff,
        ambientLightIntensity: 1.0,
        sphereRadius: 2,
        maxWidth: 500,
        maxHeight: 500
      },
      post: {
        enabled: false,
        vignette: true,
        bloom: true
      },
      camera: {
        fov: 60,
        initPos: { x: 0, y: 0, z: 10 },
        near: 0.1,
        far: 20,
        enableZoom: true // enable camera zoom on mousewheel/pinch gesture
      },
      dev: {
        debugPicker: false
      },
      detector: Detector,
      floatType: Detector.isIOS ? HalfFloatType : FloatType
    }
  }

  get (id) {
    return this.data[id]
  }
}

const instance = new Config()
Object.freeze(instance)

export default Config
