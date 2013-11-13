var r = require("requirejs");
r.define([{
        // A project example
        projectName : "MyProject", // project name (require)
        environment : [{
            environmentName : "", // sandbox purpose (dev, integ, staging, prerelease, release)
            username : "", // salesforce username to connect to the salesforce API for this environment
            password : "", // salesforce username to connect to the salesforce API for this environment
            interval : 10 /*in minute !!*/, // No less than 5 for concurrency execution purpose
            remotes : [{ // At least one remote
                name : "origin", // branch name (unique per project)
                url : "" // Remote url)
            },{ // Another remote
            }],
            metaEndpoint : "https://cs14.salesforce.com/services/Soap/u/28.0/" // EndPoint for the API it is the endpoint of the current environment (sandbox)
        }]
    },{
        // Another project
    }
]);