var request = require("request").defaults({
  jar: true
});
var cheerio = require("cheerio");
var json4line = require('../utils/json4line.js');

/**
 * 处理微博登录。
 * @class
 */
function login() {
  /** 包含登录 POST 所需要的参数。
   * @member {Object} */
  this.formData = {
    'submit': '登录',
    'remember': 'on'
  };

  /** 需要从登录页面中读取的参数名。这些参数之后将加入 [formData]{@link login#formData} 中。
   * @member {Array} */
  this.required_fields = [
    'backURL',
    'backTitle',
    'tryCount',
    'vk'
  ];

  /** 登录页面中密码框的名称（每次登录不同）。
   * @member {String} */
  this.passInputName = null;

  this.posturl = null;
  this.jumpurl = null;
  this.mainbody = null;

  /** 用户名。
   * @member {String} */
  this.mobile = null;

  /** 登录密码。
   * @member {String} */
  this.password = null;
}

login.prototype.initAccount = function() {
  var self = this;
  json4line.readJSONFile('./account/account.json', function(err, file) {
    if (err) return console.log(err);
    self.mobile = file.mobile;
    self.password = file.passwd;
    self.initPage();
  });
}

login.prototype.initPage = function() {
  var self = this;
  request('http://login.weibo.cn/login/?ns=1&revalid=2' +
    '&backURL=http%3A%2F%2Fweibo.cn%2F&backTitle=%CE%A2%B2%A9&vt=',
    function(error, response, body) {

      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(body);

        self.posturl = 'http://login.weibo.cn/login/' + $('form').attr('action');

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

        //self.echo();
        self.loginSina();
      } else {
        console.log("request failed, status code: " + response.statusCode);
      }
    });
}

login.prototype.loginSina = function() {
  var self = this;

  request.post({
    url: self.posturl,
    formData: self.formData
  }, function optionalCallback(err, httpResponse, body) {
    if (err) {
      return console.error('upload failed:', err);
    }
    if (httpResponse.headers.location != undefined) {
      self.jumpurl = httpResponse.headers.location;
      console.log("jump first:" + self.jumpurl);
      request.get(self.jumpurl, function(error, response, body) {
        if (!error) {
          //console.log(response.statusCode);
          self.mainbody = response.body;
          //console.log(self.mainbody);
          self.firstPage();
        }else{
          console.log(error);
        }
      });
    }else{
      console.log("Todo: take off the picture verification");
      //console.log(httpResponse);
    }
  });
}

login.prototype.getRequest = function(){
  var self = this;
  if (self.mainbody == null) {
    console.log("Please login first");
    return;
  }else{
    return request;
  }
}

