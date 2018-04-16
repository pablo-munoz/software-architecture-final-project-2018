const http = require('http');
const _ = require('lodash');
const fs = require('fs');
const express = require('express');
const { makeAdminReport } = require('./report_aggregator');

const app = express();

app.route('/reports')
   .get((request, response) => {
     response.json(JSON.parse(fs.readFileSync('report.json', 'utf8')));
   });

setInterval(makeAdminReport, 1000*60*30);

console.log('reports service listening on ports 8084');
http.createServer(app).listen(8084);
