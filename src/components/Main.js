/* ------------------------------------------
3rd Party
------------------------------------------ */
import React, { Component } from 'react'
import {
  Clock,
  Vector2,
  Color
} from 'three'

import EventEmitter from 'eventemitter3'
import mixin from 'mixin'
import TWEEN from 'tween.js'
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import { getUrlParameter } from '../helpers/utility'

/* ------------------------------------------
Config
------------------------------------------ */
import Config from './Config'

/* ------------------------------------------
Classes
------------------------------------------ */
import RendererClass from './classes/RendererClass'
import GlobeSceneClass from './classes/GlobeSceneClass'
import IcosaSceneClass from './classes/IcosaSceneClass'
import PickerSceneClass from './classes/PickerSceneClass'
import FBOClass from './classes/FBOClass'
import CameraClass from './classes/CameraClass'
import ControlsClass from './classes/ControlsClass'
import MouseClass from './classes/MouseClass'
import TouchClass from './classes/TouchClass'
import IcosahedronClass from './classes/IcosahedronClass'
import AmbientLightClass from './classes/AmbientLightClass'
import PointLightClass from './classes/PointLightClass'
import ParticlesClass from './classes/ParticlesClass'
import GlobeClass from './classes/GlobeClass'
import MarkersClass from './classes/MarkersClass'
import PickersClass from './classes/PickersClass'
import PathsClass from './classes/PathsClass'

/* ------------------------------------------
Styles
------------------------------------------ */
import styles from './Main.css'

class Main extends mixin(EventEmitter, Component) {
  constructor (props) {
    super(props)

    this.config = new Config().data
    this.clock = new Clock()
    this.modifiedQueue = []
    this.processingQueue = false
    this.data = []

    this.state = {
      tooltipPos: new Vector2(),
      tooltipCountry: null,
      tooltipCity: null,
      tooltipHide: true,
      loading: true
    }
  }

  componentDidMount () {
    this.initStage()
  }

