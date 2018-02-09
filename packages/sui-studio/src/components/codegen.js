const pwd = process.env.PWD
const path = require('path')
const walker = require('../../bin/walker')
const components = walker.componentsName(pwd)
const fs = require('fs')
const CONDITIONAL_REQUIRES = ['routes', 'events', 'context']

const studioFolder = path.relative(__dirname, pwd)

const generateConditionalRequires = (component) => {
  const allRequiresCode = CONDITIONAL_REQUIRES.map(fileToRequire => {
    let requireCode = `${fileToRequire}: function (resolve) {`
    const filePath = `${studioFolder}/demo/${component}/${fileToRequire}.js`
    const exists = fs.existsSync(filePath)
    if (exists) {
      requireCode += `
        require.ensure([], function (require) {
          resolve(require('${filePath}'))
        }, '${component}_${fileToRequire}')`
    } else {
      requireCode += 'resolve(false)'
    }
    return `${requireCode} }`
  })

  return allRequiresCode.length > 0
    ? `, ${allRequiresCode.join(',')}`
    : ''
}

const requires = components
  .map(component => `
  requires['${component}'] = {
    changelog: function (resolve) {
      require.ensure([], function (require) {
        resolve(require('!raw-loader!${studioFolder}/components/${component}/CHANGELOG.md'))
      }, '${component}_changelog')
    },
    readme: function (resolve) {
      require.ensure([], function (require) {
        resolve(require('!raw-loader!${studioFolder}/components/${component}/README.md'))
      }, '${component}_readme')
    },
    src: function (resolve) {
      require.ensure([], function (require) {
        resolve(require('!raw-loader!${studioFolder}/components/${component}/src/index.js'))
      }, '${component}_src')
    },
    component: function (resolve) {
      require.ensure([], function (require) {
        resolve(require('${studioFolder}/components/${component}/src/index.js'))
      }, '${component}_component')
    },
    pkg: function (resolve) {
      require.ensure([], function (require) {
        resolve(require('${studioFolder}/components/${component}/package.json'))
      }, '${component}_pkg')
    },
    playground: function (resolve) {
      require.ensure([], function (require) {
        resolve(require('!raw-loader!${studioFolder}/demo/${component}/playground'))
      }, '${component}_playground')
    }
    ${generateConditionalRequires(component)}
  }
`)
  .join('')

const listOfComponents = components.map(componentName => {
  const [category, component] = componentName.split('/')
  return `{ category: '${category}', component: '${component}' }`
})

module.exports = `
var listOfComponents = [${listOfComponents.join(',')}];
var requires = {};
${requires}
`