login.prototype.firstPage = function() {
  var self = this;
  var msg = null;
  var $ = cheerio.load(self.mainbody);
  $('div[class=c]').each(function(i, e) {
    if ($(e).attr('id')) {
      //console.log(e.children[0].children[0].children[0].data);
      switch (e.children.length) {
        case 1: //origin create with no pic
          if (e.children[0].children[0].attribs.class == "nk") {
            msg = e.children[0].children[0].children[0].data;
          };
          e.children[0].children.forEach(function(m) {
            if (m.name == "span" && m.attribs.class == "ctt") {
              m.children.forEach(function(n) {
                if (n.data !== undefined) {
                  msg += n.data;
                };
                if (n.name == 'a') {
                  msg += n.children[0].data;
                };
              });
            };
            if (m.name == "a" && m.attribs.class !== "nk") {
              msg += m.children[0].data;
            };
            if (m.name == "span" && m.attribs.class == "ct") {
              msg += m.children[0].data;
            };
          });
          //To Do : replace this with save msg function.
          console.log(msg);
          break;

        case 2: //origin create with pic &&  foword with no pic
          if (e.children[0].children[0].attribs.class == "nk") {
            msg = e.children[0].children[0].children[0].data;
          };
          //deal with the first div
          e.children[0].children.forEach(function(m) {
            if (m.name == "span" && m.attribs.class == "cmt") {
              if (m.children.length > 1) {
                msg += m.children[0].data;
                msg += m.children[1].children[0].data;
                msg += m.children[m.children.length - 1].data;
              } else {
                msg += m.children[0].data;
              }
            };
            if (m.name == "span" && m.attribs.class == "ctt") {
              m.children.forEach(function(n) {
                if (n.data !== undefined) {
                  msg += n.data;
                };
                if (n.name == 'a') {
                  msg += n.children[0].data;
                };
              });
            };
            if (m.name == "a" && m.attribs.class !== "nk") {
              msg += ' ';
              msg += m.children[0].data;
            };
          });
          //deal with the second div
          if (e.children[1].children[0].name == "span" && e.children[1].children[0].attribs.class == "cmt") { //foword
            e.children[1].children.forEach(function(m) {
              if (m.name == "span" && m.attribs.class == "cmt") {
                if (m.children.length > 1) {
                  msg += m.children[0].data;
                  msg += m.children[1].children[0].data;
                  msg += m.children[m.children.length - 1].data;
                } else {
                  msg += m.children[0].data;
                }
              };
              if (m.name == "a") {
                msg += m.children[0].data;
              };
              if (m.name == "span" && m.attribs.class == "ct") {
                m.children.forEach(function(n) {
                  if (n.name == "a") {
                    msg += n.children[0].data;
                  } else {
                    msg += n.data;
                  }
                });
              };
              if (m.name == "span" && m.attribs.class == "cmt" && m.children[0].data == "转发理由:") {
                msg += m.next.data;
              };
            });
          } else { //origin sent
            e.children[1].children.forEach(function(m) {
              if (m.children !== undefined) {
                if (m.children[0].name == "img") {
                  //To Do ...  deal with img
                } else {
                  msg += ' ';
                  msg += m.children[0].data;
                }
              };
            });
          }
          //To Do : replace this with save msg function.
          console.log(msg);
          break;

        case 3: //forward with pic
          if (e.children[0].children[0].attribs.class == "nk") {
            msg = e.children[0].children[0].children[0].data;
          };
          //deal with the first div
          e.children[0].children.forEach(function(m) {
            if (m.name == "span" && m.attribs.class == "cmt") {
              if (m.children.length > 1) {
                msg += m.children[0].data;
                msg += m.children[1].children[0].data;
                msg += m.children[m.children.length - 1].data;
              } else {
                msg += m.children[0].data;
              }
            };
            if (m.name == "span" && m.attribs.class == "ctt") {
              m.children.forEach(function(n) {
                if (n.data !== undefined) {
                  msg += n.data;
                };
                if (n.name == 'a') {
                  msg += n.children[0].data;
                };
              });
            };
            if (m.name == "a" && m.attribs.class !== "nk") {
              msg += ' ';
              msg += m.children[0].data;
            };
          });
          //deal with the second div
          e.children[1].children.forEach(function(m) {
            if (m.children !== undefined) {
              if (m.children[0].name == "img") {
                //To Do ...  deal with img
              } else {
                msg += ' ';
                msg += m.children[0].data;
              }
            };
          });
          //deal with the third div
          if (e.children[2].children[0].name == "span" && e.children[2].children[0].attribs.class == "cmt") { //foword
            e.children[2].children.forEach(function(m) {
              if (m.name == "span" && m.attribs.class == "cmt") {
                if (m.children.length > 1) {
                  msg += m.children[0].data;
                  msg += m.children[2].children[0].data;
                  msg += m.children[m.children.length - 1].data;
                } else {
                  msg += m.children[0].data;
                }
              };
              if (m.name == "a") {
                msg += m.children[0].data;
              };
              if (m.name == "span" && m.attribs.class == "ct") {
                m.children.forEach(function(n) {
                  if (n.name == "a") {
                    msg += n.children[0].data;
                  } else {
                    msg += n.data;
                  }
                });
              };
              if (m.name == "span" && m.attribs.class == "cmt" && m.children[0].data == "转发理由:") {
                msg += m.next.data;
              };
            });
          }
          // TODO: replace this with save msg function.
          console.log(msg);

          break;
        default:
          ;
      }
    };
  });
}

login.prototype.echo = function() {
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
