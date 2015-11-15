var json4line = require('./utils/json4line.js');
var User = require('./user/user.js');
var Extractor = require('./extractor/extractor.js');

var user = null;

json4line.readJSONFile('account/account.json', function(err, file) {
    if (err) return console.log(err);
    user = new User(file.mobile, file.passwd);
    user.login(Extractor.extract);
});



