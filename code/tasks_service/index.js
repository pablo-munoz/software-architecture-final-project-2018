const _ = require('lodash');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
module.exports = app;
const business = require('./business')({});

app.use(bodyParser.json());

app.route('/tasks')
   .get((request, response) => {
     const searchCriteria = _.isEmpty(request.body) ? undefined : request.body;

     business.listTasks(searchCriteria, (err, tasks) => {
       if (err) return response.status(400).json(err);
       return response.json(tasks);
     });
   })
   .post((request, response) => {
     const newTaskData = request.body;

     business.createTask(newTaskData, (err, task) => {
       if (err) return response.status(400).json(err);
       return response.json(task);
     });
   });

app.route('/tasks/:id')
   .put((request, response) => {
     const newTaskData = request.body;

     business.updateTask(request.params.id, newTaskData, (err, task) => {
       if (err) return reponse.status(400).json(err);
       return response.json(task);
     });
   })
   .delete((request, response) => {
     business.deleteTask(request.params.id, (err, task) => {
       if (err) return reponse.status(400).json(err);
       return response.status(204).end();
     });
   });

app.route('/tasks/:id/do')
   .post((request, response) => {
     business.doTask(request.params.id, (err, task) => {
       if (err) return reponse.status(400).json(err);
       return response.json(task);
     });
   });


http.createServer(app).listen(8083);
