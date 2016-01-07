# BoxySheets

   BoxySheets is a system that transforms a CSS style syntax into a dyamically 
   generated Style Sheets driven by event watchers.   Dynamically layout elements in a custom box model
   built with web designer applications in mind, rather then print media.
  
   
##What is it?

   It's a layout engine made to reduce B.S., driven by a CSS selectors, and plugin support.  
   Absolute positions drive each element with calculated positions.   Utilities such as @guide allow
   you to line up areas next to each other.   The ability to reposition elements relative to each other
   in any calculatable fashion allows for infinite variations on responsive layouts.
    

    <style type="text/boxysheet">
        /* redefine element guides based on *any* BQ */

        /* create a new 'guide' named, 'page'
        @guide page {
            /* store a value of '10' in the property 'left' */
            left: 10;
            /* 'special' getters give easy access to dynamic values, like screen size */
            right: (@window).width - 10;
        }

        /* define our element, a little differently */
        #element {
            /* 'layout' is a built in Boxy JS function, 'fit' is the paramater */
            layout: 'fit';
            /* calling layout('fit') looks at our other properties */
            left-side: (@guide).page.left;
            right-side: (@guide).page.right;
        }


        /* media guides make sense with normal conditions */
        @media( (@window).width > 640 ) {
            @guide page {
                left: 60;
                right: (@window).width - 30;
            }
        }

        /* adding 'event' options, lets us move things on scrolling (or any other events)  */
        @media( (@window).scrollY > 1024 ):(@window).scroll {
            @guide page {
                left: 60;
                right: (@window).width - 30;
            }
        }

    </style>
    
BoxySheets uses jQuery/lite to support advanced selectors.
You can easily create your own setters for Boxy, as jQuery plugins, e.g.:

    $.fn.myPropertyFn=function(value) {
       $(this).css('background',value);
    }
In your JS, and then in your Boxy code:    
    #myElement{ myPropertyFn: 'rgba(0,1,0,0.5)'; }

You get a transparent green background on #myElement.    

Built in special objects like @guide, allow for easy layout.
    And special properties let you layout elements easily:
     gap, space
     across, left-side, right-side
     down, top-side, bottom-side
     layout 
        
    
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
        layout: 'fit'; /*fit all the elements, squeeze em if you must */
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
 
 
