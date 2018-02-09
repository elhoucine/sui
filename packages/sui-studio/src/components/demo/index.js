/* eslint react/no-multi-comp:0, no-console:0 */

import PropTypes from 'prop-types'
import React, { Component } from 'react'

import {
  iconClose,
  iconCode,
  iconFullScreen,
  iconFullScreenExit
} from '../icons'
import Preview from '../preview'
import Style from '../style'

import { tryRequireCode } from '../try-require'
import stylesFor, { themesFor } from './fetch-styles'
import CodeEditor from './CodeEditor'
import ContextButtons from './ContextButtons'
import EventsButtons from './EventsButtons'
import ThemesButtons from './ThemesButtons'
import withContext from './HoC/withContext'
import withProvider from './HoC/withProvider'
import deepmerge from 'deepmerge'

import { createStore } from '@s-ui/react-domain-connector'

const DEFAULT_CONTEXT = 'default'
const EVIL_HACK_TO_RERENDER_AFTER_CHANGE = ' '
const DDD_REACT_REDUX = '@schibstedspain/ddd-react-redux'
const REACT_DOMAIN_CONNECTOR = '@s-ui/react-domain-connector'
const CONTAINER_CLASS = 'sui-Studio'
const FULLSCREEN_CLASS = 'sui-Studio--fullscreen'

const createSelectedContext = ({ contextTypesUsedByComponent, ctxtSelected, listOfContexts }) => {
  // check if the user has created a context.js with the needed contextTypes
  if (typeof listOfContexts !== 'object' || listOfContexts === null) {
    console.warn(
      "[Studio] You're trying to use a contextType in your component but it seems that you haven't created a context.js in the playground folder. This will likely make your component won't work as expected or it might have an useless context."
    )
  }

  const selectedContext = deepmerge(listOfContexts[DEFAULT_CONTEXT], listOfContexts[ctxtSelected])
  const listOfNeededContextTypes = Object.keys(contextTypesUsedByComponent)
  // filter only the contextTypes used by the user
  return Object.keys(selectedContext).reduce((filteredSelectedContext, contextType) => {
    if (listOfNeededContextTypes.includes(contextType)) {
      filteredSelectedContext[contextType] = selectedContext[contextType]
    } else {
      console.warn(
        `[Studio] ${contextType} is in your context.js but it's not used by your component.`
      )
    }
    return filteredSelectedContext
  }, {})
}

const isFunction = fnc => !!(fnc && fnc.constructor && fnc.call && fnc.apply)
const cleanDisplayName = displayName => {
  const [fallback, name] = displayName.split(/\w+\((\w+)\)/)
  return name !== undefined ? name : fallback
}
const pipe = (...funcs) => arg =>
  funcs.reduce((value, func) => func(value), arg)

const removeDefaultContext = exports =>
  Object.keys(exports)
    .filter(key => key !== DEFAULT_CONTEXT)
    .reduce((acc, key) => {
      acc[key] = exports[key]
      return acc
    }, {})

export default class Demo extends Component {
  static bootstrapWith (demo, { category, component, style, themes }) {
    tryRequireCode({ category, component }).then(
      ([component, playground, context, routes, events, pkg]) => {
        const newState = {
          component,
          events,
          pkg,
          playground,
          routes,
          style,
          themes
        }

        isFunction(context)
          ? context().then(listOfContexts => { demo.setState({ ...newState, listOfContexts }) })
          : demo.setState({ ...newState, listOfContexts: context })
      }
    )
  }

  static propTypes = {
    category: PropTypes.string,
    component: PropTypes.string,
    params: PropTypes.shape({
      category: PropTypes.string,
      component: PropTypes.string
    })
  }

  state = {
    component: false,
    listOfContexts: false,
    ctxtSelectedIndex: 0,
    ctxtSelected: 'default',
    isCodeOpen: false,
    isFullScreen: false,
    pkg: false,
    playground: undefined,
    routes: false,
    theme: 'default',
    themes: [],
    themeSelectedIndex: 0
  }

  _loadStyles ({ category, component }) {
    stylesFor({ category, component }).then(style => {
      const themes = themesFor({ category, component })
      Demo.bootstrapWith(this, { category, component, style, themes })
    })
  }

