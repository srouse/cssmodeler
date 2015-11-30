


var Detail = React.createClass({

    componentWillMount: function() {
        var me = this;
        RouteState.addDiffListeners(
    		["detail","type","detail_index"],
    		function ( route , prev_route ) {
                me.forceUpdate();
    		},
            "Detail"
    	);
    },

    componentWillUnmount: function(){
        RouteState.removeDiffListenersViaClusterId( "Detail" );
    },

    close: function( type , id ){
        RS.merge({
            detail:"",
            type:"",
            detail_index:""
        });
    },

    goto: function( index ){
        RS.merge({
            detail_index:"" + index
        });
    },

    render: function() {

        var html = [];

        if ( RS.route.type ) {
            var css_obj;
            if ( RS.route.type == "atom" ) {
                css_obj = CSSModel.atoms[ RS.route.detail ];
            }else if ( RS.route.type == "utility" ){
                css_obj = CSSModel.utilities[ RS.route.detail ];
            }else{
                css_obj = CSSModel.bases[ RS.route.detail ];
            }

            var css_obj_html = [],css_obj_item,selected_class;
            for ( var a=0; a < css_obj.css_array.length; a++ ) {
                css_obj_item = css_obj.css_array[a];
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
        if ( RS.route.type == "base" ) {
            example = "( no preview for bases/resets )";
        }else{
            if ( RS.route.detail_index ) {
                //var atom = CSSModel.atoms[ RS.route.detail ];
                var css_obj_selector = css_obj.selectors[ RS.route.detail_index ];

                var css_obj_class = css_obj_selector.replace( /\./g , "" );
                example = "<style>";
                example += ".exampleBox { width: 100px; height: 100px;";
                example += " background-color: #fff; ";
                example += " font-family: sans-serif; }</style>"

                example += "<link rel='stylesheet' type='text/css' href='../core.css'>";
                example += "<div class='exampleBox " + css_obj_class + "'>";
                example += "<div style='height: 15px;' contenteditable='true'>Content</div></div>";
            }else{
                example = "no element selected";
            }
        }




        return  <div className="Cmod-Detail">

                    { html }

                    <div className="Cmod-Detail__preview">
                        <SimpleMagicFrame example={ example } />
                    </div>

                    <div className="Cmod-Detail__close"
                        onClick={ this.close }>x</div>
                </div>;
    }

});




var SimpleMagicFrame = React.createClass({
    render: function() {
        return <iframe style={{border: 'none'}}
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
            ifrm = (ifrm.contentWindow) ?
                        ifrm.contentWindow :
                            (ifrm.contentDocument.document) ?
                                ifrm.contentDocument.document : ifrm.contentDocument;

            ifrm.document.open();
            ifrm.document.write(content);
            ifrm.document.close();
        } else {
            setTimeout( this.renderFrameContents , 0);
        }

        this.postProcessElement();
    },

    postProcessElement: function () {
        if ( !this.isMounted() ) {
            return;
        }
    },

    componentDidUpdate: function() {
        this.renderFrameContents();
    },
    componentWillUnmount: function() {
        React.unmountComponentAtNode( this.getDOMNode().contentDocument.body );
    }
});
