/* 
    usage:
    browserify -r ./boxyParser.js:boxyParser> src/boxyParser.js
    
    If you're using the parser in your production environment, you're doing it wrong.
    
    In your client side JS:
    
    var boxySheet = new boxySheet();
    var boxyStyle = require('./boxyParser')(".queryString { [boxy-]prop: (selector).prop || 'value'; }");

    boxySheet.load(boxyStyle);
    ...
    Be sure to store the output from the parser for faster loads!   
    
*/
function boxyParser(boxySheet) {
    var file = boxySheet || '';
    var rules = {};
    var css = require('css');
    var fs = require('fs');
    var fileStr = file.toString();
    var parsed = css.parse(fileStr);
    
    var keyframes = {};
    var media = {};
    
    parsed.stylesheet.rules.forEach(function(rule) {
      
      var keyName = rule.name;
      
      if (rule.keyframes) {
          rule.keyframes.forEach(function(frame,i_frame) {
              frame.values.forEach(function(frameValue) {
                  keyframes[keyName]=keyframes[keyName]|| {};
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
                (rule.selectors||[]).forEach(function(query,i) {
                    var styles = rule.declarations;
                    styles.forEach(function(style) {
                        if (!style.property) return;
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
            (rule.selectors||[]).forEach(function(query) {
                rule.declarations.forEach(function(style) {
                    delete(style.position);
                    if (!style.property) return;
                    rules[query]=rules[query]||{};
                    rules[query][style.property]=style;
                });
            });
        }
    });
    
    rules['@keyframes'] = keyframes;
    
    return rules;
}

module.exports = function(sheet) { 
    return boxyParser(sheet);
}
