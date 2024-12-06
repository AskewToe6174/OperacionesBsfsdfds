const express = require('express');
const routerApi = require('./routes/')

const app = express();
const port = 3005;

app.use(express.json());
//get all promotores
routerApi(app);
//port listen
app.listen(port, () => {
  console.log('Runing' + port);
})
