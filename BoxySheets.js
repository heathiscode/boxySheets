/*===============/

Boxy v0.2a

The reShoe Box.
Unstable, unusuable.

Requires:

jQuery/Zepto ( 
    to remain optional, 
    uses basic getters for element positions,
    and dimensions; 
)

Install with Bower:

bower install jquery

NodeJS with 
    
npm install css


- any window or document property -

including --

CSS like javascript built queries for

- Window dimensions (width/height)
- Scroll positions
- Event hooks
- Any other dimenstions using CSS like selectors
- Moar.
- Maths.

use easily referenced rulers aka, 'guides'

@guide foo {
    left: 50,
    right: (@window).width-50;
}

e.g.
@media( (@window).scrollTop > (#mainContent).top ) {
    #mainMenu {
        top: 0;
        position: 'fixed';
    }
}

Center something 

#nav {
    center: (window).width;
}

Line things up in columns:

#nav a {
    across: 4;
    /* or rows with 'down: 4;'' }
    left-side: (@guide).foo.left;
    right-side: (@guide).foo.right;
}

/================/
*/


var $$boxy = 
{ firstPass: true, setters: {}, evalCache: {},
    debug: true,
    timerStart: function() {
        
    },
    timerEnd: function() {
        
    }
};

if (typeof math===undefined) console.log('Warning for the paranoid! You are using evil eval from an unknown boxySheet can be unpredicatble.\r\nAlternatively, install mathjs as math, (ouch) or roll your own :)');

