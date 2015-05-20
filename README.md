# BoxySheets

Dare to be boxy.

CSS like javascript built queries for
- Window dimensions (width/height)
- Scroll positions
- Event hooks
- Any other dimenstions using CSS like selectors
- Moar.
- Maths.

##use easily referenced rulers aka, 'guides'

    @guide foo {    
        left: 50,  
        right: (@window).width-50;  
    }  

##react to scrolling or resizing
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
        dowj: 4;
        left-side: (@guide).foo.left;
        right-side: (@guide).foo.right;
    }
