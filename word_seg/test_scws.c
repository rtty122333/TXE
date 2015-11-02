#include <iostream>
#include <string>
#include <scws/scws.h>

int main()
{
    scws_t s;
    scws_res_t res, cur;
    std::string text("Hello, 我名字叫李那曲是一个中国人, 我有时买Q币来玩, 我还听说过C#语言");

    if (!(s = scws_new())) {
        std::cerr << "ERROR: can't init the scws!" << std::endl;
        return -1;
    }
    scws_set_charset(s, "utf8");
    scws_set_dict(s, "/usr/local/etc/dict.utf8.xdb", SCWS_XDICT_MEM | SCWS_XDICT_XDB);
    scws_set_rule(s, "/usr/local/etc/rules.utf8.ini");
    scws_set_ignore(s, 1);

    scws_send_text(s, text.c_str(), text.size());
    while (res = cur = scws_get_result(s)) {
        while (cur != NULL) {
            std::cout << "WORD: " << text.substr(cur->off, cur->len) << ", IDF: " <<  cur->idf << std::endl;
            cur = cur->next;
        }
        scws_free_result(res);
    }
    scws_free(s);

    return 0;
}
