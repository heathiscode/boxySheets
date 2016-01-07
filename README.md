# BoxySheets

   BoxySheets is a system that transforms a CSS style syntax into a dyamically 
   generated Style Sheets driven by event watchers.   Dynamically layout elements in a custom box model
   built with web designer applications in mind, rather then print media.
   
   note: I'm looking for any help with this!   Bug reports especially.   There are many advantages to this technique, including built in poly-fill support, so the backwards compatibility should be excellent with far more accuracy in layout and page rendering across browsers.   As well as a way to rethink how pages can be structured, destructered, and manipulated.   
   
##What is it?

   It's a layout engine made to reduce B.S., driven by a CSS selectors, and plugin support.  
   Absolute positions drive each element with calculated positions.   Utilities such as @guide allow
   you to line up areas next to each other.   The ability to reposition elements relative to each other
   in any calculatable fashion allows for infinite variations on responsive layouts.
    
    @guide foo {
      left: 20;
      right: (@window).width - 20;
      top: (.someGroup:last).bottom + 20; /* 20px below the last of an element with the class .someGroup */
    }
    
    @media( (@window).width < 640 ):(@window).resize {
        #randomElement { 
            top: (#article).bottom + 20;
            across: 'fill';
            left-side: (#button).left;
            right-side: (#button).right;
        }
    }
    @media( (@window).scrollTop > 200 ):(@window).scroll {
        #menu { 
            position: 'fixed';
        }
    }
    
BoxySheets uses jQuery (jQuery Lite should work just as well) to support advanced selectors (experimental only Zepto support, as it uses querySelectorAll). 

So, any additional plugin's are supported as "properties", which become function calls, made with the evaluated 'value' of that property:
    #someElement { 
       pluginNameThatTakeAString: '#elementGroup'; 
       otherPlugin: (#element).functionName;
    }
    
You can easily create your own setters as jQuery plugins:

    $.fn.newPropertyFn=function(value) {
       $(this).css('background',value);
    }
In your JS, and in your Boxy:    
    #myElement{ newPropertyFn: 'rgba(0,1,0,0.5)'; }
You get a transparent green background on #myElement.    

Built in special objects like @guide, allow for easy layout.
    And special properties let you layout elements easily:
     gap, space
     across, left-side, right-side
     down, top-side, bottom-side
     alignment 
        
    
    @At handles for extra JS magic with
        @media 
        - work with conditional events, based on items such as screen size
        @window 
        - is your screen
        @guide 
        - is your helper, that can store misc. info  left,right,top,bottom 
          properties as visual aids 
          (display guideline markers using 'show-lines')
    
    
@media, unlike CSS, hooks us into a condition/event watchers you define.
    
    e.g.  
    //Declare a guide named 'foo'
    @guide foo {
        //show-lines: false; is the default
        width: 200;
        left: 20;
        //strings quotes in Boxy
        red: '#f00';
    }
 
Changing a guide property can change a button size at a certain display size

    @media( (@window).width < 640 ):(@window).resize {
        #fooBaz {
            top: 100;
        }
        @guide foo {
            width: (@window).width - 20;
        }
    }
      
    #button { width: @(guide).foo.width; }
    
    
CSS query results using jQuery selectors like :last

    .foo:last {
        background: 'blue';
    }
    
Getting and setting properties, with maths.
e.g. make button left equal to article left, plus 10
and create a guide using an element's "box" (the left/top/width/height).

    #button { left: (#article).left + 10; }
    
    @guide sample {
        left:(.foo).left;/* will return the left position of .foo*/
        right:(.foo).right;/*will return the right side of the .foo box,  (the left position + the width) */
        bottom:(.foo).bottom;/* will return the top position + the height 
    }

   /* set a guide using the window as a reference */

    @guide foo {    
        left: 50;
        right: (@window).width-50;  
        top: 20,
        bottom: (@window).height-20;
    }  

##React to scrolling or resizing
    @media( (@window).width > 640 ) {
        @guide foo {
            left: 200;
        }
    }
    @media( (@window).scrollTop > (#mainContent).top ) {
        #mainMenu {
            top: 0;
            position: 'fixed';
        }
    }

##Center something 
    #nav {
        center: (window).width;
    }

##Line things up in columns:
    #nav a {
        across: 4;
        left-side: (@guide).foo.left;
        right-side: (@guide).foo.right;
    }
    
####// or in rows
    #sideNav a.links {
        down: 4;
        top-side: (@guide).foo.top;
        bottom-side: (@guide).foo.bottom;
    }
 
The sample boxy sheet shows more.  
