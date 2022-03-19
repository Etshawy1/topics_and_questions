const fs = require('fs');
const csv = require('fast-csv');

// topics = {};
const topics = new Map();
// topics_tree = {};
const topics_tree = new Map();
const topics_questions = new Map();
fs.createReadStream('./input/topics.csv')
    .pipe(csv.parse({ headers: true }))
    .on('error', error => console.error(error))
    .on('data', row => {
      for (let key in row) {
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
      if (row[key] === '' || key === 'Question number') continue;
      let topic_key = topics.get(row[key]);
      topics_questions.get(topic_key).push(parseInt(row['Question number']));
    }
  })
  .on('end', rowCount => saveResults());
}

function saveResults(){
  for(let [key, value] of topics_tree)
  {
    topics_tree.set(key, Array.from(value));
  }

  let topics_tree_json = JSON.stringify(Object.fromEntries(topics_tree));
  let topics_questions_json = JSON.stringify(Object.fromEntries(topics_questions));
  let topics_json = JSON.stringify(Object.fromEntries(topics));
  
  fs.writeFile('./output/topics.json', topics_json, (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
  });
  fs.writeFile('./output/topics_tree.json', topics_tree_json, (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
  });
  fs.writeFile('./output/topics_questions.json', topics_questions_json, (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
  });
}