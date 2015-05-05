/*===============/

Boxy v0.1a

The Dirty Box.

Boxy JSON requires a server side pre-parse.
Use the included one, run as a server, or a CLI dump,
for file, $.get, or copy paste.

Fill in events for media queries relating to

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

Media queries for

- Window dimensions (width/height)
- Scroll positions
- Any other dimenstions using CSS like selectors
- Moar.


('topQuarter=$(window).height();')

@media( (window).scrollTop > topQuarter ) {
    #mainMenu {
        top: 0;
        position: 'fixed';
    }
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

function BoxySheet() {
    
    //if (typeof $boxy == 'object') { Object.keys($boxy).forEach(function(k) { $$boxy[k]=$boxy[k]; }); }
    
    $$boxy.timerStart();
    
    
    if (typeof jQuery=='function') _ = jQuery; 
    if (typeof Zepto=='function') _ = Zepto; 
    
    $$boxy._ = _;
    if (!_ && !$$boxy.firstPass) console.log('Why you no give me Zepto or jQuery?')
    
    
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
   
    function reset() {
        //eventWatchers = [];
        watchers = [];
        $$boxy.setters = {};
        getters = {};
        guides = {};
    }
    
    function process(styles) {
        window.$boxy = window.$boxy || {};
        
        processStyles(styles);
        
        processGetters(getters);
        
        Object.keys(eventWatchers).forEach( function (eventName) {
            var np = eventName.split('.')
            var eventsInfo = eventWatchers[eventName];  
            
            eventsInfo.forEach(function(eventInfo) {
                var boxyQuerySheets = new BoxySheet;
                
                var eventObjName = np[0];
                var eventObjType = np[1];
                
                /* !object events are 'cache bounceless', for now, '!window' */
                var obj = eventObjName=='window' ||
                    eventObjName=='!window'?
                    window:
                    window[eventObjName];
                    
                var bounceEvents={};
                
                $(obj).on(eventObjType, function() {
                    if (bounceEvents[eventObjType]===true) {
                        return;
                    }
                    var mqev = eventInfo[1].join(',');
                    var val = evalMediaQueries(eventInfo[1]);
                    
                    $$boxy.evalCache[mqev] = $$boxy.evalCache[mqev] || '~not-it~';

                    if (val!==$$boxy.evalCache[mqev] || eventObjName.charAt(0)=='!') { 
                        if (val) {
                            bounceEvents[eventObjType] = true;
                            boxyQuerySheets.process(eventInfo[0]);
                            boxyQuerySheets.layout();
                            bounceEvents[eventObjType] = false;
                        }
                    }
                    $$boxy.evalCache[mqev]=val;
                });
                
            });
            
        });
        
        var bounceWindow;
        $(window).on('resize',function() { 
            if (bounceWindow) return;
            bounceWindow = setTimeout(function() {
                layout();  
                clearTimeout(bounceWindow);
                bounceWindow = false;
            },50);
        });

        processWatchers();
    }
    
   /* Engine power here */
    function processWatchers(options) {
        /* lift this and apply globally as option, stuff */
        var layoutFunctions = {
            '-add-class':function(el,val) { $(el).addClass(val); },
            '-remove-class':function(el,val) { $(el).removeClass(val); }
        };

        Object.keys(watchers).forEach(function(query) {
            watchers[query].forEach(function(bxy) {
                var a,b,c;
                var prop = bxy[1].trim();
                if (!prop) {
                    console.trace('prop error');
                    throw("Wot?!");
                }
                var el =$$boxy.setters[query].item(bxy[2]);
                var evalCode = bxy[0];
                var v;
                
                /* TODO: .. write down the thing I did what for here.. */
                if (evalCode.charAt(0)=="'") {
                    if (evalCode.indexOf('(')>0) {
                        v = parser.eval(evalCode.substr(1,evalCode.length-2));
                    } else {
                        v = evalCode.substr(1,evalCode.length-2);
                    }
                } else {
                    v = parser.eval(evalCode);
                }
                
                /* for non-boxy setters, add salt, with a dash */
                if (prop.charAt(0)=='-') {
                    prop = prop.substr(1);
                    /* hmm.. maybe the property is a function that will handle things? */
                    if (layoutFunctions[prop]) {
                        layoutFunctions[prop]( el, v);
                    } else {
                        el.css(prop,v);
                    }
                }
                $(el).data('boxy-'+prop,v);
                
                boxySetter.call(el,prop,v);
               
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
       func = func || 'boxyEvaluate'
       
       var match = code.match(/\([\#\.\-]\w+\)\.\w+/g);
       
       if (match) {
           var reval=code;
           
           match.forEach(function(toEval) {
                var m = toEval.match(/\((.+)\)\.(.+)/);
                reval = reval.replace(toEval,func+'("'+m[1]+'","'+m[2]+'"'+includeParams+')');
           });
           
           if ($$boxy.debug) console.log('toeval',reval);
           return reval;
       }
       
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
                /* media-query like conditional queries */
                
                if (query.charAt(0)=='(') {
                    
                    var qp = query.indexOf(':')+1;
                    var parsedQuery = query.match(/\((.*)\)/)[1];
                    var parseEvent = qp>0?query.substr(qp):false;

                    mediaQueries = parsedQuery.split(',');
                    
                    eventWatchers[parseEvent] = eventWatchers[parseEvent] || [];
                    eventWatchers[parseEvent].push([styles[query],mediaQueries,parsedQuery]);
                    
                    return;
                }
                
                getters[query] = getters[query] || {};
                
                /* allow media query props to overwrite default ones */
                if (mediaQuery) {
                    getters[query][property] = getter;
                } else {
                    getters[query][property] =  getters[query][property]  || getter;
                }
            });
        });
    }
 
    /****
     * Build watch list 
    **/
    function processGetters(getters) {
        
        Object.keys(getters).forEach(function(query){
            
            var getter = getters[query];
            $$boxy.setters[query] = document.querySelectorAll(query);
           
            [].forEach.call($$boxy.setters[query],function(setter,position) { 
                Object.keys(getter).forEach(function(prop) {
                   prop = prop.trim();
                   
                   var evalCode, code = getter[prop];
                   
                   evalCode = parseToEval(code,',"'+position+'","'+prop+'","'+query+'"');
                   
                   var val;
                   if (evalCode.charAt(0)=="'") {
                       val = evalCode.substr(1,evalCode.length-2);
                   } else {
                       val = parser.eval(evalCode);
                   }

                   var item = $$boxy.setters[query].item(position);
                   
                   boxyXtend(item);
                   
                   if (prop.charAt(0)=='-') prop = prop.substring(1);
                   if (val != undefined && val != null) {
                       item.setAttribute('data-boxy-'+prop,val);
                   }
                   
                   item.setAttribute('data-boxy-index',position);
                   
                   watchers[query] = watchers[query] || [];
                   watchers[query].push([evalCode,prop,position]);
                });
            
            });
        });
    }

    /* ------------------------------.------------.-----------------------.--*/
  
    /* Setters section - here call the style/helper with our gettered got - */
    function boxySetter(prop,val) {
        /* lets make it easy to use any dom manipulation library helper functions */
        //console.log(this,'setter on ',prop,val);
        if (typeof _(this)[prop] == 'function') {
            _(this)[prop](val);
        }
        /*  and some basic props */
        if (prop=='left' || prop=='top') {
            _(this).css(prop,val);
        }
        /* now our other trick pony props */
        if (prop=='center') {
            var w=this.getAttribute('boxy-data-width') || _(this).width();
            _(this).css('left', _(window).width()/2 - w/2);
        }
        if (prop=='middle') {
            var h=this.getAttribute('boxy-data-height') || _(this).height();
            _(this).css('left', _(window).height()/2 - h/2);
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
        
        - the guts for 'what does should this css style property equal?'
    */
    function boxyEvaluate(q,prop,position,arg,qs) {
        var queryResults;
        var item;
        
        if (q=='-window') return boxyGetVw( prop, position, arg, qs);
        
        queryResults = $$boxy.setters[qs] || document.querySelectorAll(qs);
        
        var evalWith = {
            '-prev': function(qs,position) {
                var queryResults = $$boxy.setters[qs] || document.querySelectorAll(qs);
                return queryResults[position-1] || '';
            },
            '-next': function(qs,position) {
                var queryResults = $$boxy.setters[qs] || document.querySelectorAll(qs);
                return queryResults[position+1] || '';
            },
            '-this': function(qs,position) {
                var queryResults = $$boxy.setters[qs] || document.querySelectorAll(qs);
                return queryResults[position];
            },
            '-parent': function() {
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
            console.log('no function Xtend for BoXY.boxy.'+prop)
        }
        
        /*  the safest error return here is a null string - other data can create floods and choos */
        return "";
    }
    
    
    $$boxy.firstPass = false;
    
    $$boxy.timerEnd();
 
    return {
        parseToEval: parseToEval,
        boxyEvaluate: boxyEvaluate,
        parser: parser,
        eventWatchers: eventWatchers,
        watchers: watchers,
        setters: $$boxy.setters,
        process: process,
        layout: processWatchers
    };

}
