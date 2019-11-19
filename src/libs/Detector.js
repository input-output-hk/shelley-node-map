const ua = (navigator.userAgent || navigator.vendor || window.opera).toLowerCase()

const Detector = {
  isRetina: window.devicePixelRatio && window.devicePixelRatio >= 1.5,
  isChrome: ua.indexOf('chrome') > -1,
  isFirefox: ua.indexOf('firefox') > -1,
  isSafari: ua.indexOf('safari') > -1,
  isEdge: ua.indexOf('edge') > -1,
  isIE: ua.indexOf('msie') > -1,
  isMobile: /(iPad|iPhone|Android)/i.test(ua),
  isIOS: /(iPad|iPhone)/i.test(ua)
}

export default Detector
