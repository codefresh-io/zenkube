const
    _ = require('lodash'),
    path = require('path'),
    kefir = require('kefir'),
    express = require('express');



let app = express();
app.use(express.static('public'));
app.get('/log', (req, res)=>{
    res.sendFile(path.join(__dirname, './data/dump.jsonl'));
});
app.listen(8080);