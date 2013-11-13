

var r = require("requirejs");

r.config({
    nodeRequire: require
});

r(["cron", "./config.js", "./job.js", "winston"],
function(cron, config, job, winston){
    var cronJob = cron.CronJob;

    winston.add(winston.transports.File, { filename: 'cron.log', handleExceptions: true });

    winston.info("start cron.");
    
    new cronJob('*/'+config.interval+' * * * *', 
        function(cb){
            winston.info('Begin of job');
            job(cb);
        }, 
        function (err) {
            if(err) winston.error(err, err);
            winston.info('End of job');
        }, 
        true /* Start the job right now */,
        'Europe/Paris' /* Time zone of this job. */
    );
});