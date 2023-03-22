const port = 3000;
const execute = require('./data/store.js');
const get_time = require('./public/js/get_time.js')
const express = require('express');
const bodyParser = require('body-parser');
var ejs = require('ejs');

const app = express();
app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.listen(port);

let topic_id;
let topic_pages=[];

//Runs a query to select all topics
execute.run_query().then((data)=>{
    topic_pages = data;
});
console.log(get_time.log_datetime());

app.get('/', (req,res)=>{
    execute.run_query().then((data)=>{
        topic_pages = data;
    });
    res.render('pages/index',{names : topic_pages});
});

app.post('/', (req,res)=>{
    const topic_name = req.body.topic_name;
    if (topic_name) {
        execute.create_topic(topic_name);
        res.redirect('/');
      } else {
        res.redirect('/');
      }
    });

app.get('/create_topic', (req,res)=>{
    res.render('pages/create_topic');
});

app.post('/create_topic', (req,res)=>{
    res.redirect('/create_topic');
    
});

app.get('/task_creator', (req,res)=>{
    //execute.create_topic(topic_name);
    res.render('pages/task_creator',{topic_nm : topic_id});
});

app.post('/task_creator', (req,res)=>{
    topic_id = req.body.topic_id;
    res.redirect('/task_creator');
    
});

app.post('/task_created', (req,res)=>{
    const task_name = req.body.task_name;
    const task_description = req.body.task_description;
    const task_end_time = req.body.task_end_time;
    const task_start_time = req.body.task_start_time[0];
    console.log(task_name);
    console.log(task_description);
    console.log(task_end_time);
    console.log(task_start_time);
    console.log(topic_id);
    execute.create_task_and_insert_task_detail(task_description, task_start_time, task_end_time, task_name, topic_id);
    res.redirect('/');
    
});

//get_time.log_time();