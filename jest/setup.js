import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import 'jest-styled-components'

Enzyme.configure({ adapter: new Adapter() })

global.windowEventListeners = {}
global.triggerWindowEvent = (name, event) => global.windowEventListeners[name].forEach(listener => listener(event))

global.window = window
global.window.innerWidth = 1920
global.window.addEventListener = (name, listener) => {
  windowEventListeners[name] = windowEventListeners[name] || []
  if (windowEventListeners[name].includes(listener)) return
  windowEventListeners[name].push(listener)
}
global.window.removeEventListener = (name, listener) => {
  if (!windowEventListeners[name]) return
  windowEventListeners[name] = windowEventListeners[name].splice(windowEventListeners[name].indexOf(listener), 1)
  if (windowEventListeners[name].length < 1) delete windowEventListeners[name]
}
