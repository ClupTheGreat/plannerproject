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
let all_tasks=[];

//Runs a query to select all topics

function load_all_tables(){
    execute.run_query().then((data)=>{
        topic_pages = data;
        topic_pages.forEach(topic => {
            execute.get_task_details_for_each_topic(topic.topic_id)
                .then(rows => {
                    // add the resulting rows array to the all_tasks array
                    all_tasks.push({
                        topic_id: topic.topic_id,
                        tasks: rows
                    });
                })
                .catch(error => {
                    console.error(error); // log an error message if the Promise is rejected
                });
        });
    });
}

load_all_tables();

console.log(get_time.log_datetime());

// execute.get_task_details_for_each_topic(3)
//     .then(rows => {
//         console.log(rows); // log the resulting rows array to the console
//     })
//     .catch(error => {
//         console.error(error); // log an error message if the Promise is rejected
//     });

app.get('/', (req,res)=>{
    load_all_tables();
    Promise.all(topic_pages.map(topic => execute.get_task_details_for_each_topic(topic.topic_id)))
    .then(results => {
        all_tasks = results.map((tasks, index) => ({
            topic_id: topic_pages[index].topic_id,
            tasks
        }));
    })
    .catch(error => {
        console.error(error); // log an error message if the Promises are rejected
    });

    res.render('pages/index',{names : topic_pages, all_tasks : all_tasks });
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
    execute.create_task_and_insert_task_detail(task_description, task_start_time, task_end_time, task_name, topic_id);
    res.redirect('/');
    
});

//get_time.log_time();