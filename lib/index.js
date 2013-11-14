var r = require("requirejs");

r.config({
    nodeRequire: require
});

r(["lib/job.js", "winston"], 
function(job, winston){
    
    winston.add(winston.transports.File, { filename: 'cron.log', handleExceptions: true });

    winston.info("start index.js.");
    job(function(err) { 
        if(err) return winston.error(err,err); 
        return winston.info("end index.js")
    });
});