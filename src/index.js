'use strict'

const mql = require('@microlink/mql')
const { promisify } = require('util')
const stream = require('stream')
const pipeline = promisify(stream.pipeline)

const REQUIRED_ENVS = ['HEADER_KEY', 'API_KEY']

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const missing = REQUIRED_ENVS.filter(key => process.env[key] == null)

if (missing.length > 0) {
  throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`)
}

const toSearchParams = req => new URL(req.url, process.env.APP_URL).searchParams

const proxy = (req, res) => {
  if (req.headers['header_key'] !== process.env.HEADER_KEY) {
    return null
  }

  const stream = mql.stream('https://pro.microlink.io', {
    searchParams: toSearchParams(req),
    headers: {
      'x-api-key': process.env.API_KEY,
      accept: req.headers.accept
    }
  })

  pipeline(stream, res)
}

module.exports = (req, res) => proxy(req, res)
