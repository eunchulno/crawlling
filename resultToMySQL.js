/**
 * Created by eunchul on 2017-05-21.
 */
const csv=require('csvtojson');
var mysql = require('mysql');
var RDS = require('./rdsInfo')

var questions = [];
var anwsers = [];
var list = [];

var dbConfig = {
    host: RDS.host,
    user: RDS.user,
    password: RDS.password,
    port: RDS.port,
    database: RDS.database
};
var conn = mysql.createConnection(dbConfig);

csv()
    .fromFile('./url.csv')
    .on('json',(jsonObj)=>{
    // combine csv header row and csv line to a json object
    list.push(jsonObj.subjects);
})
.on('done',(error)=>{
    for(var i = 0; i< list.length; i++){
        sendDB(list[i]);
        console.log(i);
    }
})


function sendDB (fileName){
    csv()
        .fromFile('./result/'+fileName+'.csv')
        .on('json',(jsonObj)=>{
        // combine csv header row and csv line to a json object
        questions.push(jsonObj.questions);
        anwsers.push(jsonObj.anwsers);
    })
    .on('done',(error)=>{
        tryInsert(fileName, questions, anwsers);
        questions = [];
        anwsers = [];
    })
}

function tryInsert(subject, questions, anwsers) {
    for(var i = 0 ; i < questions.length ; i++){
        const sql = 'INSERT INTO faq (subject, question, anwser) VALUES (?, ?, ?);';
        const params = [subject, questions[i], anwsers[i]];
        conn.query(sql, params, function(err, results) {
            if ( err ) {
                console.error('Error : ', err);
                return;
            }
        });
    }
}