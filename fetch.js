// fetch usage: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

// fetch可以接收一个参数或两个参数 fetch(url/Request,[options]), 此处只考虑fetch(url,options) 的情况

// https://github.com/sindresorhus/is-plain-obj
function isPlainObject(value) {
  if (Object.prototype.toString.call(value) !== '[object Object]') {
    return false
  }
  const prototype = Object.getPrototypeOf(value)
  return prototype === null || prototype === Object.prototype
}

const { fetch } = window
function fetchApi(url, options) {
  return fetch(url, options)
}

// redux中间件模式
const applyMiddleware = (func, middlewares) =>
  middlewares.reduce((prev, cur) => cur(prev), func)

/**
 * 1. 添加'Content-Type': 'application/json'
 * 2. 将body stringify
 * @param {*} next
 * @returns
 */
const reqToJson = next => (url, options) => {
  let { body, headers } = options
  if (isPlainObject(body)) {
    body = JSON.stringify(body)
  } else {
    throw new Error('options.body is not plainObject')
  }

  if (!headers) {
    headers = {}
  }
  if (!headers['Content-Type']) {
    headers = {
      ...headers,
      'Content-Type': 'application/json',
    }
  } else {
    throw new Error(
      'headers with Content-Type is already set, and it\'s not "application/json"'
    )
  }

  return next(url, { ...options, headers, body })
}

/**
 * 为url添加前缀
 * @param {*} baseUrl
 * @returns
 */
const addPrefix = baseUrl => next => (url, options) => {
  if (typeof baseUrl !== 'string') {
    throw new Error('baseUrl should be string')
  }
  return next(`${baseUrl}${url}`, options)
}

const myFetch = applyMiddleware(fetchApi, [
  reqToJson,
  addPrefix('http://localhost:3001'),
])

export default myFetch
