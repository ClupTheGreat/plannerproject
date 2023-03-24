const sqlite = require('sqlite3').verbose();
let sql;
const db = new sqlite.Database('./data/store.db',sqlite.OPEN_READWRITE, (err) => {
    if (err) return console.error(err);
});


// Creates all tables
// sqltopic = 'CREATE TABLE IF NOT EXISTS topic (topic_id INTEGER PRIMARY KEY, topic_name TEXT)'
// sqltask_detail = 'CREATE TABLE IF NOT EXISTS task_detail (task_detail_id INTEGER PRIMARY KEY, task_description TEXT, task_start_time DATETIME, task_end_time DATETIME, task_id INTEGER, topic_id INTEGER, CONSTRAINT task_id_fk FOREIGN KEY (task_id) REFERENCES task(task_id) ON DELETE CASCADE, CONSTRAINT topic_id_fk FOREIGN KEY (topic_id) REFERENCES topic(topic_id) ON DELETE CASCADE)'
// sqltask = 'CREATE TABLE IF NOT EXISTS task (task_id INTEGER PRIMARY KEY, task_name TEXT, task_detail_id INTEGER, topic_id INTEGER, CONSTRAINT task_detail_id_fk FOREIGN KEY (task_detail_id) REFERENCES task_detail(task_detail_id) ON DELETE CASCADE, CONSTRAINT topic_id_fk FOREIGN KEY (topic_id) REFERENCES topic(topic_id) ON DELETE CASCADE)'
sqltopic = 'CREATE TABLE IF NOT EXISTS topic (topic_id INTEGER PRIMARY KEY, topic_name TEXT)'
sqltask_detail = 'CREATE TABLE IF NOT EXISTS task_detail (task_detail_id INTEGER PRIMARY KEY, task_description TEXT, task_start_time DATETIME, task_end_time DATETIME, task_id INTEGER, topic_id INTEGER, CONSTRAINT task_id_fk FOREIGN KEY (task_id) REFERENCES task(task_id) ON DELETE CASCADE, CONSTRAINT topic_id_fk FOREIGN KEY (topic_id) REFERENCES topic(topic_id) ON DELETE CASCADE)'
sqltask = 'CREATE TABLE IF NOT EXISTS task (task_id INTEGER PRIMARY KEY, task_name TEXT, task_detail_id INTEGER, topic_id INTEGER, CONSTRAINT task_detail_id_fk FOREIGN KEY (task_detail_id) REFERENCES task_detail(task_detail_id) ON DELETE CASCADE, CONSTRAINT topic_id_fk FOREIGN KEY (topic_id) REFERENCES topic(topic_id) ON DELETE CASCADE)'
db.run(sqltopic);
db.run(sqltask_detail);
db.run(sqltask);

// sqltopic = 'DROP TABLE topic'
// sqltask_detail = 'DROP TABLE task'
// sqltask = 'DROP TABLE task_detail'
// db.run(sqltopic);
// db.run(sqltask_detail);
// db.run(sqltask);


// function a (vals){
//     vals = 'Hello';
// };

//Creates a topic
function create_topic(topic_name){
    sql = 'INSERT INTO topic (topic_name) values (?)';
    db.run(sql,[topic_name],(err)=>{
        if (err) return console.log(err);
    });
};

function get_task_details(topic_id){
    let sql5 = `SELECT task.task_id, task_name, task_description, task_start_time, task_end_time, task.topic_id
    FROM task_detail
    JOIN task ON task.task_id = task_detail.task_id
    WHERE task_detail.topic_id = ?`;
    return new Promise((resolve, reject)=>{
        db.all(sql5,[topic_id],(err,rows)=>{
            if (err){
                reject(err);
            } else {
                resolve(rows);
            }
        });
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

//Selects all topics and returns them, used promise as its an async function and will only return when query is run or throw an error
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


//Inserts into task and task_detail, uses this.lastID to get the last executed id as that id is auto-generated, uses that id to insert into task and its foreign keys.
function create_task_and_insert_task_detail(task_description, task_start_time, task_end_time, task_name, topic_id) {
    let task_detail_id = 0; //Initating variable so it will be used in the next query
    const sql1 = 'INSERT INTO task_detail (task_description, task_start_time, task_end_time) VALUES (?, ?, ?)';
    db.run(sql1, [task_description, task_start_time, task_end_time], function (err) {
        if (err) {
            console.log(err.message);
        } else { //running query inside this section ensures that sql2 query is run when sql1 query is executed.
            task_detail_id = this.lastID;
            //console.log(`Task detail ID: ${task_detail_id}`);
            const sql2 = 'INSERT INTO task (task_name, task_detail_id, topic_id) VALUES (?, ?, ?)';
            db.run(sql2, [task_name, task_detail_id, topic_id], function (err) {
                if (err) {
                    console.log(err.message);
                } else {
                    const task_id = this.lastID;
                    const sql3 = 'UPDATE task_detail SET task_id = ? WHERE task_detail_id = ?';
                    const sql4 = 'UPDATE task_detail SET topic_id = ? WHERE task_detail_id = ?';
                    console.log('Task created successfully');
                    db.run(sql3, [task_id, task_detail_id], function (err) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            //console.log('Task created successfully');
                        }
                    });
                    db.run(sql4, [topic_id, task_detail_id], function (err) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            //console.log('Task created successfully');
                        }
                    });
                }
            });
        }
    });
}

function select_task(task_id){
    let sql7 = 'SELECT task.task_name, task.task_detail_id, task_detail.task_description, task_detail.task_start_time, task_detail.task_end_time FROM task_detail JOIN task ON task.task_id = task_detail.task_id WHERE task_detail.task_id = ?';
    return new Promise((resolve, reject)=>{
        db.all(sql7,[task_id],(err,rows)=>{
            if (err){
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function edit_task(task_id, task_name, task_detail, start_time, end_time){
    sql6 = 'UPDATE task_detail SET task_description = ?, task_start_time = ? , task_start_time = ? WHERE task_id = ?';
    sql8 = 'UPDATE task SET task_name = ? WHERE task_id=?';
    db.run(sql6, [task_detail, start_time, end_time, task_id], function (err) {
        if (err) {
            console.log(err.message);
        } else {
            //console.log('Task created successfully');
        }
    });

    db.run(sql8, [task_name, task_id], function (err) {
        if (err) {
            console.log(err.message);
        } else {
            //console.log('Task created successfully');
        }
    });
}

function delete_task(task_id){
    sql9 = 'DELETE FROM task WHERE task_id = ?';
    db.run(sql9,[task_id], (error)=>{
        if (error){
        } else {
        }
    });
    sql10 = 'DELETE FROM task_detail WHERE task_id = ?';
    db.run(sql10,[task_id], (error)=>{
        if (error){
        } else {
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

//exports all the function to be used in index.js
module.exports = {create_topic, create_task_and_insert_task_detail, run_query, get_task_details, select_task, edit_task, delete_task};
// export function a(){
//     console.log("Exported func a");
// }

// sql = 'DELETE FROM topic where topic_id = 2';
// db.run(sql);

//create_topic('Hello');