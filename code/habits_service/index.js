const _ = require('lodash');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
module.exports = app;
const business = require('./business')({});

app.use(cors());
app.use(bodyParser.json());

app.route('/habits')
   .get((request, response) => {
     const searchCriteria = _.isEmpty(request.body) ? undefined : request.body;

     business.listHabits(searchCriteria, (err, habits) => {
       if (err) return response.status(400).json(err);
       return response.json(habits);
     });
   })
   .post((request, response) => {
     const newHabitData = request.body;

     business.createHabit(newHabitData, (err, habit) => {
       if (err) return response.status(400).json(err);
       return response.json(habit);
     });
   });

app.route('/habits/:id')
   .get((request, response) => {
     const habitId = request.params.id;

     business.getHabit(habitId, (err, habit) => {
       if (err) return reposnse.status(400).json(err);
       return response.json(habit);
     });
   })
   .put((request, response) => {
     const newHabitData = request.body;

     business.updateHabit(request.params.id, newHabitData, (err, habit) => {
       if (err) return reponse.status(400).json(err);
       return response.json(habit);
     });
   })
   .delete((request, response) => {
     business.deleteHabit(request.params.id, (err, habit) => {
       if (err) return reponse.status(400).json(err);
       return response.status(204).end();
     });
   });

app.route('/habits/:id/do')
   .post((request, response) => {
     const kind = _.get(request.body, 'kind', undefined);
     business.doHabit(request.params.id, kind, (err, habit) => {
       if (err) return reponse.status(400).json(err);
       return response.json(habit);
     });
   });


console.log('habits server listening on port 8082');
http.createServer(app).listen(8082);
