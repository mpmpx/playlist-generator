const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const router = require('./routes/routes');
const serverConfig = require('./config/server.config');
const app = express();

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(cors());
app.use('/', router);
app.set('json spaces', 2);


app.listen(process.env.PORT || serverConfig.port, () => {
  console.log('Listening on port ' + serverConfig.port + '.');
})
