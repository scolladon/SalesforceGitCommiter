var r = require("requirejs");
r.define(function() {
  //---
  // 
  Function.prototype.curry = function() {
    var self = this,
        args1 = Array.prototype.slice.call(arguments);
    return (function() { 
      var args2 = Array.prototype.slice.call(arguments);
      return (self.apply(this, args1.concat(args2)));
    });
  };
});