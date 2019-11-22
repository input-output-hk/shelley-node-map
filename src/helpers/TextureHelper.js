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

  setNodeCount (nodeCount) {
    this.nodeCount = nodeCount
  }

  setTextureSize (nodeCount) {
    this.setNodeCount(nodeCount)

    let width = 1
    let height = 1

    while (height * width < this.nodeCount) {
      width *= 2
      if (height * width >= this.nodeCount) {
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
    let textureArray = new Float32Array(this.textureWidth * this.textureHeight * 4)
    let lifeArray = []
    let step = 6

    for (let i = 0; i < this.nodeCount; i++) {
      let location = new Vector3(
        ((i * step) % this.config.scene.width),
        (Math.floor((i * step) / this.config.scene.width)),
        0
      )

      let lifeDuration = Math.ceil(Math.random() * this.config.scene.particleLifeMax)

      textureArray[i * 4 + 0] = location.x
      textureArray[i * 4 + 1] = location.y
      textureArray[i * 4 + 2] = location.z
      textureArray[i * 4 + 3] = lifeDuration
    }

    // if (defaultPositions.length) {
    //   for (let index = 0; index < defaultPositions.length; index += 3) {
    //     textureArray[index + 0] = defaultPositions[index + 0]
    //     textureArray[index + 1] = defaultPositions[index + 1]
    //     textureArray[index + 2] = defaultPositions[index + 2]
    //   }
    // }

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

    return {
      positionTexture: positionTexture,
      lifeArray: lifeArray
    }
  }
}
