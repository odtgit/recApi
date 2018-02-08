'use strict'

var config = require('config-yml')

var mongoose = require('mongoose'),
  Rec = mongoose.model('Recs')

var Agenda = require('agenda')
var agenda = new Agenda({
  mongo: mongoose.connection,
  name: 'API'
})

for (var chan of config.channels) {
  console.log(`chan ${chan.id} url ${chan.url}`)
}

function timestamp() {
  var now = new Date(Date.now() + 60 * 60000).toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/(\:\d{2})$/, '') // conversion to UTC + 1 hour
  return now
}

console.log(timestamp());

function asyncrec(recname, channel, duration = 60, id) {
  duration = duration * 60 // convert minutes to seconds
  recandchan = recname
  console.log(`Job \"${recname}\" with id ${id} starting at ${timestamp()}`)

  for (var chan of config.channels) {
    if (channel == chan.id) {
      var recandchan = recname + '_' + chan.id
      var channel = chan.url
    }
  }

  var filename = config.recordingDir + recandchan + '_' + timestamp() + '.ts'

  const {
    spawn
  } = require('child_process')
  const vlc = spawn('vlc', ['-I dummy', '--quiet', '--run-time', duration, channel, '--sout', 'file/ts:' + filename + '', 'vlc://quit'])

  vlc.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`)
  })

  vlc.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`)
  })

  vlc.on('close', (code) => {
    console.log(`Job \"${recname}\" finished at ${timestamp()} with code ${code}`)
    Rec.findById(id, function (err, doc) {
      if (!err) {
        doc.remove()
        console.log(`Document ${id} removed from the database`)
      } else {
        console.log(`ERROR: Could not find document ${id} in database`)
      }
    })
  })
}

agenda.define('recording', function (job, done) {
  var data = job.attrs.data
  asyncrec(data.recname, data.channel, data.duration, data.id)
  done()
})

agenda.on('ready', function () {
  agenda.start()
  agenda.now(console.log('Agenda started'))
})

exports.list_rec = function (req, res) {
  Rec.find({}, function (err, rec) {
    if (err) {
      res.send(err)
    }
    res.json(rec)
  })
}

exports.create_rec = function (req, res) {
  var new_rec = new Rec(req.body)
  new_rec.save(function (err, rec) {
    if (err) {
      res.status(500).send(err)
      console.log('ERROR: Job not scheduled')
    } else {
      res.json(rec)

      agenda.schedule(new Date(Date.parse(rec.startAt)), 'recording', {
        id: rec._id.toString(),
        recname: rec.name,
        channel: rec.channel,
        duration: rec.duration
      })

      console.log(`Job \"${rec.name}\" with id ${rec._id.toString()} scheduled for ${rec.startAt}`)
    }
  })
}

exports.read_rec = function (req, res) {
  Rec.findById(req.params.recId, function (err, rec) {
    if (err)
      res.send(err)
    res.json(rec)
  })
}

exports.delete_rec = function (req, res) {
  Rec.remove({
    _id: req.params.recId
  }, function (err, rec) {
    if (err) {
      res.status(500).send({
        message: "ERROR: Could not cancel job with id " + req.params.recId
      })
    } else {
      agenda.cancel({
        "data.id": req.params.recId
      })
      res.json({
        message: 'Job schedule deleted'
      })
      console.log(`Job with id ${req.params.recId} deleted`);
    }
  })
}

exports.channels = function (req, res) {
  res.json(config.channels)
}

exports.playlistsm3u = function (req, res) {
  res.setHeader('Content-Type', 'application/x-mpegurl')
  res.write('#EXTM3U \n\n')
  for (let [i, chan] of config.channels.entries()) {
    res.write('#EXTINF:-1 tvg-id="' + i + '" tvg-name="' + chan.name + '" tvg-logo="' + chan.id + '.png", ' + chan.name + '\n' + chan.url + '\n\n')
  }
  res.end()
}

function graceful() {
  agenda.stop(function () {
    process.exit(0)
  })
}

process.on('SIGTERM', graceful)
process.on('SIGINT', graceful)
