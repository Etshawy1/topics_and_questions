const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const { Topic } = require('../models/topicModel');


exports.getQuestions = catchAsync(async (req, res, next) => {
  if (!req.query.q) {
    return next(new AppError('please add the q query parameter', 400));
  }
  const topic = await Topic.findOne({ topic: req.query.q });
  if (!topic) {
    return next(new AppError('No topic found with that name', 404));
  }
  topics_ids = [];
  getSubTree(topic._id, topics_ids);
  const topics = await Topic.find({ _id: topics_ids });
  questions = [];
  for (let topic of topics) {
    questions = questions.concat(topic.questions);
  }
  res.status(200).json(questions);

});

/**
 * recursive function to get all the sub topics of a topic
 * @param {Number} topicId the id of the topic you want to get its subtree 
 * @param {Array} topics the list of topics in the subtree of the provided topic
 */
function getSubTree(topicId, topics) {
  topics.push(topicId);
  directChildren = topics_tree.get(topicId.toString());
  for (let topic of directChildren) {
    getSubTree(topic, topics);
  }
}