var Dict = require("collections/dict");
var mysql = require('mysql');
var dbconn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: ''
});

/* 爬取目标列表类。已访问的保存在 oldList 中，写入数据库。
 * 待访问的保存在 newList 中。 */
function TargetList() {
    this.newList = new Dict();
    this.oldList = new Dict();
    this.oldList.getDefault = function(key) {
        return 0;
    }
    this.load();
}

TargetList.prototype.generateURL(username) {
    return 'http://' + username; // TODO
}

/** 从数据库中读取已访问的用户，保存在 oldList 中。*/
TargetList.prototype.load = function() {
    var self = this;
    dbconn.query('SELECT user, ref FROM txe.targets', function(err, rows) {
        if (err) {
            console.error('error connecting DB: ' + err.stack);
            return;
        }
        rows.each(function(i, e) {
            self.oldList.add(e.user, e.ref);
        });
    });
}

/* 向待访问列表中插入项目。如果用户已访问过，则不做任何操作。
 * @param username 待访问的用户名 */
TargetList.prototype.insert = function(username) {
    var self = this;
    if (!self.oldList.has(username)) {
        self.newList.set(username, self.newList.get(username)+1);
    }
}

/** 处理所有待访问的用户页面。
 *  @param extract 从用户页面中提取微博的回调函数
 *  @param getFriends 返回用户的朋友名称列表的回调函数
 */
TargetList.prototype.update = function(extract, getFriends) {
    var self = this;
    self.newList.forEach(function(ref, username, dict) {
        // move from new to old
        self.store(username, ref);

        extract(generateURL(username));

        friends = getFriends(username);
        friends.each(function(i, e) {
            if (self.oldList.has(e))
                self.incl(e);
            else
                self.insert(e);
        });
        self.newList.delete(username);
    });
}

TargetList.prototype.store = function(username, ref) {
    var self = this;
    self.oldList.set(username, ref);
    dbconn.query('INSERT INTO targets (user, ref) values (?, ?) ON DUPLICATE KEY UPDATE ref=VALUES(ref)', [username, ref], function(err, result) {
        if (err) {
            console.error('insert target error: ' err.stack);
        }
    });
}

TargetList.prototype.incl = function(username) {
    oldList.set(username, oldList.get(username)+1);
    dbconn.query('UPDATE targets SET ref=? WHERE user=?', [oldList.get(username), username], function(err, result) {
        if (err) {
            console.error('insert target error: ' err.stack);
        }
    });
}
