'use strict'

var express = require('express'),
  app = express(),
  config = require('config-yml'),
  port = config.port,
  morgan = require('morgan'),
  mongoose = require('mongoose'),
  Rec = require('./api/models/recModel'), //created model loading here
  bodyParser = require('body-parser')

require('console-stamp')(console, '[HH:MM:ss.l]')

morgan.format('mydate', function() {
    var df = require('dateformat')
    return df(new Date(), 'HH:MM:ss.l')
})

app.use(morgan('[:mydate] :method :url :status :res[content-length] - :remote-addr - :response-time ms'))

// mongoose instance connection url connection
mongoose.Promise = global.Promise
mongoose.connect(config.dburl, {
  useMongoClient: true
})

mongoose.connection.on('error', function () {
  console.log('Could not connect to the database. Exiting now...')
  process.exit()
})

mongoose.connection.once('open', function () {
  console.log("Successfully connected to the recordings database")
})

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())

app.get('/', function (req, res) { // serve the frontend
  res.sendFile('frontend/index.html', {
    root: __dirname
  })
})


var routes = require('./api/routes/recRoutes') //importing routes
routes(app) //register the routes


app.use(function (req, res) {
  res.status(404).send({
    url: req.originalUrl + ' not found'
  }) // nice 404 for wrong url
})


app.listen(port, function () {
  console.log('Media recording scheduler API started on port ' + port)
})
