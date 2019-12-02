import {
  Mesh,
  BufferGeometry,
  Color,
  MeshBasicMaterial,
  CubicBezierCurve3,
  BufferAttribute,
  AdditiveBlending,
  Line
} from 'three'

import { geoInterpolate } from 'd3-geo'

import BaseClass from './BaseClass'

import { latLongToCartesian, clamp } from '../../helpers/math'

// test data
// import { coords } from '../../data/test'

class PathsClass extends BaseClass {
  getSplineFromCoords (coords) {
    const startLat = coords[0]
    const startLng = coords[1]
    const endLat = coords[2]
    const endLng = coords[3]

    // start and end points
    const start = latLongToCartesian(startLat, startLng, this.config.scene.globeRadius)
    const end = latLongToCartesian(endLat, endLng, this.config.scene.globeRadius)

    // altitude
    const altitude = clamp(start.distanceTo(end) * 0.75, this.config.curveMinAltitude, this.config.curveMaxAltitude)

    // 2 control points
    const interpolate = geoInterpolate([startLng, startLat], [endLng, endLat])
    const midCoord1 = interpolate(0.25 + (Math.random() * 0.1))
    const midCoord2 = interpolate(0.75 + (Math.random() * 0.1))
    const mid1 = latLongToCartesian(midCoord1[1], midCoord1[0], this.config.scene.globeRadius + altitude)
    const mid2 = latLongToCartesian(midCoord2[1], midCoord2[0], this.config.scene.globeRadius + altitude)

    return {
      start,
      end,
      spline: new CubicBezierCurve3(start, mid1, mid2, end)
    }
  }

  init (data) {
    this.coords = data
    this.material = new MeshBasicMaterial({
      blending: AdditiveBlending,
      opacity: 0.4,
      transparent: true,
      depthWrite: false,
      color: new Color(0x003a62)
    })

    this.mesh = new Mesh()

    this.lineCount = 700

    this.counters = []

    for (let index = 0; index < this.lineCount; index++) {
      const randIndex1 = Math.floor(Math.random() * this.coords.length)
      const randIndex2 = Math.floor(Math.random() * this.coords.length)
      this.addLine(randIndex1, randIndex2)
    }

    super.init()
  }

  addLine (index1, index2) {
    this.counters.push(Math.floor(Math.random() * this.config.curveSegments))

    const start = this.coords[index1]
    const end = this.coords[index2]

    if (typeof start === 'undefined' || typeof end === 'undefined') {
      return
    }

    const { spline } = this.getSplineFromCoords([
      start.lat,
      start.long,
      end.lat,
      end.long
    ])

    // add curve geometry
    const curveGeometry = new BufferGeometry()
    const points = new Float32Array(this.config.curveSegments * 3)
    const vertices = spline.getPoints(this.config.curveSegments - 1)

    for (let i = 0, j = 0; i < vertices.length; i++) {
      const vertex = vertices[i]
      points[j++] = vertex.x
      points[j++] = vertex.y
      points[j++] = vertex.z
    }

    curveGeometry.addAttribute('position', new BufferAttribute(points, 3))
    curveGeometry.setDrawRange(0, 0)

    let mesh = new Line(curveGeometry, this.material)

    this.mesh.add(mesh)
  }

  addNode (data) {
    this.coords.push(data)
    for (let index = 0; index < 10; index++) {
      this.addLine(this.coords.length - 1, Math.floor(Math.random() * this.coords.length))
    }
  }

  renderFrame (args) {
    this.mesh.children.forEach((line, index) => {
      this.counters[index] += (args.dt * 30.0)

      if (this.counters[index] > this.config.curveSegments) {
        this.counters[index] = Math.floor(Math.random() * this.config.curveSegments)
      }

      line.geometry.setDrawRange(0, this.counters[index])
    })

    super.renderFrame()
  }
}

export default PathsClass
