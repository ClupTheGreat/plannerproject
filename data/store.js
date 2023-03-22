const sqlite = require('sqlite3').verbose();
let sql;
const db = new sqlite.Database('./data/store.db',sqlite.OPEN_READWRITE, (err) => {
    if (err) return console.error(err);
});

sql = 'CREATE TABLE IF NOT EXISTS topic (topic_id INTEGER PRIMARY KEY, topic_name)';
db.run(sql);
sql = 'CREATE TABLE IF NOT EXISTS task_detail (task_detail_id INTEGER PRIMARY KEY, task_description, task_start_time DATETIME, task_end_time DATETIME)';
db.run(sql);
sql = 'CREATE TABLE IF NOT EXISTS task (task_id INTEGER PRIMARY KEY, task_name, task_detail_id, topic_id, CONSTRAINT task_detail_id_fk FOREIGN KEY (task_detail_id) REFERENCES task_detail(task_detail_id), CONSTRAINT topic_id_fk FOREIGN KEY (topic_id) REFERENCES topic(topic_id))';
db.run(sql);

// function a (vals){
//     vals = 'Hello';
// };

function create_topic(topic_name){
    sql = 'INSERT INTO topic (topic_name) values (?)';
    db.run(sql,[topic_name],(err)=>{
        if (err) return console.log(err);
    });
};

// function create_task_and_details(task_name, topic_id, task_description, task_start_time, task_end_time){
//     sql = 'INSERT INTO task_detail (task_description,task_start_time,task_end_time) values (?,?,?)';
//     db.run(sql,[task_description,task_start_time,task_end_time],(err)=>{
//         if (err) return console.log(err);
//     });
//     sql = 'INSERT INTO task (task_name, task_detail_id, topic_id) values (?,?,?)';
//     db.run(sql,[task_name, task_detail_id, topic_id],(err)=>{
//         if (err) return console.log(err);
//     });
    
// };

function run_query(){
    return new Promise((resolve, reject)=>{
        sql = 'SELECT * FROM topic';
        db.all(sql,(err,rows)=>{
            if (err){
                reject(err);
            }
            resolve(rows);
        });
    });
};

function create_task_and_insert_task_detail(task_description, task_start_time, task_end_time, task_name, topic_id) {
    let task_detail_id = 0;
    const sql1 = 'INSERT INTO task_detail (task_description, task_start_time, task_end_time) VALUES (?, ?, ?)';
    db.run(sql1, [task_description, task_start_time, task_end_time], function (err) {
        if (err) {
            console.log(err.message);
        } else {
            task_detail_id = this.lastID;
            console.log(`Task detail ID: ${task_detail_id}`);
            const sql2 = 'INSERT INTO task (task_name, task_detail_id, topic_id) VALUES (?, ?, ?)';
            db.run(sql2, [task_name, task_detail_id, topic_id], function (err) {
                if (err) {
                    console.log(err.message);
                } else {
                    console.log('Task created successfully');
                }
            });
        }
    });
}





    //-------------------
    // let get_data = (getting_data) =>{
    //     return new Promise((resolve, reject) =>{
    //         db.serialize(()=>{
    //             db.get('SELECT * FROM topic', (err, rows)=>{
    //                 if (err) reject (err);
    //                 resolve(rows);
    //             });
    //         });
    //     });
    // }
    // let promise = get_data("return-data-from-sqlite3-nodejs").then((results)=>{
    //     console.log(results);
    // });
    //-----------------
    // sql = 'SELECT * FROM topic';
    // let result = [];
    // db.all(sql,[],(err,rows)=>{
    //     rows.forEach((row)=>{
    //         console.log(row);
    //         result.push(row);
            
    //     })
    // });
    // return result;
//};

module.exports = {create_topic, create_task_and_insert_task_detail, run_query};
// export function a(){
//     console.log("Exported func a");
// }

// sql = 'DELETE FROM topic where topic_id = 2';
// db.run(sql);

//create_topic('Hello');