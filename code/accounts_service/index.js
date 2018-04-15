const _ = require('lodash');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
module.exports = app;
const business = require('./business')({});

app.use(bodyParser.json());

app.route('/accounts/register')
   .post((request, response) => {

     if (!_.every(['email', 'name'], _.partial(_.has, request.body, _))) {
       return response.status(400)
                      .json({
                        'msg': 'Wrong body',
                        'body': {
                          'email': '...',
                          'name': '...'
                        }
                      });
     }

     let account = null;

     try {
       account = business.createAccount(request.body);
     } catch(error) {
       return response.status(400).json(error);
     }

     return response.status(200).json(account);
   });

app.route('/acconts/login')
   .post((request, response) => {
     if (!_.every(['email', 'name'], _.partial(_.has, request.body, _))) {
       return response.status(400)
                      .json({
                        msg: 'Wrong body',
                        body: {
                          'email': '...'
                        }
                      });
     }

     let account = null;

     try {
       account = business.findAccount(request.body);
     } catch(error) {
       return response.status(400).json(error);
     }

     return response.status(200).json(account);
   });

const port = process.env.PORT || 8081;
http.createServer(app).listen(port);
