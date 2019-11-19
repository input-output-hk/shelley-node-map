import Config from '../Config'

/**
 * Base Singleton Class
 */
class BaseClass {
  /**
   * Create new singleton class instance
   */
  constructor () {
    this.config = new Config().data

    if (!this.constructor.instance) {
      this.constructor.instance = this
    }

    return this.constructor.instance
  }

  /**
   * Return singleton instance
   */
  static getInstance () {
    return new this()
  }

  /**
   * Initialize class properties
   */
  init () {
    const instance = this.constructor.getInstance()
    Object.freeze(instance)
  }

  /**
   * Run on window resize
   *
   * @param {int} width
   * @param {int} height
   */
  resize (width, height) {}

  /**
   * Run on each renderered frame
   */
  renderFrame () {}

  /**
   * Tear down
   */
  destroy () {}

  /**
   * On mouse move
   */
  onMouseMove () {}
}

export default BaseClass
