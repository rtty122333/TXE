var request = require("request").defaults({
    jar: true
});
var cheerio = require("cheerio");

module.exports = User;

function User(username, password) {
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
    this.mobile = username;

    /** 登录密码。
     * @member {String} */
    this.password = password;

    this.loginPostURL = null;
}

// 静态属性
User.loginPageURL = 'http://login.weibo.cn/login/?ns=1&revalid=2&backURL=http%3A%2F%2Fweibo.cn%2F&backTitle=%CE%A2%B2%A9&vt=';
User.loginPostURLPrefix = 'http://login.weibo.cn/login/';

User.prototype.getLoginPostData = function(callback) {
    var self = this;

    request(User.loginPageURL, function makePostData(err, response, body) {
        if (!err && response.statusCode == 200) {
            var $ = cheerio.load(body);
            self.loginPostURL = User.loginPostURLPrefix + $('form').attr('action');

            $('input[type=hidden]').each(function(index, entry) {
                var name = $(entry).attr('name');
                var value = $(entry).attr('value');
                if (self.required_fields.indexOf(name) > 0) {
                    self.formData[name] = value;
                }
            });

            self.passInputName = $('input[type=password]').attr('name');
            self.formData[self.passInputName] = self.password;

            self.formData['mobile'] = self.mobile;

            callback();
        } else {
            console.log("request failed, status code: " + response.statusCode);
        }
    });
}

User.prototype.sendPostData = function(homepageProcessor) {
    var self = this;

    request.post({
        url: self.loginPostURL,
        formData: self.formData
    }, function handlePostResponse(err, httpResponse, body) {
        if (err) {
            return console.error('post failed:', err);
        }
        if (httpResponse.headers.location != undefined) {
            self.jumpurl = httpResponse.headers.location;
            //console.log("jump first:" + self.jumpurl);
            request.get(self.jumpurl, function(error, response, body) {
                if (!error) {
                    //console.log(response.statusCode);
                    self.mainbody = response.body;
                    //console.log(self.mainbody);
                    homepageProcessor(self.mainbody);
                }else{
                    console.log(error);
                }
            });
        } else {
            console.log("TODO: take off the picture verification");
            //console.log(httpResponse);
        }
    });
}

User.prototype.login = function(homepageProcessor) {
    var self = this;
    self.getLoginPostData(function() {
        self.sendPostData(homepageProcessor);
    });
}
