var flowctl = require('../flowctl.js');

flowctl.series([
  {
    fn: function(pera_, cbb_) {
      flowctl.series1(['1', '2', '3', '4'], function(pera_, cb_) {
        setTimeout(function() {
          console.log(pera_);
          cb_(null, pera_);
        }, 2000);
      }, function(err_, ret_) {
        if(err_) return cbb_(err_);
        console.log(ret_);
        cbb_(null, ret_);
      });
    }
  },
  {
    fn: function(pera_, cbb_) {
      flowctl.parallel1(['5', '6', '7', '8'], function(pera_, cb_) {
        setTimeout(function() {
          console.log(pera_);
          cb_(null, pera_);
        }, 2000);
      }, function(err_, ret_) {
        if(err_) return cbb_(err_);
        console.log(ret_);
        cbb_(null, ret_);
      });
    }
  }
], function(err_, rets_) {
  if(err_) return console.log(err_);
  console.log(rets_);
});

