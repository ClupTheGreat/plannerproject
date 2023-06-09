const port = 3000;
const execute = require('./data/store.js');
const get_time = require('./public/js/get_time.js')
const express = require('express');
const bodyParser = require('body-parser');
var ejs = require('ejs');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.listen(port);

let topic_id;
let topic_pages=[];
let topic_and_their_task = [];
let all_tasks=[];
let current_topic=1; //Defaulting current topic to 1 whenever the page is loaded

//Runs a query to select all topics

function load_all_tables() {
    return new Promise((resolve, reject) => {
      execute.run_query().then((data)=>{
        topic_pages = data;
        execute.get_task_details(current_topic)
                .then(rows => {
                  // add the resulting rows array to the all_tasks array
                  all_tasks.push({
                    tasks: rows
                  });
                  resolve(); // resolve the Promise with the data
                })
                .catch(error => {
                  console.error(error); // log an error message if the Promise is rejected
                  reject(error); // reject the Promise with the error
                });
      });
    });
  };

all_tasks=[];

console.log(get_time.log_datetime());

app.get('/', async (req,res)=>{
  const data = req.query.data;
  // Check if the 'data' parameter is present and has a non-empty value
  if (data) {
    // Handle the request with the 'data' parameter
    current_topic=data;
    console.log(current_topic);
    all_tasks=[];
    await load_all_tables();
    res.render('pages/index',{names : topic_pages, all_tasks : all_tasks[0], current_topic : current_topic });
  } else {
    // Handle the request without the 'data' parameter
    await load_all_tables();
    res.render('pages/index',{names : topic_pages, all_tasks : all_tasks[0], current_topic : current_topic });
  }
});


app.post('/', async (req,res)=>{
    await load_all_tables();
    res.redirect('/');
});

app.get('/create_topic', (req,res)=>{
    res.render('pages/create_topic',{names:topic_pages});
});

app.post('/create_topic', (req,res)=>{
    res.redirect('/create_topic');
    
});

app.post('/topic_creator', (req,res)=>{
    const topic_name = req.body.topic_name;
    if (topic_name) {
      console.log(topic_name)
      execute.create_topic(topic_name);
      res.redirect('/');
    } else {
      res.redirect('/');
    }
});

app.get('/task_creator', (req,res)=>{
    //execute.create_topic(topic_name);
    res.render('pages/task_creator',{topic_nm : topic_id, names : topic_pages});
});

app.post('/task_creator', (req,res)=>{
    topic_id = req.body.topic_id_current;
    console.log(topic_id);
    res.redirect('/task_creator');
    
});

app.post('/task_created', (req,res)=>{
    const task_name = req.body.task_name;
    const task_description = req.body.task_description;
    const task_end_time = req.body.task_end_time;
    const task_start_time = req.body.task_start_time[0];
    execute.create_task_and_insert_task_detail(task_description, task_start_time, task_end_time, task_name, topic_id);
    current_topic = req.body.hidden_topic_id;
    all_tasks=[];
    
    load_all_tables().then(() => {
      res.redirect(`/?message=reload&data=${topic_id}`);
    });
  });

app.get('/editor', (req,res)=>{
    res.render('pages/editor',{names:topic_pages});
});

app.post('/editor', (req,res)=>{
    const task_id = req.body.edit_request;
  execute.select_task(task_id)
    .then((task_data) => {
      console.log(task_data);
      res.render('pages/editor', { task_id, task_data, names:topic_pages});
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Internal Server Error');
    });

});

app.post('/editor_process', (req, res)=>{
    const task_name = req.body.task_name;
    const task_detail = req.body.task_detail;
    const start_time = req.body.start_time;
    const end_time = req.body.end_time;
    const task_id = req.body.task_id;
    console.log(task_id);
    execute.edit_task(task_id, task_name, task_detail, start_time, end_time);
    res.redirect('/');
});

app.post('/change_topic',(req,res)=>{
    current_topic = req.body.hidden_topic_id;
    all_tasks=[];
    load_all_tables().then(() => {
      console.log(all_tasks);
      res.redirect('/');
    });
  });

app.post('/delete_task',(req,res)=>{
    var task_id_del = req.body.task_id_del;
    console.log(task_id_del)
    execute.delete_task(task_id_del);
    res.redirect(`/?message=reload&data=1`);
});

app.post('/change_status', (req,res)=>{
    let status = req.body.task_status;
    let task_id = req.body.task_stat_id;
    if (status == 1){
      execute.change_status(0, topic_id);
    } else {
      execute.change_status(1, topic_id);
    }
    res.redirect(`/?message=reload&data=1`);
});

app.post('/delete_topic',(req,res)=>{
  let topic_id = req.body.hidden_topic_id;
  execute.delete_topic(topic_id);
  res.redirect(`/?message=reload&data=1`);
});
