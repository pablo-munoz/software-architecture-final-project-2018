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

app.route('/accounts/login')
   .post((request, response) => {
     if (!_.every(['email'], _.partial(_.has, request.body, _))) {
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
       if (!account)
         return response.status(400).json({
           msg: 'Unexistent account'
         });
     } catch(error) {
       return response.status(400).json(error);
     }

     return response.status(200).json(account);
   });

console.log('accounts server listening on port 8081');
const port = process.env.PORT || 8081;
http.createServer(app).listen(port);
