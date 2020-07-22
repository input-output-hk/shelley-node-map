import {
  Vector3,
  DataTexture,
  RGBAFormat,
  FloatType,
  NearestFilter
} from 'three'

export default class TextureHelper {
  constructor (args) {
    this.config = args.config
  }

  setPointCount (pointCount) {
    this.pointCount = pointCount
  }

  setTextureSize (pointCount) {
    this.setPointCount(pointCount)

    let width = 1
    let height = 1

    while (height * width < this.pointCount) {
      width *= 2
      if (height * width >= this.pointCount) {
        break
      }
      height *= 2
    }

    this.textureWidth = width
    this.textureHeight = height
  }

  getNodeTextureLocation (nodeID) {
    return {
      x: (nodeID % this.textureWidth) * (1 / this.textureWidth) + (1 / (this.textureWidth * 2)),
      y: Math.floor(nodeID / this.textureWidth) * (1 / this.textureHeight) + (1 / (this.textureHeight * 2))
    }
  }

  createPositionTexture ({
    defaultPositions = new Float32Array()
  } = {}) {
    let initialTextureArray = new Float32Array(this.textureWidth * this.textureHeight * 4)
    let textureArray = new Float32Array(this.textureWidth * this.textureHeight * 4)
    let lifeArray = []
    let step = 4

    for (let i = 0; i < this.pointCount; i++) {
      let location = new Vector3(
        ((i) % (this.config.particleScene.width / step)) * step,
        (Math.floor((i) / (this.config.particleScene.width / step))) * step,
        0
      )

      let lifeDuration = Math.ceil(Math.random() * this.config.scene.particleLifeMax)

      textureArray[i * 4 + 0] = location.x
      textureArray[i * 4 + 1] = location.y
      textureArray[i * 4 + 2] = location.z
      textureArray[i * 4 + 3] = lifeDuration

      initialTextureArray[i * 4 + 0] = Math.random() * this.config.particleScene.width
      initialTextureArray[i * 4 + 1] = Math.random() * this.config.particleScene.height
      initialTextureArray[i * 4 + 2] = Math.random() * this.config.particleScene.height
      initialTextureArray[i * 4 + 3] = 0
    }

    let positionTexture = new DataTexture(
      textureArray,
      this.textureWidth,
      this.textureHeight,
      RGBAFormat,
      FloatType
    )
    positionTexture.minFilter = NearestFilter
    positionTexture.magFilter = NearestFilter
    positionTexture.generateMipmaps = false
    positionTexture.needsUpdate = true

    let initialPositionTexture = new DataTexture(
      initialTextureArray,
      this.textureWidth,
      this.textureHeight,
      RGBAFormat,
      FloatType
    )
    initialPositionTexture.minFilter = NearestFilter
    initialPositionTexture.magFilter = NearestFilter
    initialPositionTexture.generateMipmaps = false
    initialPositionTexture.needsUpdate = true

    return {
      positionTexture: positionTexture,
      initialPositionTexture: initialPositionTexture,
      lifeArray: lifeArray
    }
  }
}
