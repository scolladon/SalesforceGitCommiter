var r = require("requirejs");
r.define(["Git.js", "Rest.js", "fs", "config.js", "utils/objMapAsync", "winston"], 
function(Git, Rest, fs, config, objMapAsync, winston){
    var job = function(jobCb){
        winston.info("start Job");
        
        var rest = new Rest({
            cbErr : function(err){
                jobCb(err);
            }
        });
            
        var git = new Git();
        
        var byAuthor = {};
        
        var eachFile = function(file, i, cb){
            //console.log("eachFile", i, file);
            var filename = (file.Name || file.name),
                body = file.Body || file.Markup || file.data;
            
            byAuthor[file.author] || (byAuthor[file.author] = []);
            
            byAuthor[file.author].push(filename);
            
            
            fs.writeFile('../'+config.repo + '/' +filename, body, function(err){
                if(err) return cb(err);
                cb(null, filename);
            });
        };
        
        var filesEnd = function(err, filenames){
            winston.info("filesEnd");
            if(err) return jobCb(err);
            
            var gitEnd = function(err, diffs){
                //console.dir(err);
                if(err) return jobCb("ERROR : " + err +' ' + err.stack);
                winston.info("filesEnd gitEnd");
                git.pushToRemote(jobCb);
            };
            
            var eachAuthor = function(filenames, author, cb){
                winston.info("filesEnd eachAuthor "+author);
                git.insertAuthorInRepo({ author : author, filenames : filenames}, cb);
            };   
            
            //winston.info("filesEnd before mapAsync", byAuthor);
            objMapAsync(byAuthor, eachAuthor, { stepByStep : true }, gitEnd);
            
            //console.log("after");

        };
        
        winston.info("define onReady");
        rest.onReady(function(){
            winston.info("onReady");
            rest.forEachFile(eachFile, filesEnd);
        });
    };
    
    return job;
   
});
    
    