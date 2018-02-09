/* global requires, listOfComponents */

import /* codegen */ './codegen.js'

const tryRequire = ({category, component, section = 'src'}) => {
  const requireComponent = requires[`${category}/${component}`]
  return new Promise(resolve => {
    requireComponent[section](resolve)
  })
}

const SECTIONS_FOR_CODE = ['component', 'playground', 'context', 'routes', 'events', 'pkg']

const tryRequireCode = ({ category, component }) =>
  Promise.all(SECTIONS_FOR_CODE.map(section => tryRequire({ category, component, section })))

export { listOfComponents, tryRequireCode }
export default tryRequire
