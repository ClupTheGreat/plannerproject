const router = require("express").Router();
const execute = require('./data/store.js');

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

router.get("/",async (req,res)=>{
    res.send("Welcome");
    await load_all_tables();
    res.render('pages/index',{names : topic_pages, all_tasks : all_tasks[0], current_topic : current_topic });
})

router.post("/",async (req,res)=>{
    await load_all_tables();
    res.redirect('/');
})
module.exports = router;