var _$boxy$_ = new BoxySheet(); //shush you.
function BoxySheet() {
    
    var __boxy = this;
    
    var $DEBUG_EVAL = false;
    
    var __styles = {};
    
    //if (typeof $boxy == 'object') { Object.keys($boxy).forEach(function(k) { $$boxy[k]=$boxy[k]; }); }
    
    
    //boot the box
    $$boxy.timerStart();
    $$boxy.guides = $$boxy.guides || {};
    
    if (typeof jQuery=='function') _ = jQuery; 
    if (typeof Zepto=='function') _ = Zepto; 
    
    $$boxy._ = _;
    if (!_ && !$$boxy.firstPass) console.log('Why you no give me Zepto or jQuery? Moar helper needed.')
    
    
    //querySelector list of boxy's to set
    var styles,
        eventWatchers = {},/*events by type containing rules*/
        watchers = {},
        running = false,
        getters = {},
        guides = {}
    ;
    
   var parser,_parser;
    if (typeof math!='undefined') {
        _parser = new math.parser();
        parser={ 
            set: function(filler) {  return null; },
            eval: function(str,data) { 
                return _parser.eval(str); 
            }
        };
    } else {
        parser={ 
            set: function(filler) {  return null; },
            eval: function(str,data) { 
                if (data !== undefined) {
                    var _return,sp=[];
                    
                    Object.keys(data).forEach(
                        function(v,k) { 
                            var qw = (data[v]==parseFloat(data[v]))?'':'"'; 
                            sp.push(v+'='+qw+(data[v])+qw); 
                    });
                    
                    str = sp.join(';')+';_return = '+str+';';
                    
                    eval(str);
                    
                    return _return;
                }
                try {
                    return eval(str); 
                } catch(e) {
                    console.log('failed',str,e);
                    //console.trace('bad eval',str);
                }
            }
        };
    }

   /* evaluater for boxy properties */
    parser.set('boxyEvalute', boxyEvaluate);
    
    function processGuides(styles,getters) {
        Object.keys(styles).forEach(function(key) {
            if (key.charAt(0)=='@') {
                if (key.substr(1,5)=='guide') {
                    var name = key.substring(key.indexOf(' ')).trim();
                    var guide = $$boxy.guides[name];
                    _$boxy$_.process(guide._styles);
                    /*
                    if (guide !== undefined) {
                        console.log('REPROCESSSSSSSSS',guide._styles);
                        var watchers = processGetters(guide._styles,getters);
                    }
                    */
                }
            }
        });
    }
     
    function process(styles,_boxy) {
        _boxy = _boxy || null;
        window.$boxy = window.$boxy || {};
        
        var getters = processStyles(styles);
        
        var watchers = processGetters(styles,getters);
        
        var _guides_ = processGuides(styles,getters);
        
        
        Object.keys(eventWatchers).forEach( function (eventName) {
            
            var np = eventName.split('.');//Name Parts
            
            var eventsInfo = eventWatchers[eventName];  
            
            eventsInfo.forEach(function(eventInfo) {
                /*  capturing for [@#.name].[event] */
                var eventObjName = np[0].match(/\((.+)\)/)[1];
                var eventObjType = np[1];
                
                /* !object events are 'cache bounceless', for now, '!window' */
                var obj = eventObjName=='@window' ||
                    eventObjName=='!window'?
                    window:
                    window[eventObjName];
                    
                var bounceEvents={};
                
                $(obj).on(eventObjType, function() {
                    if (bounceEvents[eventObjType]===true) {
                        return;
                    }
                    var mqev = eventInfo[2];//.join(',');
                    var val = evalMediaQueries(eventInfo[1]);
                    var boxyQuerySheets;//new instance of boxy 
                    
                    $$boxy.evalCache[mqev] = $$boxy.evalCache[mqev] || '~not-it~';
                    
                    if ( val!==$$boxy.evalCache[mqev] || eventObjName.charAt(0)=='!') { 
                        
                        window.requestAnimationFrame(function() {
                                                        
                            boxyQuerySheets = new BoxySheet;
                            bounceEvents[eventObjType] = true;
                            boxyQuerySheets.process(eventInfo[0],__boxy);
                            boxyQuerySheets.layout();
                            bounceEvents[eventObjType] = false;
                            
                        });

                    }
                    
                    $$boxy.evalCache[mqev] = -1;//val;
                });
                
            });
            
        });
        
        var bounceWindow;
        $(window).on('resize',function() { 
            if (bounceWindow) return;
            bounceWindow = setTimeout(function() {
                //layout();  
                clearTimeout(bounceWindow);
                bounceWindow = false;
            },50);
        });

        processWatchers(watchers);
    }
    
    /* Engine power here */
    function processWatchers() {
        /* run the eval code */
        if (!watchers) console.trace();
        
        Object.keys(watchers).forEach(function(query) {
            
            watchers[query].forEach(function(bxy) {
                var prop = bxy[1].trim();
                var v;
                var el = $$boxy.setters[query].item(bxy[2]);
                var evalCode = bxy[0];
                if (!prop) { console.trace('no property error'); }
                //do something nasty with single quoted bits
                if (evalCode.charAt(0)=="'") {
                    if (evalCode.charAt(1)=='(') {//if bracket,strip brackets and evaluate,or just return if no brace
                        v = parser.eval(evalCode.substr(1,evalCode.length-2));
                    } else {
                        v = evalCode.substr(1,evalCode.length-2);
                    }
                } else {
                    v = parser.eval(evalCode);
                }
               
                _(el).data('boxy-'+prop,v);
                
                boxySetter.call(el,prop,v,bxy);
            });
            
            watchers[query].forEach(function(bxy) {
                var v,el =$$boxy.setters[query].item(bxy[2]);
                v=el.getAttribute('data-boxy-position');
                if ( v ) {
                    $(el).css('position',v);
                } else {
                    $(el).css('position','absolute');
                }
            });
            
        });
        
        
    }
     
    //does the query evaluate?
    function evalMediaQueries(mediaQueries) {
        var metQuery = true;
        
        mediaQueries.forEach(function (mq) {
            var code = parseToEval(mq,',0');
            var test =parser.eval(code);
            metQuery = metQuery && test;
        });
        
        return metQuery;
    }
    
    function parseToEval(code,includeParams,func) {
       var e='',m='';
       func = func || 'boxyEvaluate';//our getter functions
       
       var match = code.match(/\([\#\.\@]\w+\)\.\w+/g);
       
       if (match) {
           var reval=code;
           
           match.forEach(function(toEval) {
                var m = toEval.match(/\((.+)\)\.(.+)/);
                reval = reval.replace(toEval,func+'("'+m[1]+'","'+m[2]+'"'+includeParams+')');
           });
           
           //if ($$boxy.debug) console.log('toeval',reval);
           if ($DEBUG_EVAL) console.log(reval);
           return reval;
       }
       
       if ($DEBUG_EVAL) console.log(code);
       return code;
    }
    
    function processStyles(styles,mediaQuery) {
        eventWatchers = {};
        
       /* break rules up into style lists */ 
        Object.keys(styles).forEach(function(query) {
            var style = styles[query];
            
            /* iterate/parse for getters and conditionals  */
            Object.keys(style).forEach(function(m) {
                var mediaQueries;
                var rule = style[m];
                var property = rule.property;
                var getter = rule.value;
                
                    
                //query is one of a query selector, or at-rule    
                
                /* parse out media-query like conditionals and other @t's */
                if (query.charAt(0)=='@') {
                    /*at-rule:QueryParts for @ queries, supports @media (experimental, @guides) */
                    var named='',
                        guided = {};
                        qp = query.indexOf(':')+1;
                    
                    var parts = query.match(/[a-zA-Z0-9\-\_]+/g);
                    
                    //lazy match valid words - a 2nd word should could be our at-query 'name' if we need one
                    if (parts[1]) {
                        named = parts[1];
                    }
                    
                    if (parts[0]=='guide') {
                        $$boxy.guides[named] = 
                        $$boxy.guides[named] || styles[query];
                        
                        $$boxy.guides[named]._styles = 
                        $$boxy.guides[named]._styles || {};
                    }
                    
                    if (qp) {
                        var parsedCondition = query.match(/\((.+)\):/)[1];
                        var parseEvent = qp>0?query.substr(qp):false;
                        mediaQueries = parsedCondition.split(',');
                        eventWatchers[parseEvent] = eventWatchers[parseEvent] || [];
                        eventWatchers[parseEvent].push( [ styles[query], mediaQueries, parsedCondition] );
                    } 
                } else {
                    
                    getters[query] = getters[query] || {};
                    
                    /* allow media query props to overwrite default ones */
                    if (mediaQuery) {
                        getters[query][property] = getter;
                    } else {
                        getters[query][property] =  getters[query][property]  || getter;
                    }
                    
                }
            });
        });
        
        return getters;
    }
 
    /****
     * Build watch list 
    **/
    function processGetters(styles,getters) {
        
        Object.keys(getters).forEach(function(query) {
            
            var getter = getters[query];
            $$boxy.setters[query] =  $$boxy.setters[query]  || document.querySelectorAll(query);
           
            [].forEach.call($$boxy.setters[query],function(setter,position) { 
                Object.keys(getter).forEach(function(prop) {
                   var val;
                   var parts,
                   drop,
                   evalCode, 
                   code = getter[prop];
                   prop = prop.trim();
                   parts = code.split('.');
                   drop = parts[parts.length-1];
                   
                   evalCode = parseToEval(code,',"'+position+'","'+prop+'","'+query+'","'+drop+'"');
                   
                   if (evalCode.charAt(0)=="'") {
                       val = evalCode.substr(1,evalCode.length-2);
                   } else {
                       val = parser.eval(evalCode);
                   }

                   var item = $$boxy.setters[query].item(position);
                   boxyXtend(item);
                   
                   //parts has our query parts split by dots
                   if (prop.charAt(0)=='@') prop = prop.substring(1);
                   
                   if (parts[0]=='(@guide)') {
                       parts.push(prop);
                       parts.push(query);
                       $$boxy.guides[parts[1]]._styles[parts[4]] = styles[parts[4]];
                   }
                   
                   
                   
                   if (val != undefined && val != null) {
                       item.setAttribute('data-boxy-'+prop,val);
                   }
                   
                   item.setAttribute('data-boxy-index',position);
                   
                   watchers[query] = watchers[query] || [];
                   watchers[query].push([evalCode,prop,position]);
                });
            
            });
        });
        
        return watchers;
    }

    /* ------------------------------.------------.-----------------------.--*/
  
    /* Setters section - here call the style/helper with our gettered got - */
    function boxySetter(prop,val,bx) {
        /* lets make it easy to use any dom manipulation library helper functions */
        //console.log(this,'setter on ',prop,val);
        var a;
        if (typeof _(this)[prop] == 'function') {
            _(this)[prop](val);
        }
        /*  and some basic props */
        if (prop=='left' || prop=='top' || prop.charAt(0)=='-') {
            if (prop.charAt(0)=='-') prop=prop.substring(1);
            _(this).css(prop,val);
        }
        
        /* now our other trick pony props */
        if (prop=='center') {
            var w=this.getAttribute('boxy-data-width') || _(this).width();
            _(this).css('left', _(window).width()/2 - w/2);
        }
        
        if (prop=='middle') {
            var h = _(this).data('boxy-height') || _(this).height();
            _(this).css('top', val - h/2);
        }
        
        if (prop=='across') {
            var across=_(this).data('boxy-across');
            var leftSide = _(this).data('boxy-left-side');
            var rightSide = _(this).data('boxy-right-side');
            var index = _(this).data('boxy-index');
            var left = (leftSide+rightSide)/across * index;
            var width = (leftSide+rightSide)/across;
            _(this).css('left', left);
            if (!_(this).data('width')) {
                _(this).css('width', width);
            }
        }
        
    }
   
    /* Get a viewport property */
    function boxyGetVw(pr,ps,ar,as) {
        /* :/ refactor this late night mess */
        if (this.nodeName) {
            if (this.nodeName.charAt(0)!='#') {
                console.trace('Bad Viewport Call')
            }
        }
        var self = this;
        var functions = {
        scrollLeft:
            function scrollLeft() {
                return _(self).scrollLeft();
            },
        scrollTop:
            function scrollTop() {
                return _(self).scrollTop();
            },
        width:
            function width() {
                return _(self).width();
            },
        height:
            function height() {
                return _(self).height();
            },
        center:
            function center() {
                return _(self).width()/2;
            },
        right:
            function right()  {
                return _(self).width();
            },
        middle:
            function middle() {
                return _(self).height()/2;
            },
        bottom:
            function bottom() {
                return _(self).height();
            }
        };
        if (!functions[pr]) {
            console.log('boxyGetVw error for ',pr,ps,ar,as);
            console.trace('Boxy ViewPort property error');
            return 0;
        }
        return functions[pr]();
    }
    
    /* .. I want to stay out of the DOM but I want to be ..'direct' in parsing evaluations ... */
    /*
        Extend an element with boxy
        note:     this is subject to change drastically pending investigation
    */
    function boxyExtender(el) {
        el.boxy = {};
        
        el.boxy.BoXYleft = function() {
           return _(el).offset().left; 
        };
        
        el.boxy.BoXYtop = function() {
           return _(el).offset().top; 
        };
        
        el.boxy.BoXYbottom = function() {
           return _(el).offset().top + _(el).height(); 
        };
        
        el.boxy.BoXYright = function() {
           return _(el).offset().left + _(el).width(); 
        };
        
        el.boxy.BoXYmiddle = function() {
           return _(el).offset().top + _(el).height() / 2;  
        };
        
        el.boxy.BoXYcenter = function() {
           return _(el).offset().left + _(el).width() / 2; 
        };
        
        el.boxy.BoXYheight = function() {
           return _(el).height();
        };
        
        el.boxy.BoXYwidth = function() {
           return _(el).width();
        };
        
        return el; 
    }
    
    
    /* A wrapper for the extend .. this function name will stay */
    function boxyXtend(el) {
        
        if (el===undefined) {
            console.trace('Can\'t BoXY Extend undefined!');
        }
        el.$boxyed = true;
        
        return boxyExtender(el);
    }
    

    /* ---------------------------------------------------------*/
    /* figure out what to do with our:
    
        query string, css property, position in the list, arguments and what we were querying from
        drop is the last property getter found in the query for 'thing' in (@foo).bar.thing
        
        - the guts for 'what does should this css style property equal?'
        
        returns the node to be evaluated
    */
    function boxyEvaluate(q,prop,position,arg,qs,drop) {
        var queryResults;
        var item;
        
        if (q=='@viewport' || q=='@window') return boxyGetVw( prop, position, arg, qs);
        
        queryResults = $$boxy.setters[qs] || document.querySelectorAll(qs);
        
        var evalWith = {
            '@guide': function(qs,position) {
//                console.log('@guide',prop);
                return $$boxy.guides[prop];
            },
            '@prev': function(qs,position) {
                var queryResults = $$boxy.setters[qs] || document.querySelectorAll(qs);
                return queryResults[position-1] || '';
            },
            '@next': function(qs,position) {
                var queryResults = $$boxy.setters[qs] || document.querySelectorAll(qs);
                return queryResults[position+1] || '';
            },
            '@this': function(qs,position) {
                var queryResults = $$boxy.setters[qs] || document.querySelectorAll(qs);
                return queryResults[position];
            },
            '@parent': function() {
                var queryResults = $$boxy.setters[qs] || document.querySelectorAll(qs);
                return queryResults[position].parentNode;
            }
        };
        
        if (evalWith[q]) {
            item = evalWith[q](qs,position);
        } else  {
            queryResults = $$boxy.setters[qs] || document.querySelectorAll(qs);
            item = queryResults.item(position);
        }
        
        if (item.$boxyed===undefined) {
            boxyXtend(item);
        }
        
        if (typeof item.boxy['BoXY'+prop]=='function') {
            return item.boxy['BoXY'+prop]();
        } else {
            //at-rules here..
            if (q=='@guide') {
                //eval what foo to do to guide
                var ret = new Object;
                var code = $$boxy.guides[prop][drop].value;
                evalCode = parseToEval(code,',"'+prop+'","'+position+'","'+qs+'"');
                ret[drop] = parser.eval(evalCode);
                return ret;
            }
        }
        
        /*  the safest error return here is a null string 
        - other data can create overfloods and chaeos unt unbrighten thine eyes. perhaps. */
        
        return "";
    }
    
    
    $$boxy.firstPass = false;
    
    $$boxy.timerEnd();
 
    return {
        parseToEval: parseToEval,
        boxyEvaluate: boxyEvaluate,
        eventWatchers: eventWatchers,
        watchers: watchers,
        setters: $$boxy.setters,
        process: process,
        parser: parser,
        layout: processWatchers
    };

}
