import restify from 'restify'
import builder from 'botbuilder'
import { getStations, getTrips, getDepartures } from './api'
import { stringifyDepartures, getFirstStation  } from './valueparser'

// Setting up the server
const server = restify.createServer()
server.listen(3978, () => {
  console.log('%s listening to %s', server.name, server.url)
})

// Create chat bot
const connector = new builder.ChatConnector({
  appId: process.env.APP_ID,
  appPassword: process.env.APP_PASSWORD,
})

const bot = new builder.UniversalBot(connector)

server.post('/api/messages', connector.listen())

bot.dialog('/', (session) => {
  // Enter dialog here
})
