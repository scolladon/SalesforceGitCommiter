var r = require("requirejs");

r.config({
    nodeRequire: require
});

r(["lib/job.js", "winston"], 
function(job){

    job(function(err) { 
        if(err) return console.error(err,err); 
        return console.log("end launchJob.js");
    });
});