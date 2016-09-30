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

const recognizer = new builder.LuisRecognizer('https://api.projectoxford.ai/luis/v1/application?id=d61f3e18-0a45-486f-b10d-86c9328fbf3e&subscription-key=96348f97b0ef4e96b0dc0e880b39805a')
const intents = new builder.IntentDialog({ recognizers: [recognizer] })

bot.dialog('/', intents)

const loading = ['(movember)', '(nerd)', '(ghost)', '(o)', '(rainbow)', '(holdon)', '(sloth)']

intents.matches('Greeting', [
  (session, args) => {
    session.send('(wave)')
    const card = new builder.HeroCard(session)
      .title(`I'm VBB Bot`)
      .text('Why get a car, if you can have VBB?')
      .images([
        builder.CardImage.create(session, 'http://images.vbb.de/assets/downloads/file/22135.jpg')
      ])
      .buttons([
        builder.CardAction.imBack(session, 'Which trains are leaving Alexanderplatz?', 'Which trains are leaving Alexanderplatz?')
      ])
    const msg = new builder.Message(session).attachments([card])
    session.send(msg)
  }
])

intents.matches('GetTrip', [
  (session, args) => {
    session.send(loading)
    const fromStation = builder.EntityRecognizer.findEntity(args.entities, 'FromLocation').entity
    const toStation = builder.EntityRecognizer.findEntity(args.entities, 'ToLocation').entity

    Promise.all([
      getStations(fromStation),
      getStations(toStation)
    ]).then(stations => {
      session.send('Looking for trips from **%s** to **%s**.', stations[0].name, stations[1].name)
      getTrips(stations[0].id, stations[1].id).then(result => {
        session.send(result)
      })
    })
  }
])

intents.matches('GetDepartures', [
  (session, args) => {
    session.send(loading)
    getStations(builder.EntityRecognizer.findEntity(args.entities, 'FromLocation').entity)
      .then(station => {
        session.send('Let me look for all the trains leaving %s', station.name)
        return getDepartures(station.id)
      })
      .then((departures) => {
        const departure = departures[0]
        session.dialogData.departures = departures.slice(1)
        session.send('(tubelight)**%s** is leaving at **%s** in direction of **%s**(tubelight)', departure.name.trim(), departure.time, departure.direction)
        const card = new builder.HeroCard(session)
          .title('Do you want to see more results?')
          .buttons([
            builder.CardAction.imBack(session, 'Yes', 'Yes'),
            builder.CardAction.imBack(session, 'No', 'No')
          ])
        const msg = new builder.Message(session).attachments([card])
        builder.Prompts.confirm(session, msg)
      })
  }, (session, args) => {
    if (args.response) {
      session.endDialog(stringifyDepartures(session.dialogData.departures))
    } else {
      session.endDialog(['(ttm)', '(whew)'])
    }
  }
])
