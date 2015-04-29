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
                    
                    Object.keys(data).forEach(function(v,k) { var qw = (data[v]==parseFloat(data[v]))?'':'"'; sp.push(v+'='+qw+(data[v])+qw); });
                    
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
        
        processStyles(styles);
        
        processGetters(getters);
        
        Object.keys(eventWatchers).forEach( function (eventName) {
            var np = eventName.split('.')
            var eventsInfo = eventWatchers[eventName];  
            
            eventsInfo.forEach(function(eventInfo) {
                var boxyQuerySheets = new BoxySheet;
                
                var eventObjName = np[0];
                var eventObjType = np[1];
                
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
                

                if (prop.charAt(0)=='-') {
                    prop = prop.substr(1);
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
                if ( v=el.getAttribute('data-boxy-position') ) {
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
       var e;
       func = func || 'boxyEvaluate'
       
       e = code.replace(/\([\#\.\w]+\)\.\w+/g,function(str) { return func+'("'+str.substr(1,str.indexOf(')')-1)+'","'+str.substr(str.indexOf('.')+1)+'"'+(includeParams||'')+')' });
       
       if ($$boxy.debug) console.log(e);
        
       return e;
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
    

    /* ----------------------------------------------------------*/
  
    /* Setters section - */
    function boxySetter(prop,val) {
        if (typeof $(this)[prop] == 'function') {
            $(this)[prop](val);
        }
        if (prop=='left' || prop=='top') {
            $(this).css(prop,val);
        }
        if (prop=='center') {
            var w=this.getAttribute('boxy-data-width') || $(this).width();
            $(this).css('left', $(window).width()/2 - w/2);
        }
        if (prop=='middle') {
            var h=this.getAttribute('boxy-data-height') || $(this).height();
            $(this).css('left', $(window).height()/2 - h/2);
        }
    }
   
    function boxyGetVw(pr,ps,ar,as) {
        var self = this;
        var functions = {
        scrollTop:
            function scrollTop() {
                var c= $(self).scrollTop();
                return $(self).scrollTop();
            },
        width:
            function width() {
                return $(self).width();
            },
        center:
            function center() {
                return $(self).width()/2;
            },
        right:
            function right()  {
                return $(self).width();
            },
        middle:
            function middle() {
                return $(self).height()/2;
            },
        bottom:
            function bottom() {
                return $(self).height();
            }
        };
        if (!functions[pr]) {
            console.log('boxyGetVw error for ',pr,ps,ar,as);
            return 0;
        }
        return functions[pr]();
    }
    
    function boxyGetEl(pr,ps,ar,qs) {
        var self = this;
        var v = $(self).data(pr);
        
        function getPosition() {
            if (_(el).data('boxy-position')=='absolute') return _(el).position();
            return _(el).offset();
        }
        function centerGetter() {
            var a=getPosition(self).left;
            return a + _(self).width()/2;
        }
        function middleGetter() {
            var a=getPosition(self).top;
            return a + _(self).height()/2;
        }
        function rightSideGetter() {
            var a=getPosition(self).left;
            return a + _(self).width();
        }
        function bottomSideGetter() {
            var top = getPosition(self).top;
            return top + _(self).height();
        }
        function cssGetter() {
            return _(self).css(pr,v);
        }
        function funcGetter() {
            return _(self)[ar]();
        }
        function returnPosition() {
            return ps;
        }
        var returns = {
            'previous': function() {
                console.log(this,'rpev');
                var r = boxyGetEl.call( _(this).prev()[0] ,pr,ps,ar,qs);
                //console.log(r,'previous');
                return JSON.stringify(r);
            },
            'parent': function() {
                return boxyGetEl.call(this.parentNode,pr,ps,ar,qs);
            },
            'this': function() {
                return boxyGetEl.call(this,pr,ps,ar,qs);
            },
            'middle':middleGetter,
            'index':returnPosition,
            'width':funcGetter,
            'height':funcGetter,
            'top':cssGetter,
            'left':cssGetter,
            'center':centerGetter,
            'bottom':bottomSideGetter,
            'right':rightSideGetter
        };
        if (returns[pr]) return returns[pr]();
        else console.log('no boxy-ness on | ('+qs+').'+pr, ' | for |', this, [pr,ps,ar,qs]);
    }

    /* ---------------------------------------------------------*/
    function boxyEvaluate(q,prop,position,arg,qs) {
        /* called from watcherprocessing via eviluater */
        var queryResults;
        var item;
        
        var evilWith = {
            'window': function(item,prop,position,arg,qs) {
                return boxyGetVw.call( item, prop,position,arg,qs);
            },
            'this': function() {
                item = $$boxy.setters[qs][position];
                return boxyGetVw.call( item, prop,position,arg,qs);
            },
            'parent': function() {
                item = $$boxy.setters[qs][position];
                return boxyGetVw.call( item.parentElement, prop,position,arg,qs);
            }
        };
        
        window.$boxy = window.$boxy || {};
        if (evilWith[q]) return evilWith[q](item,prop,position,arg,qs);
        
        queryResults = $$boxy.setters[qs] || document.querySelectorAll(qs);
        item = queryResults.item(position);
        return boxyGetEl.call( item, prop,position,arg,qs);
        
    }
    
    
    $$boxy.firstPass = false;
    
    $$boxy.timerEnd();
 
    return {
        parseToEval: parseToEval,
        boxyEvaluate: boxyEvaluate,
        boxyGet: boxyGetEl,
        parser: parser,
        eventWatchers: eventWatchers,
        watchers: watchers,
        setters: $$boxy.setters,
        process: process,
        layout: processWatchers
    };

}
