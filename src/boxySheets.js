//private globals
var $$boxy = new Object;

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
            if (val == undefined || val == '') {
                style.removeProperty(prop);
                return;
            }
            style.setProperty(prop, val);
        });

    };

    _.fn['boxy-alignment'] = function(value) {
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

    _.fn['boxy-down'] = function(value) {
        var wide;
        var topSide;
        var props = $$boxy.items[this.selector].properties;
        var height;
        var gap = boxyEval(parseProperty(props['gap'] || 0));
        var space = boxyEval(parseProperty(props['space'])) || 0;

        if (value == 'clear') {
            return;
        };
        if (value == 'auto') {
            value = _(this).length;
        }

        topSide = boxyEval(parseProperty(props['top-side']));

        wide = (
            (boxyEval(parseProperty(props['bottom-side'])) + gap - space * 2) -
            (topSide)
        ) / value;

        if (wide < 0) {
            value = 'layout';
            props['height'] = _(this).height();
        }

        if (value == 'fill') {
            wide = boxyEvalProp(props['bottom-side']) -
                (topSide = boxyEvalProp(props['top-side']));

            _(this).bxy('top', topSide + space);
            props['top-side'] = topSide;
            props['height'] = wide - space * 2;
            return;
        }

        if (value == 'layout') {
            wide = wide + gap;
        }


        _(this).each(function(n) {
            var top = n * wide + topSide + space;

            if (value == 'layout') {
                height = boxyEval(parseProperty(props['height'])) || _(this).height();
                top = topSide + (height + gap) * n + space;
            }

            _(this).bxy('top', top);
            _(this).bxy('height', wide - gap);
        });

    };

    _.fn['boxy-across'] = function(value) {
        var wide;
        var leftSide;
        var width;
        var props = $$boxy.items[this.selector].properties;
        var gap = boxyEval(parseProperty(props['gap'])) || 0;
        var space = boxyEval(parseProperty(props['space'])) || 0;

        if (value == 'clear') {
            _(this).bxy('left', props.left ? props.left : '');
            return;
        }
        if (value == 'auto') {
            value = _(this).length;
        }

        if (value == 'fill') {

            wide = boxyEvalProp(props['right-side']) -
                (leftSide = boxyEvalProp(props['left-side']));

            _(this).bxy('left', leftSide + space);
            props['left-side'] = leftSide;
            props['width'] = wide - space * 2;
            return;
        }

        wide = (
            (boxyEval(parseProperty(props['right-side'])) + gap - space * 2) -
            (leftSide = boxyEval(parseProperty(props['left-side'])))
        ) / value;

        if (value == 'layout') {
            width = boxyEval(parseProperty(props['width'])) || _(this).width();
            wide = width + gap;
        }

        _(this).each(function(n) {
            var left = n * wide + leftSide + space;

            if (value == 'layout') {
                left = leftSide + (width + gap) * n + space;
            }

            _(this).bxy('left', left);
            _(this).bxy('width', wide - gap);
        });

        props['width'] = wide - gap;

    };


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
    _.fn['boxy-left'] = function(value) {
        _(this).bxy('left', value);
    };
    _.fn['boxy-background'] = function(value) {
        _(this).bxy('background', value);
    };

    _.fn['boxy-top'] = function(value) {
        _(this).bxy('top', value);
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
                    var vax = conditions[condition] || null;
                    if (bounce) {
                        conditions[condition] = val;
                        if (val==vax) return;
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

    function boxyEval(val) {
        if (val.indexOf)
            if (val.indexOf("'") < 0 && val.indexOf('(') < 0) val = parseFloat(val);
        return eval(val);
    }

    function addGuideLine(name, prop, val) {
        div = document.createElement('div');
        div.className = 'boxyGuide boxy-guide-' + name;
        div.setAttribute('alt', name + ' : ' + prop);
        div.style.position = 'absolute';
        div.style.cursor = 'crosshair';
        div.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
        if (prop == 'left' || prop == 'right') {
            div.style.width = '1';
            div.style.height = $(document).height();
            div.style.left = val;
        }
        else {
            div.style.top = val;
            div.style.width = $(window).width();
            div.style.height = '1px';
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
        var guideProps = ['left', 'right', 'top', 'bottom'];
        __($$boxy.guides).forEach(function(guideName) {
            var div;
            var guide = $$boxy.guides[guideName];
            if (guide['show-lines']) {
                guideProps.forEach(function(prop) {
                    if (guide[prop]) {
                        addGuideLine(guideName, prop, boxyEvalProp(guide[prop].value));
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
        console.log('No setter for:', prop);
        console.log('unable to set:', item, value);
    }

    /* */
    function buildBoxy(boxySheet) {
        var style, value, code, parse, foo;
        

        if (!document.getElementById('BoxySheet')) {
            document.head.appendChild($$boxy.styles);
        }

        $$boxy.sheets.active = boxySheet;

        __(boxySheet).forEach(function(item) {

            style = boxySheet[item];
            __(style).forEach(function(property) {
                value = style[property].value || '';

                $$boxy.items[item] = $$boxy.items[item] || {
                    properties: {}
                };
                $$boxy.items[item].properties[property] = parseProperty(value);

                /* if looks like a querySelector, gather our list */
                if (item.charAt(0) == '.' || item.charAt(0) == '#') {

                    if (!$$boxy.items[item].elements) {
                        var rule = item;

                        $$boxy.items[rule].elements = _(item);

                        var index = $$boxy.styles.sheet.cssRules.length;

                        if (rule.indexOf(':') > 0) {
                            rule = rule.split(':');
                            _(rule[0] + ':' + rule[1]).addClass('-boxy-' + rule[1]);
                            rule = rule[0] + '.-boxy-' + rule[1];
                        }

                        $$boxy.styles.sheet.insertRule(
                            rule + ' { position: absolute; }', index
                        );

                        _(item).each(function() {
                            var index = $$boxy.styles.sheet.cssRules.length;
                            $$boxy.styles.sheet.insertRule(
                                rule + '.boxy-index-' + index + ' { position: absolute; }', index
                            );
                            _(this).addClass('boxy-index-' + index);
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
        var match;
        var m = '';
        var func = 'getProperty.call'; //our getter functions

        if (code === undefined) return '';
        if (!code.match) return code; //we're not a string

        match = code.match(/\([\#\.\@][\ \:\w]+\)(\.\w+)(\.\w+)?/g);

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