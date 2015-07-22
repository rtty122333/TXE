var request = require("request");
var cheerio = require("cheerio");

function login(){
  this.backURL=null;
  this.backTitle=null;
  this.tryCount=null;
  this.vk=null;
  this.passwd=null; 
  this.posturl=null;
  this.jumpurl1=null;
  this.jumpurl2=null;
  this.jumpurl3=null;
}

login.prototype.initPage = function(){
  var self=this;
  request('http://login.weibo.cn/login/?ns=1&revalid=2&backURL=http%3A%2F%2Fweibo.cn%2F&backTitle=%CE%A2%B2%A9&vt=', function(error, response, body) {
  if (!error && response.statusCode == 200) {
    var $ = cheerio.load(body);
    self.posturl='http://login.weibo.cn/login/'+$('form').attr('action');
    $('input[type=hidden]').each(function(i,e) {
      if ($(e).attr('name')=='backURL') {
        //console.log($(e).attr('value'));
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
    mobile: ''
  }
  formdata[self.passwd] = '';
  formdata['remember'] = 'on';
  formdata['backURL'] = self.backURL;
  formdata['backTitle'] = self.backTitle;
  formdata['tryCount'] = self.tryCount;
  formdata['vk'] = self.vk;
  formdata['submit'] = '登录';
  //console.log(formdata);
  request.post({url:self.posturl, formData: formdata}, function optionalCallback(err, httpResponse, body) {
  if (err) {
    return console.error('upload failed:', err);
  }
  if (httpResponse.headers.location != undefined) {
    self.jumpurl1=httpResponse.headers.location;
    console.log("jump first:"+self.jumpurl1);
    request.get(self.jumpurl1,function(error,response,body){
      if (!error) {
        console.log(response.statusCode);
        self.jumpurl2 = response.headers;
        console.log(self.jumpurl2);
      };
    });
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