import {Mocker, Mock} from './mockerInterface'
import sinon from 'sinon'

const rawResponseResolver = (response, statusCode, headers = {'Content-Type': 'application/json'}) =>
  [statusCode, headers, JSON.stringify(response)]

class ClientMocker extends Mocker {
  _server = null

  _failIfServerWasNotCreated = () => {
    if (!this._server) {
      throw new Error('You should call create() first')
    }
  }

  create () {
    this._server = sinon.fakeServer.create()
    this._server.respondImmediately = true
  }

  restore () {
    this._failIfServerWasNotCreated()
    this._server.restore()
  }

  httpMock (baseUrl) {
    this._failIfServerWasNotCreated()
    return new ClientMock(this._server, baseUrl)
  }
}

class ClientMock extends Mock {
  constructor (server, baseUrl) {
    super()
    this._server = server
    this._isRegexp = false
    this._baseUrl = baseUrl
    this._method = null
    this._query = ''
    this._path = null
    this._responseResolver = identity => identity
  }

  get (path) {
    this._method = 'GET'
    this._path = path
    this._responseResolver = response => JSON.stringify(response)

    return this
  }

  getRegexp (path) {
    this.get(path)
    this._isRegexp = true

    return this
  }

  post (path) {
    this._method = 'POST'
    this._path = path
    this._responseResolver = rawResponseResolver

    return this
  }

  put (path) {
    this._method = 'PUT'
    this._path = path
    this._responseResolver = rawResponseResolver

    return this
  }

  delete (path) {
    this._method = 'DELETE'
    this._path = path
    this._responseResolver = rawResponseResolver

    return this
  }

  query (queryObject) {
    this._query = '?' + Object.keys(queryObject).reduce((acc, param) => {
      const value = queryObject[param]
      acc.push(`${param}=${value}`)

      return acc
    }, []).join('&')

    return this
  }

  reply (response, statusCode = 200, headers) {
    this._server.respondWith(
      this._method,
      this._isRegexp
        ? RegExp(`${this._baseUrl}${this._path}${this._query}`)
        : `${this._baseUrl}${this._path}${this._query}`
      ,
      this._responseResolver(response, statusCode, headers)
    )
  }
}

export default ClientMocker