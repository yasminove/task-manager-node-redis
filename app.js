const express = require('express'); 
const path = require('path');
const logger = require('morgan'); 
const bodyParser = require('body-parser'); 
const redis = require('redis');

const app = express(); 

const client = redis.createClient()
client.on('connect', () => {
    console.log('Redis client connected');
})

app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public'))); 

const PORT = process.env.PORT || 4000

app.get('/', (req, res) => {
    var title = 'Redis Task Manager'
    client.lrange('tasks', 0, -1, (err, data) => {
        client.hgetall('call', (err, reply) => {
            if(err){
                console.log('Err', err);
            }
            res.render('index', {
                title: title, 
                tasks: data, 
                call: reply
            })
        })
    })
   
})

app.post('/task/add', (req, res) => {
    let task = req.body.task; 
    console.log(task, 'tasssk');
    client.rpush('tasks', task, (err, data) => {
        if(err){
            console.log(err);
        }
        console.log('task added');
        res.redirect('/')
    })
})

app.post('/task/delete', (req, res) => {
    const tasks = req.body.tasks; 
    console.log(tasks, 'tasks');
    client.lrange('tasks', 0, -1, (err, reply) => {
        if(err){
            console.log('Err in getting list items', err);
        }
        
        for(var i=0; i<reply.length; i++){
           if(tasks.indexOf(reply[i]) > -1 ){
                client.lrem('tasks', 0, reply[i], (err, result) => {
                    if(err){
                        console.log('Err in removing', err);
                    }
                    console.log(result);
                })
            }
        }
        res.redirect('/')
    })
})

app.post('/call/add', (req, res) => {
    const newCall = {}
    newCall.name = req.body.name
    newCall.compnay = req.body.compnay
    newCall.phone = req.body.phone
    newCall.time = req.body.time

    console.log(newCall, 'newCall');

    client.hset('call', [
        'name', newCall.name,
        'company', newCall.compnay,
        'phone', newCall.phone,
        'time', newCall.time,
    ], (err, reply) => {
        if(err){
            console.log(err, 'err');
        }
        console.log(reply, 'reply');
        res.redirect('/')
    })
})

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
})
