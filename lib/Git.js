var r = require("requirejs");
r.define(["gift", "config.js", "winston"],
function(gift, config, winston){
    
    //
    // Disclaimer : Over-privated version of Git.js
    //
      
    var g = gift(/*'../'+*/config.repo)
    
        // call in Git instance scope
      , _commitAuthor = function(options, cb){
            winston.info("commitAuthor");
            var _this = this;
            // Status            
            g.status(function(err, status){
                if(err) return cb("Status "+err);
                if(!status.clean) {
                    var filesToCommit = [];
                    //console.log(status.files, options.filenames);
                    for(var aFile in status.files) if(status.files.hasOwnProperty(aFile)) {
                        if(options.filenames.indexOf(aFile) !== -1) {
                            filesToCommit.push(aFile);
                        }
                    }
                    
                    // Add
                    //winston.info(filesToCommit, options.author, status.files, options.filenames);
                    if(filesToCommit.length == 0){
                        return cb(null);
                    }
                    g.add(filesToCommit, function(err){
                        // Commit
                        var msg = options.author+" "+filesToCommit.join(' ')
                        winston.info("Commit : "+msg);
                         g.commit(msg, { author : "'"+options.author+"'" }, function(err){
                            err && console.log(err, err.stack);
                            if(err) return cb("Commit "+err);
                            cb();
                        }.bind(_this));
                    }.bind(_this));    
                } else {
                  cb();  
                }
            }.bind(this));
        };
    
    // Empty constructor, not a problem
    var C = function(){};
    
    //  options are :
    //    {
    //      msg : "msg for commit",
    //      files : [filenames] or "."
    //    }
    //
    
    C.prototype.insertAuthorInRepo = function(options, cb) {
        //console.log(options);
        var _this = this;
        _commitAuthor.call(this, options, function(err){
            if(err) return cb(err);
            return cb();
        }.bind(this));
    };
    
    C.prototype.pushToRemote = function(cb) {
        g.remote_push(config.remoteName,cb);  
    };

    
    return C;
});