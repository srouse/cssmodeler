


var Detail = React.createClass({displayName: "Detail",

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
                        React.createElement("div", {className:  "Cmod-Detail__code__item " +
                            selected_class, 
                            onClick:  this.goto.bind( this , a) }, 
                            React.createElement("pre", null,  css_obj_item )
                        )
                    );
                }
            }

            html.push(
                React.createElement("div", {className: "Cmod-Detail__code"}, 
                     css_obj_html 
                )
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

                example += "<link rel='stylesheet' type='text/css' href='core.css'>";
                example += "<div class='exampleBox " + css_obj_class + "'>";
                example += "<div style='height: 15px;' contenteditable='true'>Content</div></div>";
            }else{
                example = "no element selected";
            }
        }




        return  React.createElement("div", {className: "Cmod-Detail"}, 

                     html, 

                    React.createElement("div", {className: "Cmod-Detail__preview"}, 
                        React.createElement(MagicFrame, {example:  example })
                    ), 

                    React.createElement("div", {className: "Cmod-Detail__close", 
                        onClick:  this.close}, "x")
                );
    }

});




var MagicFrame = React.createClass({displayName: "MagicFrame",
    render: function() {
        return React.createElement("iframe", {style: {border: 'none'}, 
                        className: "Cmod-Detail__preview__iframe"});
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




var StyleGuide = React.createClass({displayName: "StyleGuide",

    componentWillMount: function() {
        /*
        var me = this;
        RouteState.addDiffListeners(
    		["page"],
    		function ( route , prev_route ) {
                me.forceUpdate();
    		},
            "StyleGuide"
    	);
        */
    },

    componentWillUnmount: function(){
        // RouteState.removeDiffListenersViaClusterId( "StyleGuide" );
    },

    goto: function( type , id ){
        RS.merge({
            detail:id,
            type:type,
            detail_index:""+0
        });
    },

    getSchemeShortcut: function ( css_obj, base ) {
        var scheme = CSSModel.schemes[ css_obj.scheme ];
        if ( scheme ) {
            return scheme.shortcut.replace( "@base" , base );
        }else{
            return "no scheme found";
        }
    },

    getLeftColumn: function( group ){

        var atom,atom_html,col_left;
        atom_html = [];
        atom_html.push(
            React.createElement("div", {className: "Cmod-StyleGuide__column__header"}, 
                "Atoms"
            )
        );
        for ( var atom_name in group.atoms ) {
            atom = group.atoms[ atom_name ];

            atom_title = atom.selector;
            if ( atom.scheme ) {
                atom_title = this.getSchemeShortcut(
                                    atom,
                                    atom.base
                                );
            }
            if ( atom.variable ) {
                var variable = CSSModel.variables[ atom.variable ];
                atom_title = this.getSchemeShortcut(
                                    variable,
                                    atom.selector.replace( /\@var_name/g , variable.base )
                                );
            }

            atom_html.push(
                React.createElement("div", {className: "Cmod-StyleGuide__column__item", 
                    onClick:  this.goto.bind( this , "atom" , atom_name) }, 
                     atom_title 
                )
            );
        }

        if ( atom_html.length == 1 ) {
            atom_html = [];
        }

        col_left = [];
        col_left.push(
            React.createElement("div", {className: "Cmod-StyleGuide__column"}, 
                 atom_html 
            )
        );
        return col_left;
    },



    getRightColumn: function( group ){
        var scheme;

        var bases,base_html;
        base_html = [];
        base_html.push(
            React.createElement("div", {className: "Cmod-StyleGuide__column__header"}, 
                "Resets/Bases"
            )
        );
        for ( var base_name in group.bases ) {
            base = group.bases[ base_name ];
            base_html.push(
                React.createElement("div", {className: "Cmod-StyleGuide__column__item", 
                    onClick:  this.goto.bind( this , "base" , base_name) }, 
                     base.selector
                )
            );
        }
        if ( base_html.length == 1 ) {
            base_html = [];
        }

        var utilities,utility_html,utility_title;
        utility_html = [];
        utility_html.push(
            React.createElement("div", {className: "Cmod-StyleGuide__column__header"}, 
                "Utilities"
            )
        );
        for ( var utility_name in group.utilities ) {
            utility = group.utilities[ utility_name ];

            utility_title = utility.selector;
            if ( utility.scheme ) {
                scheme = CSSModel.schemes[ utility.scheme ];
                utility_title = this.getSchemeShortcut(
                                        utility,
                                        utility.base
                                    );
            }

            utility_html.push(
                React.createElement("div", {className: "Cmod-StyleGuide__column__item", 
                    onClick:  this.goto.bind( this , "utility" , utility_name) }, 
                     utility_title 
                )
            );
        }

        if ( utility_html.length == 1 ) {
            utility_html = [];
        }


        var col_right = [];
        col_right.push(
            React.createElement("div", {className: "Cmod-StyleGuide__column float-right"}, 
                 utility_html, 
                 base_html 
            )
        );
        return col_right;
    },

    render: function() {
        var html = [];
        var group,col_left,col_right;
        for ( var group_name in CSSModel.groups ) {
            group = CSSModel.groups[ group_name ];

            col_left = this.getLeftColumn( group );
            col_right = this.getRightColumn( group );

            html.push(
                React.createElement("div", {className: "Cmod-StyleGuide__group"}, 
                    React.createElement("div", {className: "Cmod-StyleGuide__group__title"}, 
                         group.title
                    ), 
                     col_left,  col_right 
                )
            );
        }

        return  React.createElement("div", {className: "Cmod-StyleGuide"}, 
                     html, 
                    React.createElement(Detail, null)
                );
    }

});
