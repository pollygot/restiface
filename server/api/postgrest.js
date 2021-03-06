require('dotenv').config()
const axios = require('axios')
const Pollygot = require('../common/pollygot')
const Helpers = require('../common/helpers')
const { Router } = require('express')
const router = Router()

const PATCH_HEADERS = {
  headers: {
    Accept: 'application/vnd.pgrst.object+json',
    Prefer: 'return=representation',
  },
}
const POST_HEADERS = {
  headers: {
    Accept: 'application/vnd.pgrst.object+json',
    Prefer: 'return=representation',
  },
}

/**
 * Get records
 * https://postgrest.org/en/v5.0/api.html#horizontal-filtering-rows
 */
router.get('/:appId/:resourceKey?', async (req, res, next) => {
  let { appId, resourceKey } = req.params
  let app = await Pollygot.getAppConfig(appId)
  let fullUrl = `${app.config.url}`
  if (resourceKey) fullUrl += `/${resourceKey}`
  if (req.query && req.query.q)
    fullUrl += `?${Helpers.decrypt(req.query.q.toString())}`
  console.log('PostgREST GET: fullUrl', fullUrl)
  let headers = _attachHeaders(req.headers)
  axios
    .get(fullUrl, { headers: headers })
    .then(response => {
      return res.json({ data: response.data, headers: response.headers })
    })
    .catch(e => {
      return res.status(e.response.status).json(e.response.data)
    })
})

/**
 * Update the database. This uses PATCH so only the data that is passed will be updated
 * https://postgrest.org/en/v5.0/api.html#insertions-updates
 */
router.patch('/:appId/:resourceKey', async (req, res, next) => {
  if (!req.query)
    return res.status(422).json({ data: 'Must provide a selector' })
  if (!req.body) return res.status(422).json({ data: 'Must provide a payload' })

  const { appId, resourceKey } = req.params
  const payload = req.body
  let app = await Pollygot.getAppConfig(appId)
  let identifier = Helpers.decrypt(req.query.q.toString())
  let fullUrl = `${app.config.url}/${resourceKey}` + `?${identifier}`
  console.log('PostgREST PATCH: fullUrl', fullUrl)
  axios
    .patch(fullUrl, payload, PATCH_HEADERS)
    .then(response => {
      let user = req.user && req.user.username ? req.user.username : ''
      saveRecordHistory(appId, resourceKey, identifier, 'UPDATE', payload, user)
      return res.json({ data: response.data, headers: response.headers })
    })
    .catch(e => {
      return res.status(e.response.status).json(e.response.data)
    })
})

/**
 * Create or update.
 * https://postgrest.org/en/v5.0/api.html#insertions-updates
 */
router.post('/:appId/:resourceKey', async (req, res, next) => {
  if (!req.body) return res.status(422).json({ data: 'Must provide a payload' })
  if (req.query && req.query.q)
    return res.status(422).json({ data: 'Use PATCH to make updates!' })

  const { appId, resourceKey } = req.params
  const payload = req.body
  let app = await Pollygot.getAppConfig(appId)
  let fullUrl = `${app.config.url}/${resourceKey}`
  console.log('PostgREST POST: fullUrl', fullUrl)
  axios
    .post(fullUrl, payload, POST_HEADERS)
    .then(response => {
      return res.json({ data: response.data, headers: response.headers })
    })
    .catch(e => {
      return res.status(e.response.status).json(e.response.data)
    })
})

/**
 * Delete
 * https://postgrest.org/en/v5.0/api.html#deletions
 */
router.delete('/:appId/:resourceKey', async (req, res, next) => {
  if (!req.query)
    return res.status(422).json({ data: 'Must provide a selector' })

  const { appId, resourceKey } = req.params
  let app = await Pollygot.getAppConfig(appId)
  let fullUrl =
    `${app.config.url}/${resourceKey}` +
    `?${Helpers.decrypt(req.query.q.toString())}`
  console.log('PostgREST DELETE: fullUrl', fullUrl)
  axios
    .delete(fullUrl)
    .then(response => {
      return res.json({ data: response.data, headers: response.headers })
    })
    .catch(e => {
      return res.status(e.response.status).json(e.response.data)
    })
})

// Error handler
router.use((err, req, res, next) => {
  console.error(err) // eslint-disable-line no-console
  res.status(401).send(err + '')
})

// Cleanses axios/express headers for PostgREST.
const _attachHeaders = reqeustHeaders => {
  let headers = {}
  if (reqeustHeaders['range-unit'])
    headers['range-unit'] = reqeustHeaders['range-unit']
  if (reqeustHeaders['prefer']) headers['prefer'] = reqeustHeaders['prefer']
  if (
    reqeustHeaders['accept'] &&
    reqeustHeaders['accept'].indexOf('application/vnd.pgrst.object+json') >= 0
  )
    headers['accept'] = 'application/vnd.pgrst.object+json' // override annoying bug where axios is adding headers
  return headers
}

module.exports = router

//
//
// mocking out an API calls to Pollygot Core
//
const shortid = require('shortid')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync(process.env.LOCAL_DATA_STORE)
const db = low(adapter)

const saveRecordHistory = (
  appId,
  resourceKey,
  identifier,
  action,
  payload,
  userIdentifier
) => {
  return db
    .get('hummingbird_history')
    .push({
      id: shortid.generate(),
      app_id: appId,
      resource_key: resourceKey,
      identifier: identifier,
      action: action,
      payload: payload,
      author: userIdentifier, // user in this case, but could be anything - API, system, app etc.
      inserted: new Date(),
    })
    .write().id
}
