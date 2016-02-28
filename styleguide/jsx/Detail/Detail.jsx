


var Detail = React.createClass({

    componentWillMount: function() {
        var me = this;
        RouteState.addDiffListeners(
    		["detail","type","detail_index"],
    		function ( route , prev_route ) {
                if (
                    route.type == "atom" ||
                    route.type == "utility"
                ) {
                    me.forceUpdate();
                }
    		},
            "Detail"
    	);

        this.session = Math.random();
    },

    componentWillUnmount: function(){
        RouteState.removeDiffListenersViaClusterId( "Detail" );
    },

    componentDidMount: function () {
        var me = this;

        window.addEventListener( "message" , function(event) {
            if ( event.data.action == "cssreveal" ) {
                var cssText = event.data.cssText;
                cssText = cssText.replace( /{/g , "{\n\t");
                cssText = cssText.replace( /;/g , ";\n\t");
                cssText = cssText.replace( /}/ , "\n}");

                $(".Cmod-Detail__css pre").html( cssText );

                // don't force refresh...infinite regress
            }
        }, false);
    },

    close: function( type , id ){
        RS.merge({
            detail:"",
            type:"",
            detail_index:""
        });
    },

    goto: function( index ){
        $(".Cmod-Detail__css pre").html( "..." );
        RS.merge({
            detail_index:"" + index
        });
    },

    render: function() {

        var html = [];

        if ( RS.route.type ) {
            var css_obj;
            if ( RS.route.type == "atom" ) {
                css_obj = CSSModel.atom_lookup[ RS.route.detail ];
            }else if ( RS.route.type == "utility" ){
                css_obj = CSSModel.utility_lookup[ RS.route.detail ];
            }else{
                return <div className="Cmod-Detail">no obj applicable</div>;
            }

            var css_obj_html = [],css_obj_item,selected_class;
            for ( var a=0; a < css_obj.selectors.length; a++ ) {
                css_obj_item = css_obj.selectors[a];
                if ( css_obj_item.length > 0 ) {
                    selected_class = "";
                    if ( RS.route.detail_index == a ) {
                        selected_class = "Cmod-Detail__code__item--selected";
                    }
                    css_obj_html.push(
                        <div className={ "Cmod-Detail__code__item " +
                            selected_class }
                            onClick={ this.goto.bind( this , a ) }>
                            <pre>{ css_obj_item }</pre>
                        </div>
                    );
                }
            }

            html.push(
                <div className="Cmod-Detail__code">
                    { css_obj_html }
                </div>
            );
        }

        var example = "";
        var css_obj_selector,css_obj_code;

        if ( RS.route.detail_index ) {
            css_obj_selector = css_obj.selectors[ RS.route.detail_index ];
            css_obj_code = css_obj.css_array[ RS.route.detail_index ];

            var css_obj_example;
            if ( css_obj.example ) {
                css_obj_example = __processTemplate( css_obj.example , css_obj_selector );
            }else{
                css_obj_example = "<style>";
                css_obj_example += ".exampleBox { width: 100px; height: 100px;";
                css_obj_example += " background-color: #fff; ";
                css_obj_example += " font-family: sans-serif; }</style>"

                var css_obj_class = css_obj_selector.replace( /\./g , "" );

                css_obj_example += "<div class='exampleBox " + css_obj_class + "'>";
                css_obj_example += "<div style='height: 15px;' contenteditable='true'>Content</div>";
                css_obj_example += "</div>";
            }

            // example += "<link rel='stylesheet' type='text/css' href='../core.css'>";
            example += "<link rel='stylesheet' type='text/css' href='../core.css?"+ this.session +"'>";
            example += "<script> \n \
                            function findCSS ( selector ) {\n \
                                var styleSheet = document.styleSheets[0];\n \
                                var rules = styleSheet.cssRules, rule, cssText;\n \
                                for (var r=0; r<rules.length; r++ ) {\n \
                                    rule = rules[r];\n \
                                    cssText = rule.cssText;\n \
                                    if ( rule.selectorText == selector ) {\n \
                                        parent.postMessage({\n \
                            					action:'cssreveal',\n \
                            					cssText:cssText\n \
                            				}, document.location.origin\n \
                            			);\n \
                                        return;\n \
                                    }\n \
                                }\n \
                            }\n \
                            function ready(fn) {\n \
                              if (document.readyState != 'loading'){\n \
                                fn();\n \
                              } else {\n \
                                document.addEventListener('DOMContentLoaded', fn);\n \
                              }\n \
                            }\n \
                            ready( function() { findCSS('"+ css_obj_selector +"') } );\n \
                        </script>";

            example += css_obj_example;

        }else{
            example = "no element selected";
        }

        return  <div className="Cmod-Detail">

                    { html }

                    <div className="Cmod-Detail__preview">
                        <SimpleMagicFrame
                            example={ example }
                            exampleSelector={ css_obj_selector } />
                    </div>

                    <div className="Cmod-Detail__css">
                        <pre>...</pre>
                    </div>

                    <div className="Cmod-Detail__close"
                        onClick={ this.close }>x</div>
                </div>;
    }

});




var SimpleMagicFrame = React.createClass({
    render: function() {
        return <iframe style={{border: 'none'}} id="the_iframe"
                        className="Cmod-Detail__preview__iframe" />;
    },

    componentDidMount: function() {
        var me = this;
        RouteState.addDiffListeners(
    		["detail","type"],
    		function ( route , prev_route ) {
                me.postProcessElement();
    		},
            "rule_magicFrame"
    	);

        this.renderFrameContents();
    },

    componentWillUnmount: function(){
        RouteState.removeDiffListenersViaClusterId( "rule_magicFrame" );
    },

    renderFrameContents: function() {
        var doc = this.getDOMNode().contentDocument;
        if( doc.readyState === 'complete' ) {
            var content = this.props.example;
            var ifrm = this.getDOMNode();
            ifrm = ( ifrm.contentWindow ) ?
                        ifrm.contentWindow :
                            (ifrm.contentDocument.document) ?
                                ifrm.contentDocument.document : ifrm.contentDocument;

            ifrm.document.open();
            ifrm.document.write( content );
            ifrm.document.close();

            // firefox no like looking at iframe stylesheets
            // this.findCSS( this.props.exampleSelector );
            // cons ole.log( this.findCSS( this.props.exampleSelector , ifrm ) );
        } else {
            setTimeout( this.renderFrameContents , 0);
        }

        this.postProcessElement();
    },

    postProcessElement: function () {
        if ( !this.isMounted() )
            return;
    },

    componentDidUpdate: function() {
        this.renderFrameContents();
    },
    componentWillUnmount: function() {
        React.unmountComponentAtNode( this.getDOMNode().contentDocument.body );
    }
});
