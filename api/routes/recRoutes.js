'use strict'

module.exports = function (app) {
  var recorder = require('../controllers/recController')

  app.route('/rec')
    .get(recorder.list_rec)
    .post(recorder.create_rec)

  app.route('/rec/:recId')
    .get(recorder.read_rec)
    .delete(recorder.delete_rec)

  app.route('/channels')
    .get(recorder.channels)

  app.route('/playlist.m3u')
    .get(recorder.playlistsm3u)
    
}