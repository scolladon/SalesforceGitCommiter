var r = require("requirejs");

r.config({
    nodeRequire: require
});

r(["./config.js", "winston", "coffee-script", "./node_modules/metaforce/lib/client", "node-zip", "Function/curry"], 
function(config, winston, cf, Metaforce, Zip){
 
    var MetaFetch = function(){
        this.client = new Metaforce();
        
        this.types = [{ 
                members: '*', 
                name: 'CustomLabel'
                }/*,{ 
                members: '*', 
                name: 'Translations'
                },{ 
                members: '*', 
                name: 'EmailTemplate'
                }*/];
        
        this.login(function(err){
            if(err) return winston.error("After login "+err,err.stack);
            this.fetch(function(err, zipFile){
                if(err) return winston.error(err,err.stack);
                this.zipFile = zipFile;
                console.log(zipFile.length);
                var zip = new Zip(zipFile, {base64: true, checkCRC32: true});
                console.dir(zip, zip.files);
                for(var f in zip.files) if(zip.files.hasOwnProperty(f)){
                    files.push(zip.files[f]);
                }
            }.bind(this))
        }.bind(this));
    };
    
    MetaFetch.prototype.login = function(cb){
        this.client.login({
            username: config.username,
            password: config.password,
            endpoint: config.metaEndpoint
        },cb);
    };
    
    MetaFetch.prototype.fetch = function(cb){
        var i = 0;
        var isOk = function(response){
            winston.info("retrieve id",response.result && response.result.id);
            this.client.checkRetrieveStatus({
                id: response.result.id
            }, function(error, response2, request) {
                winston.info("response from checkRetrieveStatus", response2);
                if(error) console.log(error);
                /*if(error.message === ""){
                    console.log("not done");
                    setTimeout(isOk,10*1000);
                    return;
                }
                
                if(error) {return winston.error(error,error.stack)};*/
                
                if(response2 && response2.result && response2.result.zipFile){
                    console.log("done");
                    console.log(response2.result.zipFile);
                    cb && cb(null, response2.result.zipFile);
                } else {
                    console.log("not done");
                    setTimeout(isOk.curry(response),10*1000);
                }
            });
        }.bind(this);
        

        
        var onRetrieve = function(err, response, request) {
            if(err) return winston.error(err,err.stack);
            // little trick here, we need to async this function to make checkRetrieveStatus works
            setTimeout(function(){ 
                isOk(response)
            }, 20000);
        };
        
        this.client.retrieve({
            unpackaged: {
                types: this.types
            }
        }, onRetrieve);
    };
    
    new MetaFetch();
    
    /* function(err, response, request) {
        if(err) return winston.error(err,err.stack);
        
        
        client.list({
            queries: [{
                type: 'CustomLabel'
                },{
                type: 'Translations'
                },{
                type: 'EmailTemplate'
                }],
                asOfVersion: '26.0'
        }, function(err, response, request) {
            if(err) return winston.error(err,err.stack);
            winston.info(response.result);
        });
    });*/
});
