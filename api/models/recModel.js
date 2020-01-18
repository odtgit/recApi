"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var RecSchema = new Schema({
  name: {
    type: String,
    default: "rec",
    maxlength: [60, "60 char max recording name"]
  },
  channel: {
    type: String,
    required: "The channel to record",
    maxlength: [60, "60 char max channel name"]
  },
  duration: {
    type: Number,
    default: 60,
    min: [1, "1min recording minimum"],
    max: [300, "5 hours maximum"]
  },
  startAt: {
    type: Date,
    default: Date.now
  },
  addedOn: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Recs", RecSchema);
