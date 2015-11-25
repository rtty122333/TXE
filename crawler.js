var mysql = require('mysql');
var dbconn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: ''
});

function Crawler() {
}

Crawler.targetList = new TargetList();

