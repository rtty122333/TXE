var cheerio = require("cheerio");

module.exports = Extractor;

function Extractor() {
}

Extractor.setStat = function(div, weibo) {
    var $ = cheerio.load(div);
    $('a').each(function(i, e) {
        var text = $(e).text();
        if (text.match('赞') !== null)
            weibo.like = text.slice(2, -1);
        else if (text.match('转发') !== null)
            weibo.forward = text.slice(3, -1);
        else if (text.match('评论') !== null)
            weibo.comment = text.slice(3, -1);
    });
}

Extractor.setPoster = function(div, weibo) {
    var $ = cheerio.load(div);
    var posterObj = $('a[class=nk]');
    weibo.poster = posterObj.text();
    weibo.posterURL = posterObj.attr('href');
}

Extractor.setForwardInfo = function(div, weibo) {
    var $ = cheerio.load(div);
    $('span[class=cmt]').each(function(i, e) {
        var text = $(e).text();
        if (text.match('转发理由')) {
            weibo.forwardReason = e.next.data;
        } else if (text.match('赞'))
            weibo.originalLike = text.slice(2, -1);
        else if (text.match('原文转发') !== null)
            weibo.originalForward = text.slice(5, -1);
        else { // 转发自
            var originalPosterObj = $('a', e);
            weibo.originalPoster = originalPosterObj.text();
            weibo.originalPosterURL = originalPosterObj.attr('href');
        }
    });
    $('a[class=cc]').each(function(i, e) {
        var text = $(e).text();
        if (text.match('原文评论'))
            weibo.originalComment = text.slice(5, -1);
    });
}

Extractor.setContent = function(div, weibo) {
    var $ = cheerio.load(div);
    var contentObj = $('span[class=ctt]');
    weibo.content = '';
    contentObj.contents().each(function(i, e) {
        var text = $(e).text();
        weibo.content += text;
    });
    if (weibo.content[0] === ':') weibo.content = weibo.content.slice(1);
}

Extractor.extractEntry = function(div) {
    var $ = cheerio.load(div);
    var weibo = {};

    Extractor.setPoster(div, weibo);
    Extractor.setContent(div, weibo);
    Extractor.setStat(div, weibo);
    Extractor.setForwardInfo(div, weibo);

    return weibo;
}

Extractor.extract = function(mainbody) {
    var self = this;
    var $ = cheerio.load(mainbody);
    $('div[class=c][id]').each(function(i, e) {
        var weibo = Extractor.extractEntry(e);
        console.log(weibo);
    });
}

