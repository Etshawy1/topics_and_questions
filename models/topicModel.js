const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  topic: {
    type: String,
    minlength: 1,
    required: [true, 'topic must be provided'],
    index: true 
  },
  _id: {
    type: Number,
    required: [true, 'topic must have an id']
  },
  questions:[Number]
});

const Topic = mongoose.model(
  'Topic',
  topicSchema
);

exports.Topic = Topic;