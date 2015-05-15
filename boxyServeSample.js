

/* This is hard coded for now, change the filename you're working on here if you'd like.*/
/* -- all you really need is the JSON which can be embedded in your JS, this is for testing after live updates*/

var bxyFile = 'sample.bxy';
var http = require("http");

/* this will start up a CORS server to push static files and a live parsed BS JSON from the .bxy   */ 
var server = http.createServer(function(request, response) {
    
  var fs = require("fs");
  var f = request.url;
  console.log(f);
  f = f=='/'?'index.html':f;
  if (fs.existsSync('.'+f)) {
      response.setHeader("Content-Type","text/html");
      response.write(fs.readFileSync('.'+f).toString());
      response.end();
      return;
  }
  
  

  var rules = {};
  var css = require('css');
  var fs = require('fs');
  var file = fs.readFileSync(bxyFile);
  var fileStr = file.toString();
  var parsed = css.parse(fileStr);
  
  var keyframes = {};
  var media = {};

  parsed.stylesheet.rules.forEach(function(rule) {
      
      var keyName = rule.name;
      if (rule.keyframes) {
          rule.keyframes.forEach(function(frame,i_frame) {
              frame.values.forEach(function(frameValue) {
                  keyframes[keyName]=keyfram  es[keyName]|| {};
                  keyframes[keyName][frameValue]=keyframes[keyName][frameValue] || {};
                  
                  /*cleeeeean, everything clean. */
                  rule.keyframes[i_frame].declarations.forEach(function(butters) { delete(butters.position); delete(butters.type); });
                  
                  keyframes[keyName][frameValue]=rule.keyframes[i_frame].declarations;
              });
          });
      }
      
      if (rule.rules) {
            var mediaRule = '@media'+rule.media.trim();
            
            rule.rules.forEach(function(rule) {
                rule.selectors.forEach(function(query,i) {
                    var styles = rule.declarations;
                    styles.forEach(function(style) {
                        /* butters */
                        delete(style.position);
                        rules[mediaRule]=rules[mediaRule]||{};
                        rules[mediaRule][query]=rules[mediaRule][query]||{};
                        /* moar butters */
                        delete(style.position);
                        rules[mediaRule][query][style.property] = style;
                    });
                });
            });
        }
        
        if (rule.selectors) {
            rule.selectors.forEach(function(query) {
                rule.declarations.forEach(function(style) {
                    delete(style.position);
                    rules[query]=rules[query]||{};
                    rules[query][style.property]=style;
                });
            });
        }
  });


  rules.keyframes = keyframes;

  response.write( JSON.stringify(rules) );
  response.end();
});
 
server.listen(8080);
