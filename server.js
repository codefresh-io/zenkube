const
    _ = require('lodash'),
    path = require('path'),
    kefir = require('kefir'),
    express = require('express');



let app = express();
app.use(express.static('public'));
app.get('/logs', (req, res)=>{
    res.sendFile(path.join(__dirname, './data/deployment_changes.json'));
});
app.listen(8080);