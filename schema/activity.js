"use strict";

const mongoose = require("mongoose");

/**
 * Define the Mongoose Schema for a Comment.
 */
const activitySchema = new mongoose.Schema({
  username: String,
  userid: String,
  time: Date,
  type: String,
  photo_id:String,
  photo_path:String,
  comment:String,
});

/**
 * Create a Mongoose Model for a User using the userSchema.
 */
const Activity = mongoose.model("Activity", activitySchema);

/**
 * Make this available to our application.
 */
module.exports = Activity;
