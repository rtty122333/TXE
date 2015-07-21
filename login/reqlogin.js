var request = require("request");
var cheerio = require("cheerio");

function login(){
  this.backURL=null;
  this.backTitle=null;
  this.tryCount=null;
  this.vk=null;
  this.passwd=null; 
}

login.prototype.initPage = function(){
  var local=this;
  request('http://login.weibo.cn/login/?ns=1&revalid=2&backURL=http%3A%2F%2Fweibo.cn%2F&backTitle=%CE%A2%B2%A9&vt=', function(error, response, body) {
  if (!error && response.statusCode == 200) {
    var $ = cheerio.load(body);
    $('input[type=hidden]').each(function(i,e) {
      if ($(e).attr('name')=='backURL') {
        //console.log($(e).attr('value'));
        local.backURL=$(e).attr('value');
      }else if ($(e).attr('name')=='backTitle') {
        local.backTitle=$(e).attr('value');
      }else if ($(e).attr('name')=='tryCount') {
        local.tryCount=$(e).attr('value');
      }else if ($(e).attr('name')=='vk') {
        local.vk=$(e).attr('value');
      };
    });
    local.passwd=$('input[type=password]').attr('name');
    local.echo();
  }
});
}

login.prototype.echo = function(){
  console.log(this.backURL);
  console.log(this.backTitle);
  console.log(this.tryCount);
  console.log(this.vk);
  console.log(this.passwd);
}

var loginInst=null;

exports.initLogin=function(){
  if (loginInst==null) {
    loginInst = new login();
  }
  return loginInst;
}