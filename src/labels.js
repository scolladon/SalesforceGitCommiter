var rjs = require("requirejs");

rjs(["child_process", "fs", "xml2js", "utils/objMapAsync"], function(child, fs, xml2js){
    var parse = xml2js.parseString,
        xmlLbls = fs.readFileSync("./output/CustomLabels.labels"),
        labels = JSON.parse(fs.readFileSync("./output/labels.json", "utf8")).labels,
        xmlTranslations = fs.readFileSync("./output/fr.translation");
    
    var o = {};
    
    var findLabel = function(label, i, cb){
        //console.log(label);
        var reg = 'Label.'+label+'\\W',
            cmdline = 'grep -lr \"'+reg+'\" files';
        
        child.exec(cmdline, function (error, stdout, stderr) {
            if (error){
                //console.log(error);
                //console.log(label, cmdline);
                cb();
                return;
            }
    
            o[label].pages = stdout.trim().split("\n");
            cb();
        }); 
    };
    
    parse(xmlLbls, function (err, result) {
        var lbls = result.CustomLabels.labels;
        
        for(var i = 0 ; i < lbls.length; i++){
            if(labels.indexOf(lbls[i].fullName[0]) !== -1){
                o[lbls[i].fullName[0]] = {
                    "categories" : lbls[i].categories && lbls[i].categories[0],
                    "language" : lbls[i].language && lbls[i].language[0],
                    "description" : lbls[i].shortDescription && lbls[i].shortDescription[0],
                    "value" :  lbls[i].value && lbls[i].value[0],
                };
            }
        }
        parse(xmlTranslations, function (err, result) {
            var trs = result.Translations.customLabels;
            
            for(var i = 0 ; i < trs.length; i++){
                if(o[trs[i].name[0]]){
                    o[trs[i].name[0]].french = trs[i].label[0]
                }
            }
            
            labels.mapAsync(findLabel, function(err, res){
                console.log("end bf");
                if(err) return console.log(err);
                console.log("end af");
                fs.writeFileSync("output/labelsFiles.json", JSON.stringify(o, null, 4)); 
            });
            
        });
        
    });
    //
    // var s = "";
    /*
    var labels = JSON.parse(fs.readFile("./output/labelsFiles.json"));
    for(var k in labels) if(labels.hasOwnProperty(k)){ 
      s+= '"'+[
          k,
          labels[k].value,
          labels[k].french,
          "",
          labels[k].pages ? labels[k].pages.join(",") : "" ,
          labels[k].description, 
          "", 
          labels[k].categories
      ].join('";"')+'"\n'
    }
    
    fs.writeFileSync("./output/labelsFiles.csv", s);
    
    */

    
});
