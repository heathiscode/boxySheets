# BoxySheets

Dare to be boxy.

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
