var json4line = require('../json4line.js');

json4line.readJSONFile(__dirname + '/../package.json', function(err, file) {
  if(err) return console.log(e);
  console.log('readJsonFile:', file);
});

var LineReader = json4line.LineReader,
    lr = new LineReader(__dirname + '/../package.json');

lr.on('lines', function(lines) {
  console.log('LineReader:', lines);
}).on('end', function() {
  // TODO: do sth
}).on('error', function(e) {
  // TODO: do sth
});

