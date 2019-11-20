import { Vector3 } from 'three'

export function lerp (v0, v1, t) {
  return v0 * (1 - t) + v1 * t
}

export function latLongToCartesian (lat, long, radius) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (long + 180) * (Math.PI / 180)
  const x = radius * Math.sin(phi) * Math.cos(theta) * -1
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)
  return new Vector3(x, y, z)
}

export function clamp (num, min, max) {
  return num <= min ? min : (num >= max ? max : num)
}
