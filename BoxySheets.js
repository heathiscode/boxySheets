//private globals
var $$boxy = new Object;

function BoxySheet() {
    var _;
    var __ = Object.keys;//so lazy
    
    if (typeof jQuery!='undefined') _ = jQuery;
    if (typeof Zepto!='undefined') _ = Zepto;
    
    $$boxy = { items: {}, guides: {}, media: {}, sheets: {} };
    
    _.fn['bxy']=function(prop,val) {
        if (prop=='left' || prop=='top') {
            _(this).css(prop,val);
        }
        _(this).data('boxy-'+prop,val);
        if (typeof _(this)[prop] == 'function') {
            _(this)[prop](val);
        }
    };
   
    _.fn['boxy-top-side']=function(value) {
        _(this).bxy('top-side',value);
    };
    _.fn['boxy-bottom-side']=function(value) {
        _(this).bxy('bottom-side',value);
    };
   
    _.fn['boxy-left']=function(value) {
        _(this).bxy('left',value);
    };
    
    _.fn['boxy-top']=function(value) {
        _(this).bxy('top',value);
    };
    
    _.fn['boxy-middle']=function(value) {
        value = value - _(this).height()/2
        _(this).bxy('top',value);
    };
    
    _.fn['boxy-left-side']=function(value) {
        _(this).bxy('left-side',value);
    };
    _.fn['boxy-right-side']=function(value) {
        _(this).bxy('right-side',value);
    };

     
    _.fn['boxy-down']=function(value) {
        var props = $$boxy.items[this.selector].properties;
        var wide = (
                boxyEval(parseProperty(props['bottom-side'])) - boxyEval(parseProperty(props['top-side']))
            )/value;
        _(this).each(function(n){
           var top = n * wide;
           _(this).bxy('top',top);
        });
    };
 
    _.fn['boxy-across']=function(value) {
        var props = $$boxy.items[this.selector].properties;
        var wide = (
                boxyEval(parseProperty(props['right-side'])) - boxyEval(parseProperty(props['left-side']))
            )/value;
        _(this).each(function(n){
           var left = n * wide;
           _(this).bxy('left',left);
        });
    };
    
    _.fn['boxy-width']=function(value) {
        _(this).bxy('width',value);
    };
    
    _.fn['boxy-height']=function(value) {
        _(this).bxy('height',value);
    };
    
    
    function load(boxySheet) {
        buildBoxy(boxySheet);
        layout();
        events();
    }
    
    function events() {
        var refs = {
            '(@window)':window
        }
        __($$boxy.media).forEach(function(event) {
           var media = $$boxy.media[event];
           __(media).forEach(function(condition) {
              var boxyStyle = $$boxy.media[event][condition];
              var parse = event.split('.');
              var obj = refs[parse[0]];
              
              _(obj).on(parse[1],function() {
                  var val = parseProperty(condition);
                  if (boxyEval(val)) {
                      buildBoxy(boxyStyle,event);
                      layout();
                  } else {
                      buildBoxy($$boxy.sheets.default)
                      layout();
                  }
              })
           });
        });
    }
    
    function boxyEval(val) {
        return eval(val);
    }
    
    /* apply our list of setter => getters */
    function layout() {
        var data, style, val, deval;
        __($$boxy.items).forEach(function(item) {
            data = $$boxy.items[item];
            if (data.elements) {
                data.elements.forEach(function(el) {
                    //set all the element's given properties 
                    if (data.properties.position === undefined) {
                        _(el).css({position:'absolute'});
                    }
                    __(data.properties).forEach(function(property) {
                       deval = parseProperty(data.properties[property]);
                       val = boxyEval.call(el,deval);
                       setProperty(item,property,val);
                    });
                });
            }
        });
    }
    
    function buildBoxy(boxySheet,name) {
        name = name || 'default';
        $$boxy.sheets[name]=boxySheet;
        
        var style,value,code,parse,foo;
        __(boxySheet).forEach(function(item) {
            style = boxySheet[item];
            __(style).forEach(function(property) {
                value = style[property].value||'';
                
                $$boxy.items[item] = $$boxy.items[item] || { properties: {} };
                $$boxy.items[item].properties[property] = parseProperty(value);
                
                /* if looks like a querySelector, gather our list */
                if (item.charAt(0)=='.' || item.charAt(0)=='#') {
                    $$boxy.items[item].elements = _(item);
                }
                if (item.charAt(0)=='@') {
                    parse = item.match(/([^\ \(]+)?([^\(]+)?(\([^\:]+)?(:)?(.+)?/);
                    var type = parse[1].substring(1);
                    var name = (parse[2] || '').trim();
                    var condition = (parse[3] || '');
                    var event = (parse[5] || '(@window).resize');
                    
                    if (type=='guide') {
                        $$boxy.guides[name] =  $$boxy.guides[name] ||  {};
                        __(style).forEach(function(prop) {
                            $$boxy.guides[name][prop] =  style[prop];
                        });
                    }
                    
                    if (type=='media') {
                        $$boxy.media[event] = $$boxy.media[event] || {};
                        $$boxy.media[event][condition] = style;
                    }
                    
                }
            })
        });
 
    }
    
    /* parse a properties value into set of function calls */
    function parseProperty(code) {
        var match;
        var m = '';
        var func = 'getProperty.call'; //our getter functions
        
        match = code.match(/\([\#\.\@]\w+\)(\.\w+)(\.\w+)?/g);
        if (match) {
            var reval = code;
            match.forEach(function(toEval) {
                var m = toEval.match(/\((.+)\)\.(.+)/);
                reval = reval.replace(toEval, func + '(this,"' + m[1] + '","' + m[2] + '\")');
            });
            return reval;
        }
        return code;
    }
    
    /* return an item property */
    function getProperty(item,prop) {
        var val,guide,parse;
        if (item.charAt(0)=='@') {
            if (item=='@this') {
                if (typeof _(this)[prop] === 'function') {
                    return _(this)[prop]();
                }
            }
            if (item=='@window') {
                parse = prop.split('.');
                if (typeof _(window)[prop] == 'function') {
                    return _(window)[prop]();
                }
            }
            if (item=='@guide') {
                parse = prop.split('.');
                if (!parse[0]||!parse[1]) throw("BoxySheets::bad guide property",prop);
                guide = $$boxy.guides[parse[0]][parse[1]].value;
                val = boxyEval(parseProperty(guide));
                return val;
            }
            return false;
        }
        if (item.charAt(0)=='#' || item.charAt(0)=='.') {
            if (typeof _(item)[prop] === 'function') {
                return _(item)[prop]();
            }
        }
    }
    
    /* set an item property */
    function setProperty(item,prop,value) {
        prop = 'boxy-'+prop;
        if (typeof _(item)[prop] === 'function') {
            return _(item)[prop](value);
        } else {
            console.log('No setter for:',prop);
            console.log('unable to set:',item,value);
        }
    }
    
    
    return {
        load: load,
        layout: layout
    }
    
}
