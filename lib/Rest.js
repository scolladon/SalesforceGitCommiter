var r = require("requirejs");
r.define(["node-salesforce", "config.js", "winston", "Function/curry"], 
  function(sf, config, winston){
      
    var C = function(){
        
        this.conn = new sf.Connection({
        // you can change loginUrl to connect to sandbox or prerelease env.
            loginUrl : 'https://test.salesforce.com',
            maxRequest : 5
        });
        
        var _this = this; 
        
        this.loggedIn = false;
        this.records = [];
        this.readyCbs = [];
        this.authorsByAuthorId = {};

        winston.info("bf login");
        this.login(function(err){
            winston.info("after login");
            if (err) return console.log(err);
            _this.queryFiles(function(err){
                if (err) return console.log(err);
                winston.info("after queryFiles");
                _this.queryAuthors(function(err) {
                    if(err) return console.log(err);
                    winston.info("bf createStruct");
                    _this.fillAuthors(function(err) {
                       if(err) return console.log(err); 
                       winston.info("af createStruct");
                       _this.afterReady();
                    });
                });
            });
        });
       
        // To Do
        //this.conn.on("refresh", function(accessToken, res) {
          // Refresh event will be fired when renewed access token
          // to store it in your storage for next request
        //});
        
    };
    
    C.prototype.getAuthorById = function(authorId){
        if(this.authorsByAuthorId[authorId] !== null) {
            return (this.authorsByAuthorId[authorId].name + ' <' + this.authorsByAuthorId[authorId].email +'> (' + this.authorsByAuthorId[authorId].id+')');
        } else {
            winston.error("no author with this id");
            throw new Error("no author with this id");
        }
    }
    
    C.prototype.fillAuthors = function(cb) {
        for(var i = 0 ; i < this.records.length; i++){
            //console.log(i);
            this.records[i].author = this.getAuthorById(this.records[i].authorId);
        }
        cb();    
    };
    
    C.prototype.login = function(cb){
        if(this.loggedIn){ 
            return cb("already loggedIn");
        }
        
        var that = this;
        this.conn.login(config.username, config.password, function(err, userInfo) {
          if (err) { return cb(err)}
          //console.log("User ID: " + userInfo.id);
          //console.log("Org ID: " + userInfo.organizationId);

          that.loggedIn = true;
          cb(null);
        });
    };

     C.prototype.queryAuthors = function(cb){
        var _this = this;
        
        
        if(!this.loggedIn){
            return cb("not logged in");
        }

        var errors = [];
        
        _this.authorsByAuthorId = {};
        
        var cbRequestAuthor = function(err, result){
            
            //console.log("in cbRequestAuthor");
            if(err) return cb(err);
            
            result.records.map(function(r){
                _this.authorsByAuthorId[r.Id] = {id : r.Id, name : r.Name, email : r.Email};
            }.bind(_this));
            
            cb();
        };
        
        this.executeQuery("select id, name, email from user where id in ('" + this.authorIds.join("','") + "')", cbRequestAuthor.bind(this));
        
        
    };
    
    C.prototype.executeQuery = function(request, cb) {
        this.conn.query(request, cb);
    };
    
    C.prototype.queryFiles = function(cb){
        var _this = this;
        this.authorIds = [];
        
        if(!this.loggedIn){
            return cb("not logged in");
        }

        // TO DO
        //var modificationInterval = new Date();
        //modificationInterval.setMinutes((modificationInterval.getMinutes() - config.interval)%60);
        
        
        ["SELECT Body,Name,LastModifiedById from apexclass","SELECT Body,Name,LastModifiedById from apextrigger", "SELECT Markup,Name,LastModifiedById from apexpage"].mapAsync(function(value, index, cb2){
            //console.log("bf Query");
            this.executeQuery(value, function(err, result){
                //console.log("cb exec Query", result.records.length);
                if(err) return cb2(err);
                result.records.map(function(r){
                    //console.log("cb exec Query in loop");
                    r.authorId = r.LastModifiedById;
                    this.records.push(r);
                    this.authorIds.push(r.LastModifiedById);
                   //console.log("cb exec Query end loop");
                }.bind(this));
                
                //console.log("end cb exec query");
                
                cb2(null);
            }.bind(this));
        }.bind(this), { stepByStep : true }, cb);
            

    };
    
    C.prototype.forEachFile = function(cbOne, cbAll){
        console.log(this.records.length);
        this.records.mapAsync(cbOne, cbAll);
    };
    
    C.prototype.onReady = function(fn){
        this.readyCbs.push(fn);
    };
    
    C.prototype.afterReady = function(){
        this.readyCbs.forEach(function(f){
            f();
        });
        this.readyCbs = [];
    };
    
    return C;
});