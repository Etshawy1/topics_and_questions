const fs = require('fs');
const csv = require('fast-csv');
require('dotenv').config();
const mongoose = require('mongoose');
const {Topic} = require('../models/topicModel');

const topics = new Map();
const topics_tree = new Map();
const topics_questions = new Map();

fs.createReadStream('./input/topics.csv')
    .pipe(csv.parse({ headers: true }))
    .on('error', error => console.error(error))
    .on('data', row => {
      for (let key in row) {
        row[key] = row[key].trim();
        if (row[key] === '') continue;
        let topic_key = topics.get(row[key]);
        if (!topics.has(row[key]))
        {
          topic_key = topics.size;
          topics_tree.set(topic_key, new Set());
          topics_questions.set(topic_key, []);
          topics.set(row[key], topic_key);
        }
        if (key === 'Topic Level 2')
        {
          topics_tree.get(topics.get(row['Topic Level 1'])).add(topic_key);
        }
        else if (key === 'Topic Level 3')
        {
          topics_tree.get(topics.get(row['Topic Level 2'])).add(topic_key);
        }
      }
    })
    .on('end', rowCount => parse_questions());

function parse_questions()
{
  fs.createReadStream('./input/questions.csv')
  .pipe(csv.parse({ headers: true }))
  .on('error', error => console.error(error))
  .on('data', row => {
    for (let key in row) {
      row[key] = row[key].trim();
      if (row[key] === '' || key === 'Question number') continue;
      let topic_key = topics.get(row[key]);
      topics_questions.get(topic_key).push(parseInt(row['Question number']));
    }
  })
  .on('end', rowCount => saveResults());
}

function saveResults(){
  // store the topics tree in a file
  for(let [key, value] of topics_tree)
  {
    topics_tree.set(key, Array.from(value));
  }
  let topics_tree_json = JSON.stringify(Object.fromEntries(topics_tree));
  fs.writeFile('./output/topics_tree.json', topics_tree_json, (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
  });
  
  
  // store the topics in the database
  const topics_array = []
  for(let [key, value] of topics)
  {
    topics_array.push({
      topic: key,
      _id: value,
      questions: topics_questions.get(value) || []
    });
  }
  const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
  );
  mongoose
    .connect(DB, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    })
    .then(async () => {
      await Topic.deleteMany({});
      await Topic.insertMany(topics_array);
    })
    .catch(err => console.log(err));
}