/* eslint no-console: 0 */
import PropTypes from 'prop-types'
import React, { Component } from 'react'

const ERROR_TIMEOUT = 500

export default class Preview extends Component {
  static propTypes = {
    className: PropTypes.string,
    code: PropTypes.string,
    scope: PropTypes.object
  }

  static defaultProps = {
    className: '',
    scope: { React }
  }

  state = {
    error: undefined
  }

  componentDidMount () {
    this.executeCode()
  }

  componentDidUpdate (prevProps) {
    clearTimeout(this.timeoutID)
    if (this.props.code !== prevProps.code) {
      this.executeCode()
    }
  }

  setTimeout () {
    clearTimeout(this.timeoutID)
    this.timeoutID = setTimeout(...arguments)
  }

  compileCode () {
    const code = `
      (function (${Object.keys(this.props.scope).join(', ')}) {
        ${this.props.code}
      });`

    return window.Babel.transform(code, {
      comments: false,
      highlightCode: false,
      presets: ['es2015', 'stage-3', 'react']
    }).code
  }

  buildScope () {
    return Object.keys(this.props.scope)
      .map(key => this.props.scope[key])
  }

  executeCode () {
    if (this.props.code === undefined) {
      return
    }

    const scope = this.buildScope()

    try {
      // evaluate the compiled code and execute it passing the needed Scope of the component
      const Component = eval(this.compileCode())(...scope)  // eslint-disable-line no-eval
      this.setState({ error: undefined, Component })
    } catch (err) {
      console.error(err)
      this.setTimeout(() => {
        this.setState({ Component: undefined, error: err.toString() })
      }, ERROR_TIMEOUT)
    }
  }

  _renderError ({ error }) {
    return (
      <pre className='sui-StudioPreview-error'>
        <h3>Your playground has an error, please check:</h3>
        {error}
      </pre>
    )
  }

  render () {
    const { Component, error } = this.state

    return (
      <div className='sui-StudioPreview'>
        {error !== undefined && this._renderError({ error })}
        <div className='sui-StudioPreview-content sui-StudioDemo-preview'>
          {Component !== undefined && Component}
        </div>
      </div>
    )
  }
}
