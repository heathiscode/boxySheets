var $$boxy = new Object;

String.prototype.camelCase = function() {
    return this.toString().replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
}

function BoxySheet() {
    var _;
    var __ = Object.keys; //so lazy
    var style = document.createElement("style");
    style.setAttribute('id', 'BoxySheet');

    if (typeof jQuery != 'undefined') _ = jQuery;
    if (typeof Zepto != 'undefined') _ = Zepto;
    
    $$boxy = {
        items: {},
        guides: {},
        media: {},
        sheets: {},
        styles: style
    };
    
    _.fn['bxy'] = function(prop, val) {
        _(this).each(function() {
            var dex = _(this).data('boxy-index');
            var style = $$boxy.styles.sheet.cssRules.item(dex).style;
            if (val === undefined || val === '') {
                style.removeProperty(prop);
                return;
            }
            style.setProperty(prop, val);
        });

    };

    _.fn['boxy-alignment'] = function(value) {
        if (!this.selector) return;
        var props = $$boxy.items[this.selector].properties;
        var placers = {
            'center': function() {

            },
            'midpoint': function() {
                /* this has to be a boxy set font size, we presume pixels */
                _(this).each(function() {
                    var t = _(this).text();
                    _(this).css('text-align', 'center');
                    if (_(this).children().length == 0) {
                        _(this).html('');
                        _(this).append('<div class="boxy-fill">' + t + '</div>');
                    }
                    var h = _(this).height();
                    var ch = _(this).children().height();
                    var fs = _(this).children().css('font-size');

                    _(this).children().css('position', 'absolute');

                    if (_(this).css('width')) {
                        _(this).children().css('width', _(this).css('width'));
                    }
                    _(this).children().css('top', (h - ch) / 2);
                    _(this).children().css('margin', 0);
                    _(this).children().css('padding', 0);
                    return;
                });
            }
        };
        if (typeof placers[value] == 'function') {
            placers[value].call(this, value);
        }
    };

    _.fn['boxy-gap'] = function(value) {};

    _.fn['boxy-layout'] = function(value) {
        if (!this.selector) return;
        var props = $$boxy.items[this.selector].properties;
        var info = {
            gap:  boxyEval(props['gap'])||0,
            space:  boxyEval(props['space'])||0,
            top:  boxyEval(props['top-side'])||0,
            bottom:  boxyEval(props['bottom-side'])||0,
            left:  boxyEval(props['left-side'])||0,
            right:  boxyEval(props['right-side'])||0,
            across:  boxyEval(props['across'])||0,
            down:  boxyEval(props['down'])||0
        };
        
        var layoutFunctions = {
            
            'float': function(info,props) {
                var width = 0,height = 0,biggest = 0;
                var left = info['left'] + info['space'];
                var top = info['top'] + info['space'];
                _(this).each(function(n) {
                    height = _(this).height();
                    if (biggest<height) {
                        biggest = height;
                    }
                    width = _(this).width();
                    _(this).bxy('left',left);
                    _(this).bxy('top',top);
                    left = left + width + info['gap'];
                    if (left+width>=info['right']) {
                        left = info['left'] + info['gap'];
                        top = top + biggest + info['gap'];
                        biggest = 0;
                    }
                });
            },
            
            /* fit elements into the defined region, figure out the correct height/width */
            'fit': function(info,props) {
                 
                var left = info['left'] + info['space'];
                var top = info['top'] + info['space'];
                
                var width = (
                    (info['right'] - info['space']*2) -
                    (info['left'] ) - ( ((info['across']||1)-1)*info['gap'])
                ) / (info['across'] || 1);
                
                var height = (
                    (info['bottom'] - info['space']*2) -
                    (info['top']) - ( ((info['down']||1)-1)*info['gap'])
                ) / (info['down'] || 1);
                
                props['width'] = width;
                props['height'] = height;
                
                _(this).each(function(n) {
                   var xn = n % props['across'];
                   var yn = Math.floor(n / props['across']);
                   left = xn * (width + info['gap']) + info['left'] + info['space'];
                   top = yn * (height + info['gap']) + info['top'] + info['space'];
                   _(this).bxy('top',top);
                   _(this).bxy('left',left);
                });
                
            },
            'fill': function(info,props) {
                 
                var width = (
                    (info['right'] - info['space']) -
                    (info['left'] + info['space'])
                );
                
                var height = (
                    (info['bottom'] - info['space']) -
                    (info['top'] + info['space'])
                );
                
               _(this).bxy('top',info['top'] + info['space']);
               _(this).bxy('left',info['left'] + info['space']);
               _(this).width( width );
               _(this).height( height );
                props['width'] = width;
                props['height'] = height;
            }
        };
        
        if (typeof(layoutFunctions[value])=='function') {
            if ($$boxy.items[this.selector].state != value) {
                layoutFunctions[value].call(this,info,props);
            }
            $$boxy.items[this.selector].state = value;
        }
    };

    _.fn['boxy-animate'] = function(value) { 
        _(this).animate(value);
        return null; 
    };
    
    _.fn['boxy-down'] = function(value) { return null; };
    _.fn['boxy-across'] = function(value) { return null; };


    _.fn['boxy-position'] = function(value) {
        var props = $$boxy.items[this.selector].properties;
        props['position']=value;
        _(this).bxy('position',value);
    };
   
    _.fn['boxy-space'] = function(value) {};
    _.fn['boxy-bottom-side'] = function(value) {};
    _.fn['boxy-top-side'] = function(value) {};
    _.fn['boxy-right-side'] = function(value) {};
    _.fn['boxy-left-side'] = function(value) {};
    
    _.fn['boxy-background'] = function(value) {
        _(this).bxy('background-color', value);
    };
    _.fn['boxy-test'] = function(value) {
        _(this).bxy('background-color', value);
        _(this).bxy('color', value);
    };

    _.fn['boxy-left'] = function(value) {
        if (!this.selector) return;
        var props = $$boxy.items[this.selector].properties;
        if (!props['layout']) {
            _(this).bxy('left', value);
        }
    };
    
    _.fn['boxy-top'] = function(value) {
        if (!this.selector) return;
        var props = $$boxy.items[this.selector].properties;
        if (!props['layout']) {
            _(this).bxy('top', value);
        }
    };

    _.fn['boxy-bottom'] = function(value) {
        _(this).height(value - _(this).offset().top);
    };


    _.fn['boxy-middle'] = function(value) {
        value = value - _(this).height() / 2
        _(this).bxy('top', value);
    };

    _.fn['boxy-width'] = function(value) {
        _(this).bxy('width', value);
    };

    _.fn['boxy-height'] = function(value) {
        _(this).bxy('height', value);
    };

    function load(boxySheet) {
        $$boxy.sheets.loaded = boxySheet;
        $$boxy.sheets.active = boxySheet;
        $$boxy.sheets.stack = [];
        buildBoxy(boxySheet);
        layout();
        events();
        _(window).resize();
    }

    function events() {
        
        var conditions = {};
        
        var refs = {
            '(@window)': window
        }
        
        __($$boxy.media).forEach(function(event) {
            var media = $$boxy.media[event];
            __(media).forEach(function(condition) {
                var boxyStyle = $$boxy.media[event][condition];
                var parse = event.split('.');
                var obj = refs[parse[0]];

                _(obj).on(parse[1], function() {
                    
                    var bounce = false;//condition == 'resize'?false:true;
                    
                    var val = boxyEvalProp(condition);
                    if (bounce) {
                        if (val==conditions[conditon]) return;
                        conditions[condition] = val;
                    }
                    if (val) {
                        buildBoxy(boxyStyle, event);
                    } else {
                        buildBoxy( $$boxy.sheets.loaded );
                    }
                    layout();
                    
                });
                
            });
        });
    }

    function addGuideLine(name, prop, val, width) {
        var div;
        width = width || 1;
        div = document.createElement('div');
        div.className = 'boxyGuide boxy-guide-' + name;
        div.setAttribute('alt', name + ' : ' + prop);
        div.style.position = 'absolute';
        div.style.cursor = 'crosshair';
        div.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
        if (prop == 'left' || prop == 'right') {
            div.style.width = width+'px';
            div.style.height = $(document).height();
            div.style.left = val;
        }
        else {
            div.style.top = val;
            div.style.width = $(window).width();
            div.style.height = width+'px';
        }
        document.body.appendChild(div);
    }

    function clearGuideLines() {
        var qbg = document.querySelectorAll('.boxyGuide');
        for (var i = 0; i < qbg.length; i++) {
            document.body.removeChild(qbg.item(i));
        }
    }

    /* apply our list of setter => getters */
    function layout() {
        var data, val, deval, cssSelector;
    
        clearGuideLines();
        __($$boxy.guides).forEach(function(guideName) {
            var guideProps = ['left', 'right', 'top', 'bottom'];
            var div;
            var guide = $$boxy.guides[guideName];
            if (guide['show-guide']) {
                guideProps.forEach(function(prop) {
                    if (guide[prop]) {
                        addGuideLine(guideName, prop, boxyEvalProp(guide[prop].value), guide['show-guide'].value);
                    }
                });
            }
        });

        __($$boxy.items).forEach(function(item) {
            data = $$boxy.items[item];
            if (data.elements) {
                data.elements.toArray().forEach(function(el) {
                    __(data.properties).forEach(function(property) {
                        deval = parseProperty(data.properties[property]);
                        val = boxyEval.call(el, deval);
                       setProperty(item, property, val);
                    });
                });
            }
        });
        
    }

    /* set an item property */
    function setProperty(item, prop, value) {
        var bprop;
        bprop = 'boxy-' + prop;
        if (typeof _(item)[bprop] === 'function') {
            return _(item)[bprop](value);
        }
        if (typeof _(item)[prop] === 'function') {
            return _(item)[prop](value);
        }
        if (
            typeof $$boxy.styles.style[('webkit-'+prop).camelCase()]!='undefined' ||
            typeof $$boxy.styles.style[('moz-'+prop).camelCase()]!='undefined' ||
            typeof $$boxy.styles.style[(prop).camelCase()]!='undefined'
            ) {
            return _(item).css(prop,value);
        }
        console.log('No setter for:', prop);
        console.log('unable to set:', item, value);
    }
    
    function setElementStyle(item,style) {
        var self = this;
        __(style).forEach(function(property) {
            var val = boxyEvalProp(style[property].value || style[property]);
            setProperty(_(self), property, val);
        });
    }
    
    var elementEvent ={
      'touchstart': function(item,rule,style) {
          _(item).touchstart(function() {
              setElementStyle.call(this,item,style);
          });
      },
      'touchend': function(item,rule,style) {
          _(item).touchend(function() {
              setElementStyle.call(this,item,style);
          });
      },
      'clicked': function(item,rule,style) {
          _(item).data('boxy-style-clicked',style);
      },
      'click': function(item,rule,style) {
          _(item).data('boxy-style-click',style);
          _(item).unbind('click');
          _(item).click(function() {
              var clicked = true;
              var styleClicked = _(this).data('boxy-style-clicked');
              if (styleClicked && _(this).data('boxy-clicked')==true) {
                  style = styleClicked;
                  _(this).data('boxy-clicked',false);
              } else {
                  style = _(item).data('boxy-style-click');
                  _(this).data('boxy-clicked',true);
              }
              setElementStyle.call(this,item,style);
          });
      },
      'hover': function(item,rule,style) {
          _(item).unbind('mouseout');
          _(item).unbind('mouseover');
          _(item).mouseover(function() {
              setElementStyle.call(this,item,style);
          });
          _(item).mouseout(function() {
              var self = this;
              _(this).data('boxy-items').forEach(function(rule) { 
                  var resetProps = {};
                  var props = $$boxy.items[rule].properties;
                  __(props).forEach(function(prop) { resetProps[prop]=props[prop] || ''; });
                  setElementStyle.call(self,item,resetProps);
              });
          });
      }
    };

    /* */
    function buildBoxy(boxySheet) {
        var style, value, code, parse, foo;
        

        if (!document.getElementById('BoxySheet')) {
            document.head.appendChild($$boxy.styles);
        }

        $$boxy.sheets.active = boxySheet;

        /* Core bits get setup here - parsing for events in @media and QS::event selectors */
        __(boxySheet).forEach(function(item) {

            style = boxySheet[item];
            
            __(style).forEach(function(property) {
                value = style[property].value || '';

                $$boxy.items[item] = $$boxy.items[item] || {
                    properties: {}
                };
                
                /* pre-evaluate props */
                $$boxy.items[item].properties[property] = parseProperty(value);
                
                /* state storage */
                $$boxy.items[item].state = null;

                /* if looks like a querySelector, gather our list */
                if (item.charAt(0) == '.' || item.charAt(0) == '#') {

                    if (!$$boxy.items[item].elements) {
                        var addRule='';
                        var state = '';//for :active,:hover etc
                        var rule = item;
                        var cssRule = rule;
                        var index = $$boxy.styles.sheet.cssRules.length;

                        if (rule.indexOf('::') > 0) {
                            //item = item.replace(/\:\:.*/,'');
                            rule = rule.split('::');
                            rule[1] = rule[1].replace(/[^a-zA-Z0-9\-]/g,'')
                            if (typeof(elementEvent[rule[1]])=='function') {
                                elementEvent[rule[1]](_(rule[0]),rule[0],style);
                                return;
                            }
                            return;
                        }

                        if ($$boxy.items[item]) {
                            $$boxy.items[item].elements = 
                            $$boxy.items[item].elements || _(item);
                        }
                       
                        if (rule.indexOf(':') > 0) {
                            rule = rule.split(':');
                            rule[1] = rule[1].replace(/[^a-zA-Z0-9\-]/g,'')
                            cssRule = (rule[0] + '.-boxy-' + rule[1]);
                            addRule = '-boxy-' + rule[1];
                            rule[1] = rule[1].replace(/:.*/,'');
                        }
                        
                        $$boxy.styles.sheet.insertRule(
                            cssRule + ' { position: absolute; }', index
                        );

                        _(item).each(function() {
                            
                            var items = _(this).data('boxy-items') || [];
                            var index = $$boxy.styles.sheet.cssRules.length;
                            items.push(item);
                            
                            _(this).data('boxy-items',items);
                            
                            $$boxy.styles.sheet.insertRule(
                               (r = cssRule + '.boxy-index-' + index )+ 
                                '{ position: absolute; }', index
                            );
                            
                            _(this).addClass('boxy-index-' + index);
                            _(this).addClass(addRule);
                            _(this).data('boxy-index', index);
                        });

                    }
                }

                if (item.charAt(0) == '@') {
                    parse = item.match(/([^\ \(]+)?([^\(]+)?(\([^\:]+)?(:)?(.+)?/);
                    var type = parse[1].substring(1);
                    var atName = (parse[2] || '').trim();
                    var condition = (parse[3] || '');
                    var event = (parse[5] || '(@window).resize');

                    if (type == 'guide') {
                        $$boxy.guides[atName] = $$boxy.guides[atName] || {};
                        __(style).forEach(function(prop) {
                            $$boxy.guides[atName][prop] = style[prop];
                        });
                    }

                    if (type == 'media') {
                        $$boxy.media[event] = $$boxy.media[event] || {};
                        $$boxy.media[event][condition] = style;
                    }

                }
            })
        });
    }

    /* parse a properties value into set of function calls */
    function parseProperty(code) {
        var m = '';
        var match;
        var func = 'getProperty.call'; //our getter functions

        if (code === undefined) return '';
        if (!code.match) return code; //we're not a string

        match = code.match(/\([\#\.\@][\ \:\w]+\)(\.[\-\w]+)(\.[\-\w]+)?/g);

        if (match) {
            var reval = code;
            match.forEach(function(toEval) {
                var m = toEval.match(/\((.+)\)\.(.+)/);
                reval = reval.replace(toEval, func + "(this,'" + m[1] + "','" + m[2] + "\')");
            });
            
            if (code.charAt(0)=="'") {
                if (code.charAt(1)=="{") {
                    reval = reval.substring(1,reval.length-1);
                }
            }
    
            return reval;
        }

        return code;
    }

    function boxyEval(val) {
        if (val.indexOf)
            if (val.indexOf("'") < 0 && val.indexOf('(') < 0) val = parseFloat(val);
                
        if (typeof(val)=='string') {
            if (val.charAt(0)=='{') {
                var obj = JSON.parse(val);
                __(obj).forEach(function(key) {
                   obj[key]=boxyEval(obj[key]);
                });
                return obj;
            }
        }
        return eval(val);
    }

    function boxyEvalProp(prop) {
        return boxyEval(parseProperty(prop));
    }

    /* return an item property */
    function getProperty(item, prop) {
        var val, guide, parse;
        if (item.charAt(0) == '@') {
            if (item == '@this') {
                if (typeof _(this)[prop] === 'function') {
                    return _(this)[prop]();
                }
            }
            if (item == '@window') {
                parse = prop.split('.');
                if (typeof _(window)[prop] == 'function') {
                    return _(window)[prop]();
                }
            }
            if (item == '@guide') {
                parse = prop.split('.');
                if (!parse[0] || !parse[1]) throw ("BoxySheets::bad guide property", prop);
                guide = $$boxy.guides[parse[0]][parse[1]].value;
                val = boxyEval(parseProperty(guide));
                return val;
            }
            return false;
        }
        if (item.charAt(0) == '#' || item.charAt(0) == '.') {
            if (typeof _(item)[prop] === 'function') {
                return _(item)[prop]();
            }
            if (prop == 'right') {
                return _(item).width() + parseFloat(_(item).css('left'));
            }
            if (prop == 'bottom') {
                return _(item).height() + parseFloat(_(item).css('top'));
            }
            return _(item).css(prop);
        }
    }

    $$boxy.layout = layout;

    return {
        load: load,
        layout: layout,
        getProperty: getProperty
    }

}
