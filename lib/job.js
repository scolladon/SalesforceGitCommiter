var r = require("requirejs");
r.define(["lib/Git.js", "lib/Rest.js", "fs", "config.js"], 
function(Git, Rest, fs, config){
    var job = function(jobCb){
        
        var rest = new Rest({
            cbErr : function(err){
                jobCb(err);
            }
        });
            
        var git = new Git();
        
        var byAuthor = {};
        
        var eachFile = function(file, i, cb){
            var filename = (file.Name || file.name),
                body = file.Body || file.Markup || file.data;
            
            byAuthor[file.author] || (byAuthor[file.author] = []);
            
            byAuthor[file.author].push(filename);
            
            
            fs.writeFile(config.repo + '/' +filename, body, function(err){
                if(err) return cb(err);
                cb(null, filename);
            });
        };
        
        var filesEnd = function(err, filenames){
            if(err) return jobCb(err);
            
            var gitEnd = function(err, diffs){
                if(err) return jobCb("ERROR : " + err +' ' + err.stack);
                git.pushToRemote(jobCb);
            };
            
            var eachAuthor = function(filenames, author, cb){
                git.insertAuthorInRepo({ author : author, filenames : filenames}, cb);
            };   
            
            //objMapAsync(byAuthor, eachAuthor, { stepByStep : true }, gitEnd);
        };
        
        rest.onReady(function(){
            rest.forEachFile(eachFile, filesEnd);
        });
    };
    
    return job;
   
});
    
    