  initFireBase () {
    return new Promise((resolve, reject) => {
      try {
        firebase.initializeApp(this.config.fireBase)
        firebase.firestore()
        this.firebaseDB = firebase.firestore()
      } catch (error) {
        console.log(error)
      }
      this.docRef = this.firebaseDB.collection(this.config.fireBase.collection)

      let coords = []

      let that = this

      firebase.auth().signInAnonymously()
        .then(() => {
          // setup live data listener
          this.docRef.onSnapshot(function (querySnapshot) {
            querySnapshot.docChanges().forEach(function (change) {
              if (change.type === 'added') {
                that.emit('added', change.doc.data())
              }
              if (change.type === 'modified') {
                that.emit('modified', change.doc.data())
              }
              if (change.type === 'removed') {
                that.emit('removed', change.doc.data())
              }
            })
          })

          this.docRef.orderBy('timestamp', 'desc').get().then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
              coords.push(doc.data())
            })
            resolve(coords)
          })
        })
        .catch(function (error) {
          console.log(error.code)
          console.log(error.message)
        })
    })
  }

  setConfigFromURLParams () {
    const blendColor = parseInt(getUrlParameter('blendColor'))
    if (!isNaN(blendColor)) {
      this.config.post.blendColor = new Color(blendColor)
    }

    const showAnnotations = parseInt(getUrlParameter('showAnnotations'))
    if (!isNaN(showAnnotations)) {
      this.config.scene.showAnnotations = !!showAnnotations
    }

    const transparentBackground = parseInt(getUrlParameter('transparentBackground'))
    if (!isNaN(transparentBackground)) {
      this.config.post.transparentBackground = !!transparentBackground
    }

    const lowBandwidth = parseInt(getUrlParameter('lowBandwidth'))
    if (!isNaN(lowBandwidth)) {
      this.config.scene.lowBandwidth = !!lowBandwidth
    }
  }

  initStage () {
    this.setConfigFromURLParams()

    GlobeSceneClass.getInstance().init()
    IcosaSceneClass.getInstance().init()
    PickerSceneClass.getInstance().init()
    CameraClass.getInstance().init()

    RendererClass.getInstance().init()

    const numPoints = this.config.particleScene.width * this.config.scene.height
    ParticlesClass.getInstance().init(numPoints)

    FBOClass.getInstance().init({
      width: this.config.particleScene.width,
      height: this.config.scene.height,
      transparentBackground: this.config.post.transparentBackground
    })
    ControlsClass.getInstance().init()
    MouseClass.getInstance().init()
    TouchClass.getInstance().init()
    IcosahedronClass.getInstance().init()
    GlobeClass.getInstance().init()
    AmbientLightClass.getInstance().init()
    PointLightClass.getInstance().init()

    this.initFireBase().then((data) => {
      this.data = data

      MarkersClass.getInstance().init(data)
      PickersClass.getInstance().init(data)
      PathsClass.getInstance().init(data)

      this.buildScene()
      this.addEvents()
      this.animate()

      this.setState({
        loading: false
      })

      this.highlightLatestNode()
    })
  }

  highlightLatestNode () {
    this.emit('modified', this.data[0])
  }

  buildScene () {
    IcosaSceneClass.getInstance().scene.add(IcosahedronClass.getInstance().mesh)
    IcosaSceneClass.getInstance().scene.add(IcosahedronClass.getInstance().mesh2)
    IcosaSceneClass.getInstance().scene.add(AmbientLightClass.getInstance().light)
    IcosaSceneClass.getInstance().scene.add(PointLightClass.getInstance().light)
    IcosaSceneClass.getInstance().scene.add(MarkersClass.getInstance().mesh)
    IcosaSceneClass.getInstance().scene.add(PathsClass.getInstance().mesh)

    PickerSceneClass.getInstance().scene.add(PickersClass.getInstance().mesh)

    GlobeSceneClass.getInstance().scene.add(GlobeClass.getInstance().mesh)
  }

  animate () {
    window.requestAnimationFrame(this.animate.bind(this))
    this.renderFrame()
  }

  renderFrame () {
    const dt = this.clock.getDelta()

    TWEEN.update()

    this.setState({
      tooltipPos: MarkersClass.getInstance().selectedNodePosScreen
    })

    MouseClass.getInstance().renderFrame({ dt: dt })
    TouchClass.getInstance().renderFrame({ dt: dt })
    ControlsClass.getInstance().renderFrame({ dt: dt })
    MarkersClass.getInstance().renderFrame({ dt: dt })
    PickersClass.getInstance().renderFrame({ dt: dt })
    PathsClass.getInstance().renderFrame({ dt: dt })
    ParticlesClass.getInstance().renderFrame({ dt: dt })
    FBOClass.getInstance().renderFrame({ dt: dt })
  }

  addNewNode (data) {
    this.data.push(data)
    this.addToModifiedQueue(data)
    MarkersClass.getInstance().addNode(data)
    PickersClass.getInstance().addNode(data)
    PathsClass.getInstance().addNode(data)
  }

  addEvents () {
    window.addEventListener('resize', this.resize.bind(this), false)
    this.resize()

    RendererClass.getInstance().renderer.domElement.addEventListener('mousemove', (e) => {
      MouseClass.getInstance().onMouseMove(e)
    }, false)

    RendererClass.getInstance().renderer.domElement.addEventListener('touchmove', (e) => {
      TouchClass.getInstance().onTouchMove(e)
    }, false)

    RendererClass.getInstance().renderer.domElement.addEventListener('wheel', () => {
      MarkersClass.getInstance().stopUpdateCamPos()
    })

    RendererClass.getInstance().renderer.domElement.addEventListener('mousedown', () => {
      MarkersClass.getInstance().stopUpdateCamPos()

      // const data = {
      //   city: 'Ashburn',
      //   country: 'United States',
      //   ip: '54.242.227.95',
      //   lat: 0.0,
      //   long: 0.0,
      //   region: 'Virginia',
      //   timestamp: { seconds: 1575282866, nanoseconds: 504000000 }
      // }

      // this.addNewNode(data)
    })

    PickersClass.getInstance().on('nodeMouseOver', (data) => {
      clearTimeout(this.hoverTimeout)
      this.showGeoData(data)
    })

    PickersClass.getInstance().on('nodeMouseOut', () => {
      this.setState({
        tooltipHide: true
      })
    })

    // on node data changes
    this.on('modified', (data) => {
      this.addToModifiedQueue(data)
      this.processModifiedQueue()
    })

    this.on('added', (data) => {
      this.addNewNode(data)

      this.processModifiedQueue()

      // console.log('Added: ', data)
    })

    this.on('removed', (data) => {
      // console.log('Removed: ', data)
    })
  }

  addToModifiedQueue (data) {
    this.modifiedQueue.push(data)
  }

  showGeoData (data) {
    if (data.city === null && data.country === null) {
      data.country = 'Unknown'
    }

    this.hoverTimeout = setTimeout(() => {
      this.setState({
        tooltipHide: true
      })
    }, 4000)

    this.setState({
      tooltipCountry: data.country,
      tooltipCity: data.city,
      tooltipHide: false,
      tooltipLastBlockTime: new Intl.DateTimeFormat('default', {
        year: '2-digit',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
      }).format(data.timestamp.toDate())
    })
  }

  processModifiedQueue () {
    if (PickersClass.getInstance().isHovering) {
      return
    }

    if (this.modifiedQueue.length === 0) {
      return
    }

    if (this.processingQueue) {
      return
    }

    this.processingQueue = true

    const data = this.modifiedQueue.shift()

    if (!PickersClass.getInstance().isHovering) {
      this.showGeoData(data)
    }

    MarkersClass.getInstance().highlight(data)
      .then(() => {
        // console.log('Updated: ', data)
        this.processingQueue = false
        this.processModifiedQueue()
      })
  }

  resize () {
    this.width = window.innerWidth
    this.height = window.innerHeight

    CameraClass.getInstance().resize(this.width, this.height)
    RendererClass.getInstance().resize(this.width, this.height)
    FBOClass.getInstance().resize(this.width, this.height)
    ParticlesClass.getInstance().resize(this.width, this.height)
    MarkersClass.getInstance().resize(this.width, this.height)
    PickersClass.getInstance().resize(this.width, this.height)

    if (this.config.post.enabled) {
      this.composer.setSize(this.width, this.height)
    }
  }

  destroy () {
    RendererClass.getInstance().dispose()
    GlobeSceneClass.getInstance().destroy()
    ControlsClass.getInstance().destroy()
    FBOClass.getInstance().destroy()

    if (this.composer) {
      delete this.composer
    }

    window.cancelAnimationFrame(this.animate)
    this.running = false
  }

  render () {
    var tooltipStyle = {
      left: this.state.tooltipPos.x,
      top: this.state.tooltipPos.y
    }

    let className = styles.tooltip

    if (this.state.tooltipHide) {
      className = styles.tooltipHide
    }

    if (this.config.scene.showAnnotations === false) {
      className = styles.tooltipHide
    }

    return (
      <div className={styles.container}>
        <canvas width={this.width} height={this.height} id={this.config.scene.canvasID} />
        <div className={className} style={tooltipStyle}>
          <p>{this.state.tooltipCity}</p>
          <p>{this.state.tooltipCountry}</p>
          <p>Last Block Time: {this.state.tooltipLastBlockTime}</p>
        </div>
      </div>
    )
  }
}

export default Main
