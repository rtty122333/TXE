var request = require("request").defaults({jar: true});
var cheerio = require("cheerio");
var json4line = require('../utils/json4line.js');

function login(){
  /**
   * holds parameters to be posted
   * @member {Object}
   */
  this.formData = {
    'submit' : '登录',
    'remember' : 'on'
  };

  /**
   * parameters needed to be read from the request response
   * @member {Array}
   */
  this.required_fields = [
    'backURL',
    'backTitle',
    'tryCount',
    'vk'
  ];

  /**
   * the password input name that varies in every login
   * @member {String}
   */
  this.passInputName = null;

  this.posturl   = null;
  this.jumpurl   = null;
  this.mainbody  = null;
  // read from config file
  this.mobile    = null;
  this.password  = null;
}

login.prototype.initAccount = function(){
  var self = this;
  json4line.readJSONFile('./account/account.json', function(err, file) {
    if (err) return console.log(err);
    self.mobile = file.mobile;
    self.password = file.passwd;
    self.initPage();
  });
}

login.prototype.initPage = function(){
  var self = this;
  request('http://login.weibo.cn/login/?ns=1&revalid=2' +
          '&backURL=http%3A%2F%2Fweibo.cn%2F&backTitle=%CE%A2%B2%A9&vt=',
          function(error, response, body) {

  if (!error && response.statusCode == 200) {
    var $ = cheerio.load(body);

    self.posturl='http://login.weibo.cn/login/'+$('form').attr('action');

    $('input[type=hidden]').each(function(i, e) {
      var name = $(e).attr('name');
      var value = $(e).attr('value');
      if (self.required_fields.indexOf(name) > 0) {
        self.formData[name] = value;
      }
    });

    self.passInputName = $('input[type=password]').attr('name');
    self.formData[self.passInputName] = self.password;

    self.formData['mobile'] = self.mobile;

    self.echo();
    self.loginSina();
  } else {
    console.log("request failed, status code: " + response.statusCode);
  }
});
}

login.prototype.loginSina = function(){
  var self = this;

  request.post({ url:self.posturl, formData: self.formData }, function optionalCallback(err, httpResponse, body) {
    if (err) {
      return console.error('upload failed:', err);
    }
    console.log(httpResponse.leaders);
    if (httpResponse.headers.location != undefined) {
      self.jumpurl = httpResponse.headers.location;
      console.log("jump first:" + self.jumpurl);
      request.get(self.jumpurl, function(error, response, body){
        if (!error) {
          console.log(response.statusCode);
          self.mainbody = response.body;
          console.log(self.mainbody);
          self.firstPage();
        }
      });
    }
  });
}

login.prototype.firstPage = function(){
  var self=this;
  var $=cheerio.load(self.mainbody);
  $('div[class=c]').each(function(i,e) {
    if ($(e).attr('id')) {
      console.log(e.children[0].children[0].children[0].data);
    };
  });
}

login.prototype.echo = function(){
  console.log(this.formData);
  console.log(this.passInputName);
  console.log(this.posturl);
}

var loginInst = null;

exports.initLogin = function() {
  if (loginInst == null) {
    loginInst = new login();
  }
  return loginInst;
}
