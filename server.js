const
    _ = require('lodash'),
    path = require('path'),
    kefir = require('kefir'),
    express = require('express');

let app = express();

app.get('/log', (req, res)=>{
    res.sendFile(path.join(__dirname, './data/dump.jsonl'));
});
app.use(express.static('public'));
app.use('/', (req, res)=>{
    res.sendFile(path.join(__dirname, './flat_list.html'));
});
app.listen(8080);