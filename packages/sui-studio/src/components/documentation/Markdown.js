import PropTypes from 'prop-types'
import React, { Component } from 'react'

export default class Markdown extends Component {
  propTypes = {
    content: PropTypes.string
  }

  state = { markdownHTML: false }

  componentDidMount () {
    require.ensure([], require => {
      const snarkdown = require('snarkdown').default
      this.setState({ markdownHTML: snarkdown(this.props.content) })
    }, 'Snarkdown')
  }

  render () {
    const {markdownHTML} = this.state

    return (markdownHTML &&
      <div
        className='markdown-body'
        dangerouslySetInnerHTML={{ __html: markdownHTML }} />
    )
  }
}

Markdown.displayName = 'Markdown'
