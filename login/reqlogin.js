var request = require("request").defaults({jar: true});
var cheerio = require("cheerio");
var json4line = require('../utils/json4line.js');

function login(){
  this.backURL=null;
  this.backTitle=null;
  this.tryCount=null;
  this.vk=null;
  this.passwd=null; 
  this.posturl=null;
  this.jumpurl=null;
  this.mainbody=null;
  this.mobile=null;
  this.password=null;
}

login.prototype.initAccount = function(){
  var self=this;
  json4line.readJSONFile('./account/account.json', function(err, file) {
  if(err) return console.log(err);
  self.mobile = file.mobile;
  self.password = file.passwd;
  self.initPage();
});
}

login.prototype.initPage = function(){
  var self=this;
  request('http://login.weibo.cn/login/?ns=1&revalid=2&backURL=http%3A%2F%2Fweibo.cn%2F&backTitle=%CE%A2%B2%A9&vt=', function(error, response, body) {
  if (!error && response.statusCode == 200) {
    var $ = cheerio.load(body);
    self.posturl='http://login.weibo.cn/login/'+$('form').attr('action');
    $('input[type=hidden]').each(function(i,e) {
      if ($(e).attr('name')=='backURL') {
        self.backURL=$(e).attr('value');
      }else if ($(e).attr('name')=='backTitle') {
        self.backTitle=$(e).attr('value');
      }else if ($(e).attr('name')=='tryCount') {
        self.tryCount=$(e).attr('value');
      }else if ($(e).attr('name')=='vk') {
        self.vk=$(e).attr('value');
      };
    });
    self.passwd=$('input[type=password]').attr('name');
    self.echo();
    self.loginSina();
  }
});
}

login.prototype.loginSina = function(){
  var self=this;
  var formdata={
    
  }
  formdata['mobile'] = self.mobile;
  formdata[self.passwd] = self.password;
  formdata['remember'] = 'on';
  formdata['backURL'] = self.backURL;
  formdata['backTitle'] = self.backTitle;
  formdata['tryCount'] = self.tryCount;
  formdata['vk'] = self.vk;
  formdata['submit'] = '登录';
  console.log(formdata);
  request.post({url:self.posturl, formData: formdata}, function optionalCallback(err, httpResponse, body) {
  if (err) {
    return console.error('upload failed:', err);
  }
  if (httpResponse.headers.location != undefined) {
    self.jumpurl=httpResponse.headers.location;
    console.log("jump first:"+self.jumpurl);
    request.get(self.jumpurl,function(error,response,body){
      if (!error) {
        //console.log(response.statusCode);
        self.mainbody = response.body;
        //console.log(self.mainbody);
        self.firstPage();
      };
    });  
  };
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
  console.log(this.backURL);
  console.log(this.backTitle);
  console.log(this.tryCount);
  console.log(this.vk);
  console.log(this.passwd);
  console.log(this.posturl);
}

var loginInst=null;

exports.initLogin=function(){
  if (loginInst==null) {
    loginInst = new login();
  }
  return loginInst;
}