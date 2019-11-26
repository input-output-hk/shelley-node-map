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
import { coords } from '../../data/test'

const CURVE_MIN_ALTITUDE = 0
const CURVE_MAX_ALTITUDE = 1.8
const CURVE_SEGMENTS = 32

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
    const altitude = clamp(start.distanceTo(end) * 0.75, CURVE_MIN_ALTITUDE, CURVE_MAX_ALTITUDE)

    // 2 control points
    const interpolate = geoInterpolate([startLng, startLat], [endLng, endLat])
    const midCoord1 = interpolate(0.25)
    const midCoord2 = interpolate(0.75)
    const mid1 = latLongToCartesian(midCoord1[1], midCoord1[0], this.config.scene.globeRadius + altitude)
    const mid2 = latLongToCartesian(midCoord2[1], midCoord2[0], this.config.scene.globeRadius + altitude)

    return {
      start,
      end,
      spline: new CubicBezierCurve3(start, mid1, mid2, end)
    }
  }

  init () {
    this.material = new MeshBasicMaterial({
      blending: AdditiveBlending,
      opacity: 0.4,
      transparent: true,
      depthWrite: false,
      color: new Color(0x003a62)
    })

    this.mesh = new Mesh()

    const lineCount = 700

    this.counters = []

    for (let index = 0; index < lineCount; index++) {
      const randIndex1 = Math.floor(Math.random() * coords.length)
      const randIndex2 = Math.floor(Math.random() * coords.length)

      this.counters.push(Math.floor(Math.random() * CURVE_SEGMENTS))

      const start = coords[randIndex1]
      const end = coords[randIndex2]

      if (typeof start === 'undefined' || typeof end === 'undefined') {
        continue
      }

      const { spline } = this.getSplineFromCoords([
        start.lat,
        start.long,
        end.lat,
        end.long
      ])

      // add curve geometry
      const curveGeometry = new BufferGeometry()
      const points = new Float32Array(CURVE_SEGMENTS * 3)
      const vertices = spline.getPoints(CURVE_SEGMENTS - 1)

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

    super.init()
  }

  renderFrame (args) {
    this.mesh.children.forEach((line, index) => {
      this.counters[index] += (args.dt * 30.0)

      if (this.counters[index] > CURVE_SEGMENTS) {
        this.counters[index] = Math.floor(Math.random() * CURVE_SEGMENTS)
      }

      line.geometry.setDrawRange(0, this.counters[index])
    })

    super.renderFrame()
  }
}

export default PathsClass