  componentDidMount () {
    this._loadStyles(this.props.params)
  }

  componentWillReceiveProps (nextProps) {
    this._loadStyles(nextProps.params)
  }

  componentWillUnmount () {
    this.containerClassList && this.containerClassList.remove(FULLSCREEN_CLASS)
  }

  hasProvider ({ pkg }) {
    return pkg &&
      pkg.dependencies &&
      (pkg.dependencies[DDD_REACT_REDUX] ||
        pkg.dependencies[REACT_DOMAIN_CONNECTOR])
  }

  render () {
    const {
      component,
      listOfContexts,
      ctxtSelectedIndex,
      ctxtSelected,
      events,
      isCodeOpen,
      isFullScreen,
      pkg,
      playground,
      style,
      themes,
      themeSelectedIndex
    } = this.state

    const Base = component.default
    if (!Base) {
      return <h1>Loading...</h1>
    }

    const nonDefaultExports = removeDefaultContext(component)

    const contextTypesUsedByComponent = Base.contextTypes
    const context = createSelectedContext({ contextTypesUsedByComponent, ctxtSelected, listOfContexts })

    const { domain } = context || {}
    const hasProvider = this.hasProvider({ pkg })
    const store = domain && hasProvider && createStore(domain)

    const EnhancedComponent = pipe(
      withContext(!!contextTypesUsedByComponent, context),
      withProvider(hasProvider, store)
    )(Base)

    !EnhancedComponent.displayName &&
      console.error(new Error('Component.displayName must be defined.'))

    return (
      <div className='sui-StudioDemo'>
        <Style>{style}</Style>
        <div className='sui-StudioNavBar-secondary'>
          <ContextButtons
            ctxt={listOfContexts || {}}
            selected={ctxtSelectedIndex}
            onContextChange={this.handleContextChange}
          />
          <ThemesButtons
            themes={themes}
            selected={themeSelectedIndex}
            onThemeChange={this.handleThemeChange}
          />
          <EventsButtons events={events || {}} store={store} domain={domain} />
        </div>

        <button className='sui-StudioDemo-codeButton' onClick={this.handleCode}>
          {isCodeOpen ? iconClose : iconCode}
        </button>

        <button
          className='sui-StudioDemo-fullScreenButton'
          onClick={this.handleFullScreen}
        >
          {isFullScreen ? iconFullScreenExit : iconFullScreen}
        </button>

        {isCodeOpen && (
          <CodeEditor
            isOpen={isCodeOpen}
            onChange={playground => {
              this.setState({ playground })
            }}
            playground={playground}
          />
        )}

        <Preview
          code={playground}
          scope={{
            React,
            [`${cleanDisplayName(EnhancedComponent.displayName)}`]: EnhancedComponent,
            domain,
            ...nonDefaultExports
          }}
        />
      </div>
    )
  }

  handleCode = () => {
    this.setState({ isCodeOpen: !this.state.isCodeOpen })
  }

  handleFullScreen = () => {
    this.setState({ isFullScreen: !this.state.isFullScreen }, () => {
      const { isFullScreen } = this.state
      this.containerClassList = this.containerClassList || document.getElementsByClassName(CONTAINER_CLASS)[0].classList

      isFullScreen
        ? this.containerClassList.add(FULLSCREEN_CLASS)
        : this.containerClassList.remove(FULLSCREEN_CLASS)
    })
  }

  handleContextChange = (ctxtSelected, index) => {
    this.setState({
      ctxtSelected,
      ctxtSelectedIndex: index,
      playground: this.state.playground + EVIL_HACK_TO_RERENDER_AFTER_CHANGE
    })
  }

  handleThemeChange = (theme, index) => {
    const { category, component } = this.props.params
    stylesFor({ category, component, withTheme: theme }).then(style => {
      this.setState({ style, theme, themeSelectedIndex: index })
    })
  }

  handleRoutering () {
    this.setState({
      playground: this.state.playground + EVIL_HACK_TO_RERENDER_AFTER_CHANGE
    })
  }
}
