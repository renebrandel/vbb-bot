import request from 'request'
import config from './config'
import {getFirstStation, getTripsFromResult, getDeparturesFromResult} from './valueparser'

const token = config.getToken()
const baseUrl = config.url

export function getStation (query) {
  // Name of the API service
  const serviceName = 'location.name'
  // Parameters for the API
  const parameters = {
    input: query,
    type: 'S'
  }
  // Return the API call as promise
  return callToAPI(serviceName, parameters).then(result => getFirstStation(result))
}

export function getDepartures (id) {
  // Name of the API service
  const serviceName = 'departureBoard'
  // Parameters for the API
  const parameters = {id: id}
  // Return the API call as promise
  return callToAPI(serviceName, parameters).then(result => getDeparturesFromResult(result))
}

export function getTrips (fromId, toId) {
  // Name of the API service
  const serviceName = 'trip'
  // Parameters for the API
  const parameters = {
    originId: fromId,
    destId: toId
  }
  // Return the API call as promise
  return callToAPI(serviceName, parameters).then(result => getTripsFromResult(result))
}


// Takes parameters as object and returns url parameter string, e.g.:
// {a: 1, b: 2, c: 3} => a=1&b=1&c=1
// see https://en.wikipedia.org/wiki/Query_string
function urlParams(params, separator = '&') {
  // Collect all key-value pairs in 'params'
  // as 'key=value' strings
  var pairs = []
  for (var key in params) {
    pairs.push(key + '=' + params[key])
  }
  // join and return all 'key=value' pairs joined with the separator
  // i.e.: key1=value1&key2=value2&...
  return pairs.join(separator)
}


// Return a promise to retrieve the requested data
// To understand 'promises' in JS, check out:
// https://spin.atomicobject.com/2016/02/16/how-javascript-promises-work/
export function callToAPI(serviceName, parameters) {
  // Add access token and format setting to parameters
  parameters.accessId = token
  parameters.format = 'json'
  // Create a new promise
  // If the data couldn't be retrieved, reject(error) is called
  // If the data was retrieved, resolve(body) is called
  return new Promise((resolve, reject) => {
    // The request is sent using a function called 'request'
    //     request( uri, options, callback )
    // (checkout https://github.com/request/request)
    request(
      // Url to send the request to
      `${baseUrl}/${serviceName}?${urlParams(parameters)}`,
      // The returned data is a json
      {json: true},
      // Callback, the function called once the server (API) responded
      (error, response, body) => {
        // If we get an error or the response isn't right (not 200 code),
        // we call reject(), which calls 'func' in Promise.catch(func)
        if (error) return reject(error)
        if (response.statusCode !== 200) return reject(new Error(body))
        // otherwise we call resolve(), which calls 'func' in Promise.then(func)
        resolve(body)
      })
  })
}
