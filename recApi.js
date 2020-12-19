'use strict'

var express = require('express'),
  app = express(),
  config = require('config-yml'),
  port = config.port,
  morgan = require('morgan'),
  mongoose = require('mongoose'),
  Rec = require('./api/models/recModel'), //created model loading here
  bodyParser = require('body-parser')

require('console-stamp')(console, {
  pattern: 'isoDateTime'
})

morgan.format('mydate', function () {
  var df = require('dateformat')
  return df(new Date(), "isoDateTime")
})

app.use(morgan('[:mydate] [:method]    :url :status :res[content-length] - :remote-addr - :response-time ms'))

// mongoose instance connection url connection
mongoose.Promise = global.Promise
mongoose.connect(config.dburl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

mongoose.connection.on('error', function () {
  console.log('Could not connect to the database. Exiting now...')
  process.exit()
})

mongoose.connection.once('open', function () {
  console.log("Successfully connected to database")
})

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())

//Set view engine to ejs
app.set("view engine", "ejs");
//Tell Express where we keep our index.ejs
app.set("views", __dirname + "/views");

//Use body-parser
app.use(bodyParser.urlencoded({
  extended: false
}));

//Instead of sending Hello World, we render index.ejs
app.get("/", (req, res) => {
  var email = req.headers['x-forwarded-user'];
  var userName = email.substring(0, email.lastIndexOf("@"));
  res.render("index", {
    userName: userName
  });
});

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