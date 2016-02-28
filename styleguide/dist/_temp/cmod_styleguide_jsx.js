


var Detail = React.createClass({displayName: "Detail",

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
                return React.createElement("div", {className: "Cmod-Detail"}, "no obj applicable");
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

        return  React.createElement("div", {className: "Cmod-Detail"}, 

                     html, 

                    React.createElement("div", {className: "Cmod-Detail__preview"}, 
                        React.createElement(SimpleMagicFrame, {
                            example:  example, 
                            exampleSelector:  css_obj_selector })
                    ), 

                    React.createElement("div", {className: "Cmod-Detail__css"}, 
                        React.createElement("pre", null, "...")
                    ), 

                    React.createElement("div", {className: "Cmod-Detail__close", 
                        onClick:  this.close}, "x")
                );
    }

});




var SimpleMagicFrame = React.createClass({displayName: "SimpleMagicFrame",
    render: function() {
        return React.createElement("iframe", {style: {border: 'none'}, id: "the_iframe", 
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




var RuleCSS = React.createClass({displayName: "RuleCSS",


    componentDidMount: function() {
        var me = this;
        RouteState.addDiffListener(
    		"react",
    		function ( route , prev_route ) {
                me.forceUpdate();
    		},
            "rule_preview"
    	);

        $(".ruleDetail_textarea").each( function () {
            $(this).height( $(this)[0].scrollHeight );
        });

        if ( PR ) { PR.prettyPrint(); }
    },

    componentWillUnmount: function(){
        RouteState.removeDiffListenersViaClusterId( "rule_preview" );
    },

    componentDidUpdate: function () {
        if ( PR ) { PR.prettyPrint(); }
    },

    getCSSStub: function ( rule , indents , parent_selector ) {

        // ignore it if it is a catch all...
        if ( rule.name.indexOf( "*" ) != -1 )
            return "";

        var comp_css = "",rule_selector;
        if ( !parent_selector ) {
            rule_selector = rule.raw_selector;
        }else{
            rule_selector = rule.raw_selector.replace( parent_selector , "&" );
        }

        comp_css += new Array( indents + 1 ).join( "\t" );
        comp_css += rule_selector + " {\n\n";
        var child_rule;
        for ( var i=0; i<rule.children.length; i++ ) {
            child_rule = rule.children[i];
            comp_css += this.getCSSStub( child_rule , indents+1 , rule.raw_selector );
        }
        for ( var i=0; i<rule.states.length; i++ ) {
            child_rule = rule.states[i];
            comp_css += this.getCSSStub( child_rule , indents+1 , rule.raw_selector );
        }
        comp_css += new Array( indents + 1 ).join( "\t" );
        comp_css += "}\n\n";

        return comp_css;
    },


    render: function() {

        var rule = this.props.rule;

        if ( !rule ) {
            return React.createElement("div", null, "no rule found");
        }


        var comp_css = this.getCSSStub( rule , 0 );


        return  React.createElement("div", {className: "ruleCSS"}, 
                    React.createElement("div", {className: "ruleDetail_code"}, 
                        React.createElement("div", {className: "ruleDetail_title"}, "CSS"), 
                        React.createElement("div", {className: "ruleDetail_codeLine"}, 
                            React.createElement("pre", {className: "prettyprint lang-css"}, 
                                 comp_css 
                            )
                        )
                    )
                );
    }

});



var RuleDetail = React.createClass({displayName: "RuleDetail",

    getInitialState: function(){
        var rule_uuid = RouteState.route.rule;
        if (
            !rule_uuid
            || rule_uuid == ""
        ) {
            rule_uuid = RouteState.route.tree;
        }

        return {
            tree_rule_uuid:RouteState.route.tree,
            rule_uuid:rule_uuid,
            tag:RouteState.route.tag
        };
    },

    componentDidMount: function() {
        var me = this;
        RouteState.addDiffListener(
    		"tree",
    		function ( route , prev_route ) {
                me.setState({
                    tree_rule_uuid:route.tree
                });
    		},
            "rule_detail"
    	);

        RouteState.addDiffListener(
    		"tag",
    		function ( route , prev_route ) {
                me.setState({
                    tag:route.tag
                });
    		},
            "rule_detail"
    	);

        RouteState.addDiffListener(
    		"detailTab",
    		function ( route , prev_route ) {
                me.forceUpdate();
    		},
            "rule_detail"
    	);

        var me = this;
        RouteState.addDiffListener(
    		"rule",
    		function ( route , prev_route ) {
                var rule_uuid = route.rule;
                if (
                    !rule_uuid
                    || rule_uuid == ""
                ) {
                    rule_uuid = me.state.tree_uuid;
                }

                me.setState({
                    rule_uuid:rule_uuid
                });
    		},
            "rule_detail"
    	);
    },

    componentWillUnmount: function(){
        RouteState.removeDiffListenersViaClusterId( "rule_detail" );
    },

    closeDetail: function () {
        RouteState.merge(
            {
                rule:"",detailTab:""
            }
        );
    },

    close: function () {
        RouteState.merge({tree:"",tag:"",rule:"",detailTab:"",rulestate:""});
    },

    toRoot: function () {
        RouteState.merge({rule:""});
    },

    render: function() {

        if ( this.state.tag ) {
            var rules_by_tag = this.props.css_info.tags_hash[this.state.tag];

            var tree_rule = {
                name:this.state.tag + " (tag)",
                children:rules_by_tag,
                type:"tag"
            }
        }else{
            var tree_rule =  this.props.css_info.uuid_hash[
                            this.state.tree_rule_uuid
                        ];

            if ( !tree_rule )
                tree_rule = {name:"no rule",children:[]};
        }

        var rule =  this.props.css_info.uuid_hash[
                        this.state.rule_uuid
                    ];

        if ( !rule ) {
            rule = tree_rule;
        }

        var content = "";
        if ( RouteState.route.detailTab == "html" ) {
            content = React.createElement(RuleHTML, {
                        css_info:  this.props.css_info, 
                        rule_uuid:  tree_rule.rule_uuid, 
                        rule:  tree_rule });
        }else if ( RouteState.route.detailTab == "css" ) {
            content = React.createElement(RuleCSS, {
                        css_info:  this.props.css_info, 
                        rule_uuid:  tree_rule.rule_uuid, 
                        rule:  tree_rule });
        }else if ( RouteState.route.detailTab == "overview" ) {
            content = React.createElement(RuleOverview, {
                        css_info:  this.props.css_info, 
                        rule:  rule });
        }else if ( RouteState.route.detailTab == "example" ) {
            content = React.createElement(RulePreview, {
                        css_info:  this.props.css_info, 
                        rule_uuid:  this.state.rule_uuid, 
                        rule:  rule });
        }

        return  React.createElement("div", {className: "ruleDetail"}, 

                    React.createElement("div", {className: "ruleDetail_header"}, 
                        React.createElement("div", {className: "ruleDetail_title"}, 
                            React.createElement("div", {className: "ruleDetail_close", 
                                onClick:  this.close}, "< back")
                            /*<div className="ruleDetail_showTree"
                                onClick={ this.closeDetail }></div> */ 
                        )
                    ), 

                    React.createElement("div", {className: "ruleDetail_contentContainer"}, 
                         content 
                    ), 

                    React.createElement("div", {className: "ruleDetail_ruleNestingContainer"}, 
                        React.createElement(RuleNesting, {
                            css_info:  this.props.css_info, 
                            rule:  tree_rule })
                    ), 

                    React.createElement("div", {className: "ruleDetail_ruleNavPlaceholder"}, 
                        React.createElement(RuleDetailNav, {
                            css_info:  this.props.css_info, 
                            rule_uuid:  this.state.rule_uuid, 
                            rule:  rule })
                    )

                );
    }

});


var RuleDetailNav = React.createClass({displayName: "RuleDetailNav",

    gotoRule: function ( rule_uuid ) {
        RouteState.merge({rule:rule_uuid});
    },

    viewRuleDetailViaSelector: function ( selector ) {
        var rule = this.props.css_info.selector_hash[selector];
        if ( rule ) {
            this.viewRuleDetail( rule.uuid );
        }
    },

    viewRuleDetail: function ( uuid ) {
        // want the tree not the rule....
        var parent = findTopMostParent( uuid , this.props.css_info );
        RouteState.toggle(
            {
                tree:parent.uuid,
                rule:uuid
            },{
                tree:"",
                rule:""
            }
        );
    },

    change_tab: function ( tab_name ) {
        RouteState.merge(
            {detailTab:tab_name}
        );
    },

    closeDetail: function () {
        RouteState.merge(
            {
                rule:"",detailTab:""
            }
        );
    },

    render: function() {
        var rule = this.props.rule;

        if ( !rule.name )
            return React.createElement("div", null, "no rule");

        var name = rule.name;
        if ( rule.direct_child_selector ) {
            name = "> " + name;
        }

        return  React.createElement("div", {className: "ruleDetailNav"}, 
                    React.createElement("div", {className: "ruleDetailNav_title"}, 
                        React.createElement("div", {className: "ruleDetailNav_titleText"}, 
                             name 
                        ), 
                        React.createElement("div", {className: "ruleDetailNav_typeIcon"}, 
                            React.createElement(TypeIcon, {rule:  rule })
                        )
                    ), 

                    React.createElement("div", {className: "ruleDetail_headerNav"}, 
                        React.createElement("div", {className: "ruleDetail_item_example", 
                            onClick: 
                                this.change_tab.bind( this , "example")
                            }, 
                            "example"
                        ), 
                        React.createElement("div", {className: "ruleDetail_item_html", 
                            onClick: 
                                this.change_tab.bind( this , "html")
                            }, 
                            "html stub"
                        ), 
                        React.createElement("div", {className: "ruleDetail_item_css", 
                            onClick: 
                                this.change_tab.bind( this , "css")
                            }, 
                            "css stub"
                        )
                    )
                );
    }

});


var RuleHTMLOrig = React.createClass({displayName: "RuleHTMLOrig",


    componentDidMount: function() {
        var me = this;
        RouteState.addDiffListener(
    		"react",
    		function ( route , prev_route ) {
                me.forceUpdate();
    		},
            "rule_preview"
    	);

        $(".ruleDetail_textarea").each( function () {
            $(this).height( $(this)[0].scrollHeight );
        });
    },

    componentWillUnmount: function(){
        RouteState.removeDiffListenersViaClusterId( "rule_preview" );
    },

    processSelectorIntoHTML: function ( selector ) {
        var rule_arr = selector.split(" ");
        var new_rule_arr = [];
        for ( var i=0; i<rule_arr.length; i++ ) {
            new_rule_arr.push( rule_arr[i] );
            new_rule_arr.push( React.createElement("br", null) );
        }
        return new_rule_arr;
    },

    gotoRule: function ( rule_uuid ) {
        RouteState.merge({tree:rule_uuid});
    },

    toReact: function () {
        RouteState.toggle({react:"react"},{react:""});
    },

    componentDidUpdate: function () {
        $(".ruleDetail_textarea").each( function () {
            $(this).height( 10 );
            $(this).height( $(this)[0].scrollHeight );
        });
    },

    getCSSString: function ( rule ) {

        if ( !rule || !rule.metadata || !rule.metadata.pointers )
            return React.createElement("div", null, "no info");

        var css_str = [];


        css_str.push(
            React.createElement("div", {className: "ruleDetail_title"}, "Full Selector")
        );
        css_str.push(
            React.createElement("div", {className: "ruleDetail_codeLine", 
                key:  "description" }, 
                React.createElement("span", {className: "ruleDetail_variableName"}, 
                     rule.selector
                )
            )
        );


        if (
            rule.metadata.description &&
            $.trim( rule.metadata.description ).length > 0
        ) {
            css_str.push(
                React.createElement("div", {className: "ruleDetail_title"}, "Description")
            );
            for ( var d=0; d<rule.metadata.description.length; d++ ) {
                css_str.push(
                    React.createElement("div", {className: "ruleDetail_codeLine", 
                        key:  "description" }, 
                        React.createElement("pre", null,  rule.metadata.description[d].content)
                    )
                );
            }
        }


        css_str.push(
            React.createElement("div", {className: "ruleDetail_title"}, "Based On")
        );

        if (
            rule.metadata.pointers.length == 0 &&
            rule.metadata.extends.length == 0
        ) {
            css_str.push(
                React.createElement("div", {className: "ruleDetail_noneFound"}, "None")
            );
        }

        var pointers = rule.metadata.pointers;
        for ( var p=0; p<pointers.length; p++ ) {
            css_str.push(
                React.createElement("div", {className: "ruleDetail_codeLine", 
                    key:  "pointer_" + p}, 
                    React.createElement("span", {className: "ruleDetail_variableName"},  pointers[p] )
                )
            );
        }
        var _extends = rule.metadata.extends;
        for ( var p=0; p<_extends.length; p++ ) {
            css_str.push(
                React.createElement("div", {className: "ruleDetail_codeLine", 
                    key:  "extends_" + p}, 
                    React.createElement("span", {className: "ruleDetail_variableName"},  _extends[p] )
                )
            );
        }




        css_str.push(
            React.createElement("div", {className: "ruleDetail_title"}, "Local Declarations")
        );
        if ( rule.metadata && rule.metadata.local ) {
            var local = rule.metadata.local;
            for ( var name in local ) {
                css_str.push(
                    React.createElement("div", {className: "ruleDetail_codeLine", 
                        key:  "local_" + name}, 
                        React.createElement("span", {className: "ruleDetail_variableName"}, 
                             name ), ": ",  local[name], ";"
                    )
                );
            }
        }


        if ( rule.pseudos && rule.pseudos.length > 0 ) {
            css_str.push(
                React.createElement("div", {className: "ruleDetail_title"}, "Pseudo Selectors")
            );
            var pseudos = rule.pseudos,pseudo;
            for ( var p=0; p<pseudos.length; p++ ) {
                pseudo = pseudos[p];
                css_str.push(
                    React.createElement("div", {className: "ruleDetail_codeLine", 
                        key:  "pseudo_" + p}, 
                        React.createElement("span", {className: "ruleDetail_selectorSpan"}, 
                             pseudo.selector
                        ), " ",  "{" 
                    )
                );
                var local = pseudo.metadata.local;
                for ( var name in local ) {
                    css_str.push(
                        React.createElement("div", {className: "ruleDetail_codeLine indent", 
                            key:  "local_pseudo_" + name}, 
                            React.createElement("span", {className: "ruleDetail_variableName"}, 
                                 name ), ": ",  local[name], ";"
                        )
                    );
                }
                css_str.push(
                    React.createElement("div", {className: "ruleDetail_codeLine", 
                        key:  "pseudo_close" + p}, 
                         "}" 
                    )
                );
            }
        }


        if ( rule.states && rule.states.length > 0 ) {
            css_str.push(
                React.createElement("div", {className: "ruleDetail_title"}, "States")
            );
            var states = rule.states,state;
            for ( var p=0; p<states.length; p++ ) {
                state = states[p];
                css_str.push(
                    React.createElement("div", {className: "ruleDetail_codeLine", 
                        key:  "state_" + p}, 
                        React.createElement("span", {className: "ruleDetail_selectorSpan"}, 
                             state.selector
                        ), " ",  "{" 
                    )
                );
                var local_obj = state.metadata.local;
                for ( var name in local_obj ) {
                    css_str.push(
                        React.createElement("div", {className: "ruleDetail_codeLine indent", 
                            key:  "local_state_" + p + "_" + name}, 
                            React.createElement("span", {className: "ruleDetail_variableName"}, 
                                 name ), ": ",  local_obj[name], ";"
                        )
                    );
                }
                css_str.push(
                    React.createElement("div", {className: "ruleDetail_codeLine", 
                        key:  "state_close" + p}, 
                         "}" 
                    )
                );
            }
        }

        css_str.push(
            React.createElement("div", {className: "ruleDetail_title"}, 
                "Example HTML", 
                React.createElement("div", {className: "ruleDetail_titleButton", 
                    onClick:  this.toReact}, "React")
            )
        );

        var html_obj = RuleUtil.findRuleExample( rule , this.props.css_info , true );
        var html = html_obj.html;
        if ( RouteState.route.react == "react" ) {
            html = html.replace( /class=/gi , "className=");
        }
        css_str.push(
            React.createElement("div", {className: "ruleDetail_codeLine", 
                key:  "local_html" }, 
                React.createElement("pre", null, React.createElement("code", null,  vkbeautify.xml( html , "	") ))
            )
        );


        return css_str;
    },

    render: function() {
        var rule =  this.props.css_info.uuid_hash[
                        this.props.rule_uuid
                    ];

        var rule = this.props.rule;

        if ( !rule ) {
            return React.createElement("div", null);
        }



        var cssStr = this.getCSSString( rule );
        return  React.createElement("div", {className: "ruleCSS"}, 
                    React.createElement("div", {className: "ruleDetail_code"}, 
                         cssStr 
                    )
                );
    }

});


var RuleHTML = React.createClass({displayName: "RuleHTML",


    componentDidMount: function() {
        var me = this;
        RouteState.addDiffListener(
    		"react",
    		function ( route , prev_route ) {
                me.forceUpdate();
    		},
            "rule_preview"
    	);

        $(".ruleDetail_textarea").each( function () {
            $(this).height( $(this)[0].scrollHeight );
        });

        if ( PR ) { PR.prettyPrint(); }
    },

    componentWillUnmount: function(){
        RouteState.removeDiffListenersViaClusterId( "rule_preview" );
    },

    componentDidUpdate: function () {
        if ( PR ) { PR.prettyPrint(); }
    },


    render: function() {

        var rule = this.props.rule;

        if ( !rule ) {
            return React.createElement("div", null, "no rule found");
        }

        var compName = rule.name.replace( /\./g , "" );

        var comp_html = "No example";
        if ( rule.type == "tagged_rule" ) {
            var sub_comp_info = RuleUtil.replaceCompsFormated(
                rule , rule.metadata.example, [] , this.props.css_info
            );
            comp_html = sub_comp_info.formatted_html;//sub_comp_info.html.replace( /<\/div>/g , "</div>\n" );
        }

        return  React.createElement("div", {className: "ruleHTML"}, 
                    React.createElement("div", {className: "ruleDetail_code"}, 
                        React.createElement("div", {className: "ruleDetail_title"}, "HTML"), 
                        React.createElement("div", {className: "ruleDetail_codeLine"}, 
                            React.createElement("pre", {className: "prettyprint lang-html"}, 
                                 comp_html.trim() 
                            )
                        )
                    )
                );
    }

});



var RuleNesting = React.createClass({displayName: "RuleNesting",

    render: function() {
        var rule = this.props.rule;
        if ( !rule )
            return React.createElement("div", null, "no rule found");

        var content =
            React.createElement(RuleNestingColumn, React.__spread({},  this.props, 
                {rule:  rule, index:  0 }));

        return  React.createElement("div", {className: "ruleNesting"}, 
                     content 
                );
    }

});



var RuleNestingColumn = React.createClass({displayName: "RuleNestingColumn",

    maxChildHeight: function ( rule , is_vertical , max_height ) {
        if ( !is_vertical )
            is_vertical = false;

        if ( !rule )
            return 0;

        if ( !max_height )
            max_height = 1;

        if ( !is_vertical ) {
            max_height += Math.max( 0 , rule.children.length-1 );
        }else{
            max_height += Math.max( 0 , rule.children.length );
        }

        var child;
        var child_total = rule.children.length;
        for ( var i=0; i<child_total; i++ ) {
            child = rule.children[i];
            max_height = this.maxChildHeight( child , is_vertical , max_height );
        }

        return max_height;
    },

    gotoRule: function ( rule_uuid ) {
        var detailTab = "example";
        if ( RouteState.route.detailTab ) {
            detailTab = RouteState.route.detailTab;
        }

        RouteState.merge(
            {
                rule:rule_uuid,
                detailTab:detailTab,
                rulestate:""
            }
        );
    },

    render: function() {
        // want the parents as well...
        var rule = this.props.rule;

        if ( !rule )
            return React.createElement("div", null, "no rule");

        var child;
        var children = [];
        var total = rule.children.length;
        var is_last,has_children;
        for ( var i=0; i<total; i++ ) {
            child = rule.children[i];
            //if ( child.name.indexOf(".") != -1 ) {
                children.push(
                    React.createElement(RuleNestingColumn, React.__spread({},  this.props, 
                        {key:  "ruleNestingColumn_" + child.uuid, 
                        rule:  child, index:  this.props.index+1}))
                );
            //}

        }
        var last_child = rule.children[total-1];

        // HORIZONTAL TREE MAX
        var max_height = this.maxChildHeight( rule );
        var last_child_height = this.maxChildHeight( last_child );
        if ( rule.children.length > 1 ) {
            max_height -= last_child_height-1;
        }
        if ( max_height == 1) {
            max_height = 0;
        }
        if ( rule.children.length == 1 ) {
            max_height = 0;
        }

        // STACKED MAX
        var stack_max_height = this.maxChildHeight( rule , true );
        var last_child_stacked_height = this.maxChildHeight( last_child , true );
        stack_max_height -= last_child_stacked_height;
        if (
            rule.children.length == 0
        ) {
            stack_max_height = 0;
        }

        var extra_class = ( rule.children.length == 0 ) ?
                            " no_children" : "";

        var rule_title = "";
        var extra_title_class = "";
        if ( this.props.index == 0 ) {
            // extra_class += " first_one";
            // extra_title_class += " first_title";
        }

        if ( rule.uuid == RouteState.route.rule )
            extra_title_class += " selected";

        var name = rule.name;
        if ( rule.direct_child_selector ) {
            name = "> " + name;
        }

        rule_title =
            React.createElement("div", {className:  "ruleNestingColumn_title" + extra_title_class, 
                onClick: 
                    this.gotoRule.bind( this , rule.uuid)
                }, 
                React.createElement("div", {className: "ruleNesting_titleText"}, 
                     name 
                ), 
                React.createElement("div", {className: "ruleNesting_typeIcon"}, 
                    React.createElement(TypeIcon, {rule:  rule })
                )
            );


        return  React.createElement("div", {className:  "ruleNestingColumn" + extra_class, 
                    key:  rule.uuid +"-"+ rule.children.length}, 

                    React.createElement("div", {className:  "ruleNestingColumn_line" + extra_class, 
                        style: {height:
                            (( max_height ) * 30 ) + "px"
                        }}
                    ), 

                    React.createElement("div", {className: 
                            "ruleNestingColumn_stackedLine" + extra_class, 
                        
                        style: {height:
                            (( stack_max_height ) * 30 ) + "px"
                        }}
                    ), 

                    React.createElement("div", {className: 
                            "ruleNestingColumn_lineCover" + extra_class
                        }
                    ), 

                     rule_title, 
                    React.createElement("div", {className: 
                            "ruleNestingColumn_children" + extra_class
                        }, 
                         children 
                    ), 

                    React.createElement("div", {style: {clear:"both"}})
                );
    }

});



var RuleOverview = React.createClass({displayName: "RuleOverview",

    gotoRule: function ( rule_uuid ) {
        RouteState.merge({rule:rule_uuid});
    },

    viewRuleDetail: function ( uuid ) {
        // want the tree not the rule....
        var parent = findTopMostParent( uuid , this.props.css_info );
        RouteState.toggle(
            {
                tree:parent.uuid,
                rule:uuid
            }
        );
    },

    viewRuleDetailViaSelector: function ( selector ) {
        var rule = this.props.css_info.selector_hash[selector];
        if ( rule ) {
            this.viewRuleDetail( rule.uuid );
        }
    },

    render: function() {
        var rule = this.props.rule;

        var children = [];
        var parents = [];
        var states = [];
        var relationships = [];
        var duplicates = [];

        // CHILDRENS
        if ( rule.children ) {
            for ( var r=0; r<rule.children.length; r++ ) {
                var child = rule.children[r];
                children.push(
                    React.createElement("div", {className: "ruleOverview_subName", 
                        key:  "ruleoverview_" + child.uuid, 
                        onClick: 
                            this.gotoRule.bind( this , child.uuid)
                        }, 
                         child.name
                    )
                );

            }
        }

        // PARENTs (SELECTOR)
        var parent = rule;
        var count = 0;
        while ( parent.parent_rule_uuid ) {
            parent = this.props.css_info.uuid_hash[ parent.parent_rule_uuid ];
            if ( parent ) {
                parents.unshift(
                    React.createElement("div", {className: "ruleOverview_subName", 
                        key:  "ruleoverview_parent_" + parent.uuid, 
                        onClick: 
                            this.gotoRule.bind( this , parent.uuid)
                        }, 
                         parent.name
                    )
                );
            }else{
                parent = {parent_rule_uuid:false};
            }
        }
        parents.push(
            React.createElement("div", {className: "ruleOverview_subName", 
                key:  "ruleoverview_rule_" + rule.uuid, 
                onClick: 
                    this.gotoRule.bind( this , rule.uuid)
                }, 
                 rule.name
            )
        );


        var parent_back =
            React.createElement("div", {
                className: "ruleOverview_parentPlaceholder"}
            );

        if ( rule.parent_rule_uuid ) {
            parent = this.props.css_info.uuid_hash[ rule.parent_rule_uuid ];
            parent_back =
                React.createElement("div", {className: "ruleOverview_parentLink", 
                    onClick: 
                        this.gotoRule.bind(
                            this , rule.parent_rule_uuid
                        )
                    }
                );
        }

        // STATES
        if ( rule.states ) {
            for ( var r=0; r<rule.states.length; r++ ) {
                states.push(
                    React.createElement("div", {className: "ruleOverview_stateSubName", 
                        key:  "ruleoverview_state_" + rule.states[r].uuid, 
                        title:  rule.states[r].selector}, 
                         rule.states[r].selector
                    )
                );
            }
        }

        // RELATIONSHIPS
        if ( rule.relationships ) {
            for ( var r=0; r<rule.relationships.length; r++ ) {
                var relationship =  this.props.css_info.selector_hash[
                                        rule.relationships[r]
                                    ];
                if ( relationship ) {
                    relationships.push(
                        React.createElement("div", {className: "ruleOverview_subName", 
                            key:  "ruleoverview_relation_" + relationship.uuid, 
                            onClick: 
                                this.viewRuleDetail.bind( this , relationship.uuid), 
                            title:  relationship.selector}, 
                             relationship.name
                        )
                    );
                }
            }
        }

        // DUPS
        var name_rule = this.props.css_info.name_hash[ rule.name ];
        if ( name_rule && name_rule.is_duplicate ) {
            var unique_selectors = {};
            for ( var r=0; r<name_rule.source.length; r++ ) {
                var child = name_rule.source[r];
                if ( !unique_selectors[child.selector] ) {
                    unique_selectors[child.selector] = true;
                    duplicates.push(
                        React.createElement("div", {className: "ruleOverview_subName", 
                            key:  "ruleoverview_dup_" + child.uuid, 
                            onClick: 
                                this.viewRuleDetailViaSelector.bind(
                                    this , child.selector
                                ), 
                            title:  child.selector}, 
                             child.selector
                        )
                    );
                }
            }
        }

        return  React.createElement("div", {className: "ruleOverview"}, 
                    React.createElement("div", {className: "ruleOverview_context"}, 
                        React.createElement("div", {className: "ruleOverview_subTitle"}, 
                            "full selector"
                        ), 
                         parents, 
                        React.createElement("div", {className: "ruleOverview_subTitle"}, 
                            "children"
                        ), 
                         children, 
                        React.createElement("div", {className: "ruleOverview_subTitle"}, 
                            "states"
                        ), 
                         states, 
                        React.createElement("div", {className: "ruleOverview_subTitle"}, 
                            "relationships"
                        ), 
                         relationships, 
                        React.createElement("div", {className: "ruleOverview_subTitle"}, 
                            "duplicate names"
                        ), 
                         duplicates, 
                        React.createElement("div", {className: "list_bottom_padding"})
                    )
                );
    }

});


var RulePreview = React.createClass({displayName: "RulePreview",

    componentDidMount: function() {
        var me = this;
        RouteState.addDiffListeners(
    		["rulestate","bg","outline"],
    		function ( route , prev_route ) {
                me.refreshDisplayedState();
    		},
            "rule_preview"
    	);

        this.refreshDisplayedState();
    },

    componentWillUnmount: function(){
        RouteState.removeDiffListenersViaClusterId( "rule_preview" );
    },

    refreshDisplayedState: function () {
        var state,state_name;
        var rule = this.props.rule;

        if ( !rule )
            return;

        for ( var s=0; s<rule.states.length; s++ ) {
            state = rule.states[s];
            if ( RouteState.route.rulestate ) {
                if ( s == RouteState.route.rulestate-1 ) {
                    $( ".state_" + s ).addClass("selected");
                }else{
                    $( ".state_" + s ).removeClass("selected");
                }
            }else{
                $( ".state_" + s ).removeClass("selected");
            }
        }

        if ( RouteState.route.bg ) {
            $( ".rulePreview_toggleBGColor" ).addClass("selected");
        }else{
            $( ".rulePreview_toggleBGColor" ).removeClass("selected");
        }

        if ( RouteState.route.outline == "outline" ) {
            $( ".rulePreview_outline" ).addClass("selected");
        }else{
            $( ".rulePreview_outline" ).removeClass("selected");
        }

    },

    toggleBGColor: function () {
        RouteState.toggle({
            bg:"white"
        },{
            bg:""
        });
    },

    outlineElement: function () {
        RouteState.toggle({
            outline:"outline"
        },{
            outline:""
        });
    },

    hardRefresh: function () {
        this._magicFrame.hardRefresh();
    },

    changeBackgroundColor: function () {
        RouteState.toggle({
            bg:"#fff"
        },{
            bg:""
        });
    },

    changeState: function ( index ) {
        RouteState.toggle({
            rulestate:index
        },{
            rulestate:""
        });
    },

    showHTML: function () {
        var example = this.findRuleExample( this.props.rule );
    },

    componentDidUpdate: function() {
        var rule = this.props.rule;
        var rule_dom = $(".rulePreview_iframe").contents().find( rule.selector );

        if (
            rule_dom.css("display") == "none" ||
            rule_dom.css("visibility") == "hidden"
        ) {
            // changing state would be circular...
            $(".rulePreview_visibility").removeClass("visible");
        }else{
            $(".rulePreview_visibility").addClass("visible");
        }

        this.refreshDisplayedState();
    },


    getRuleHTML: function ( rule ) {
        var html = "";

        var example = "No example";
        if ( rule.type == "tagged_rule" ) {
            var sub_comp_info = RuleUtil.replaceComps(
                rule , rule.metadata.example, [] , this.props.css_info
            );
            example = sub_comp_info.html;
        }

        html += "<link rel='stylesheet' type='text/css' href='../core.css?"+ Math.random() +"'>";
        // html += "<link rel='stylesheet' type='text/css' href='../components.css?"+ Math.random() +"'>";
        html += example;

        return html;
    },

    render: function() {
        var rule = this.props.rule;

        if ( !rule )
            return React.createElement("div", null);

        example = this.getRuleHTML( rule );

        this.ele_border = false;

        var states = [],state,state_class;

        if ( rule.states && rule.states.length > 0 ) {

            /*states.push(
                <div className="rulePreview_navLabel"
                    key={ "rulePreview_navLabel" }>
                    states
                </div>
            );*/

            for ( var s=0; s<rule.states.length; s++ ) {
                state = rule.states[s];
                state_class = "rulePreview_state state_" + s;

                states.push(
                    React.createElement("div", {className:  state_class, 
                            title:  state.selector, 
                            key:  "rulePreview_state_" + state.raw_selector, 
                            onClick: 
                                this.changeState.bind( this , s+1+"")
                            }, 
                        "--",  state.selector.split("--")[1] 
                    ) );
            }

            states.push(
                React.createElement("div", {className: "rulePreview_stateApplied", 
                    key:  "rulePreview_stateApplied" }
                )
            );
        }

        return  React.createElement("div", {className: "rulePreview"}, 
                    React.createElement("div", {className: "rulePreview_stage"}, 
                        React.createElement(MagicFrame, {ref: (c) => this._magicFrame = c, 
                            example:  example, rule:  rule })
                    ), 
                    React.createElement("div", {className: "rulePreview_nav"}, 
                         states, 
                        React.createElement("div", {className: "rulePreview_toggleBGColor", 
                            onClick:  this.toggleBGColor}, 
                            "bg color"
                        ), 
                        React.createElement("div", {className: "rulePreview_outline", 
                            onClick:  this.outlineElement}, 
                            "outline"
                        ), 
                        React.createElement("div", {className: "rulePreview_outline", 
                            onClick:  this.hardRefresh}, 
                            "refresh"
                        )
                    )
                );
    }

});

var MagicFrame = React.createClass({displayName: "MagicFrame",
    render: function() {
        return React.createElement("iframe", {style: {border: 'none'}, 
                        className: "rulePreview_iframe"});
    },

    componentDidMount: function() {
        var me = this;
        RouteState.addDiffListeners(
    		["outline","bg","rulestate"],
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

    hardRefresh: function () {
        var iframe = this.getDOMNode();
        iframe.contentWindow.location.reload(true);

        setTimeout( this.renderFrameContents , 1000 );
    },

    postProcessElement: function () {
        if ( !this.isMounted() ) {
            return;
        }

        var rule = this.props.rule;
        var doc = this.getDOMNode().contentDocument;

        var rule_dom = $(doc).contents().find( rule.selector );

        if ( RouteState.route.outline == "outline" ) {
            rule_dom.css("border", "1px solid #f00" );
        }else{
            rule_dom.css( "border", "" );
        }

        // make sure it is always visible....
        //rule_dom.css("display", "block" );
        if ( rule_dom.css("display") == "none" ) {
            rule_dom.css("display", "block" );
        }

        var frame_bg = "#eee";
        if ( RouteState.route.bg == "white" ) {
            frame_bg = "#fff";
        }

        var body = $(doc).contents().find( "body" );
        body.css("background-color", frame_bg );

        //need to remove previous state without refresh entire page...
        if (
            RouteState.prev_route.rulestate
            && rule.states
            && rule.states.length > 0
        ) {
            var selector =  rule.states[
                                    RouteState.prev_route.rulestate-1
                                ].selector;


            var target_dom = $(doc).contents().find( rule.selector );
            target_dom.removeClass( selector.replace(".","") );
        }

        if ( RouteState.route.rulestate ) {
            var selector =  rule.states[
                                    RouteState.route.rulestate-1
                                ].selector;

            var target_dom = $(doc).contents().find( rule.selector );
            target_dom.addClass( selector.replace(".","") );
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
        var me = this;
        RouteState.addDiffListeners(
    		["page"],
    		function ( route , prev_route ) {
                me.forceUpdate();
    		},
            "StyleGuide"
    	);
    },

    componentWillUnmount: function(){
        RouteState.removeDiffListenersViaClusterId( "StyleGuide" );
    },

    goto: function( type , id ){
        RS.merge({
            detail:id,
            type:type,
            detail_index:""+0
        });
    },

    getSchemeShortcut: function ( css_obj, selector , base ) {
        var scheme = CSSModel.schemes[ css_obj.scheme ];
        var shortcut = false;

        if ( scheme )
            shortcut = scheme.shortcut;

        if ( css_obj.shortcut )
            shortcut = css_obj.shortcut;

        if ( base ) {
            selector = selector.replace( /\@var_name_no_base/g , "" );
            selector = selector.replace( /\@var_name/g , base );
        }else{
            selector = selector.replace( /\@var_name/g , "" );
        }

        if ( shortcut )
            return shortcut.replace( "@base" , selector );

        return "no scheme found";
    },

    getLeftColumn: function( group ){

        var atom,atom_html,col_left;
        atom_html = [];
        atom_html.push(
            React.createElement("div", {className: "Cmod-StyleGuide__column__header"}, 
                "Atoms"
            )
        );

        // for ( var atom_name in group.atoms ) {
        var sub_group;
        for ( var sub_group_name in group.sub_groups ) {
            sub_group = group.sub_groups[ sub_group_name ];

            if (
                sub_group.atoms.length > 0 &&
                sub_group.title != "uncategorized"
            ) {
                atom_html.push(
                    React.createElement("div", {className: "Cmod-StyleGuide__column__subHeader"}, 
                         sub_group.title
                    )
                );
            }

            for ( var a=0; a<sub_group.atoms.length; a++ ) {

                atom = sub_group.atoms[ a ];

                atom_title = atom.selector;
                if ( atom.scheme ) {
                    atom_title = this.getSchemeShortcut(
                                        atom,
                                        atom.selector,
                                        atom.base
                                    );
                }

                if ( atom.variable ) {
                    var variable = CSSModel.variable_lookup[ atom.variable ];
                    atom_title = this.getSchemeShortcut(
                                        variable,
                                        atom.selector,
                                        variable.base
                                    );
                }

                atom_html.push(
                    React.createElement("div", {className: "Cmod-StyleGuide__column__item", 
                        key:  atom.name, 
                        onClick:  this.goto.bind( this , "atom" , atom.name), 
                        dangerouslySetInnerHTML:  {__html:atom_title} }
                    )
                );
            }
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

    getVariableList: function( group ){

        var scheme;

        var variables,utility_html,variable_title;
        variable_html = [];
        variable_html.push(
            React.createElement("div", {className: "Cmod-StyleGuide__column__header"}, 
                "Variables"
            )
        );

        //for ( var variable_name in group.variables ) {
        for ( var a=0; a<group.variables.length; a++ ) {
            variable = group.variables[ a ];

            if ( variable.ignore_variable === true ) {
                continue;
            }

            variable_title = "<em>" + variable.selector + "</em>";
            if ( variable.scheme ) {
                scheme = CSSModel.schemes[ variable.scheme ];
                variable_title = this.getSchemeShortcut(
                                        variable,
                                        variable.base
                                    );
            }

            variable_html.push(
                React.createElement("div", {className: "Cmod-StyleGuide__column__item", 
                    key:  variable.name, 
                    onClick:  this.goto.bind( this , "variable" , variable.name), 
                    dangerouslySetInnerHTML:  {__html:variable_title} }
                )
            );
        }

        if ( variable_html.length == 1 ) {
            variable_html = [];
        }

        return variable_html;
    },

    getRightColumn: function( group ){
        var scheme;

        var utilities,utility_html,utility_title;
        utility_html = [];
        utility_html.push(
            React.createElement("div", {className: "Cmod-StyleGuide__column__header"}, 
                "Utilities"
            )
        );

        // for ( var utility_name in group.utilities ) {
        for ( var u=0; u<group.utilities.length; u++ ) {
            utility = group.utilities[ u ];

            utility_title = "<em>" + utility.selector + "</em>";
            if ( utility.scheme ) {
                scheme = CSSModel.schemes[ utility.scheme ];
                utility_title = this.getSchemeShortcut(
                                        utility,
                                        utility.base
                                    );
            }

            utility_html.push(
                React.createElement("div", {className: "Cmod-StyleGuide__column__item", 
                    key:  utility.name, 
                    onClick:  this.goto.bind( this , "utility" , utility.name), 
                    dangerouslySetInnerHTML:  {__html:utility_title} }
                )
            );
        }

        if ( utility_html.length == 1 ) {
            utility_html = [];
        }



        var variable_html = this.getVariableList( group );


        var col_right = [];
        col_right.push(
            React.createElement("div", {className: "Cmod-StyleGuide__column float-right"}, 
                 utility_html, 
                 variable_html 
            )
        );
        return col_right;
    },

    viewComp: function ( parent_uuid , uuid ) {
        RS.merge({
            tree:parent_uuid,
            rule:uuid,
            detailTab:"example"
        });
    },

    changePage: function ( page ) {
        RS.merge({
            page:page
        });
    },

    render: function() {
        var html = [];

        if ( RS.route.page == "comps" ) {
            var component,components;
            var comps_html,objects_html;

            for ( var status_type in CSSModel.component_data.status_hash ) {
                components = CSSModel.component_data.status_hash[ status_type ];

                comps_html = [];
                objects_html = [];
                //var components = CSSModel.component_data.css_dom
                components = components
                    .sort(function(a, b)
                            {
                                var x=a.name.toLowerCase(),
                                    y=b.name.toLowerCase();
                                return x<y ? -1 : x>y ? 1 : 0;
                            }
                    );

                for ( var c=0; c<components.length; c++ ) {
                    component = components[ c ];
                    var col_1 = [];

                    var type_html;
                    if ( component.name.indexOf( ".o-") == 0 ) {
                        type_html = objects_html;
                    }else{
                        type_html = comps_html;
                    }
                    type_html.push(
                        React.createElement("div", {className: "c-styleGuideComps__component", 
                            onClick:  this.viewComp.bind( this ,
                                component.uuid,
                                component.uuid
                            ) }, 
                            React.createElement("div", {className: "c-styleGuideComps__component__typeIcon"}, 
                                React.createElement(TypeIcon, {rule:  component })
                            ), 
                             component.name
                        )
                    );

                }

                if ( status_type == "dev" ) {
                    status_type = "Development";
                    html.push(
                        React.createElement("div", {className: "c-styleGuideComps__group"}, 
                            React.createElement("div", {className: "c-styleGuideComps__group__title"}, 
                                 status_type 
                            ), 
                            React.createElement("div", {className: "c-styleGuideComps__objectGroup"},  objects_html ), 
                            React.createElement("div", {className: "c-styleGuideComps__componentGroup"},  comps_html )
                        )
                    );
                }else if ( status_type == "prod" ) {
                    status_type = "Production";
                    html.unshift(
                        React.createElement("div", {className: "c-styleGuideComps__group"}, 
                            React.createElement("div", {className: "c-styleGuideComps__group__title"}, 
                                 status_type 
                            ), 
                            React.createElement("div", {className: "c-styleGuideComps__objectGroup"},  objects_html ), 
                            React.createElement("div", {className: "c-styleGuideComps__componentGroup"},  comps_html )
                        )
                    );
                }else{
                    html.push(
                        React.createElement("div", {className: "c-styleGuideComps__group"}, 
                            React.createElement("div", {className: "c-styleGuideComps__group__title"}, 
                                 status_type.charAt(0).toUpperCase() + status_type.slice(1)
                            ), 
                            React.createElement("div", {className: "c-styleGuideComps__objectGroup"},  objects_html ), 
                            React.createElement("div", {className: "c-styleGuideComps__componentGroup"},  comps_html )
                        )
                    );
                }

                html.push(
                    React.createElement("div", {className: "c-styleGuideComps__key"}, 
                        React.createElement("div", {className: "c-styleGuideComps__key__item"}, 
                            React.createElement("div", {className: "c-styleGuideComps__key__typeIcon"}, 
                                React.createElement(TypeIcon, {rule: {
                                        has_error:false,
                                        type:"tagged_rule",
                                        metadata:{
                                            complete:true,
                                            based_on:false
                                        },
                                        is_extended:false
                                }})
                            ), 
                            "complete"
                        ), 
                        React.createElement("div", {className: "c-styleGuideComps__key__item"}, 
                            React.createElement("div", {className: "c-styleGuideComps__key__typeIcon"}, 
                                React.createElement(TypeIcon, {rule: {
                                        has_error:false,
                                        type:"rule",
                                        is_extended:false
                                }})
                            ), 
                            "no example"
                        ), 
                        React.createElement("div", {className: "c-styleGuideComps__key__item"}, 
                            React.createElement("div", {className: "c-styleGuideComps__key__typeIcon"}, 
                                React.createElement(TypeIcon, {rule: {
                                        has_error:true,
                                        type:"rule",
                                        is_extended:false
                                }})
                            ), 
                            "error"
                        )
                    )
                )

            }

        }else{
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
        }



        return  React.createElement("div", {className: "Cmod-StyleGuide"}, 
                    React.createElement("div", {className: "Cmod-StyleGuide__mainNav"}, 
                        React.createElement("h1", null, "Style Guide")
                    ), 
                    React.createElement("div", {className: "Cmod-StyleGuide__content"}, 
                         html 
                    ), 

                    React.createElement(Detail, null), 
                    React.createElement(VariableDetail, null)
                    /* <RuleDetail css_info={ CSSModel.component_data } /> */ 
                );
    }

});



var VariableDetail = React.createClass({displayName: "VariableDetail",

    componentWillMount: function() {
        var me = this;
        RouteState.addDiffListeners(
    		["detail","type","detail_index"],
    		function ( route , prev_route ) {
                if (
                    route.type == "variable"
                ) {
                    me.forceUpdate();
                }
    		},
            "VariableDetail"
    	);
    },

    componentWillUnmount: function(){
        RouteState.removeDiffListenersViaClusterId( "VariableDetail" );
    },

    close: function( type , id ){
        RS.merge({
            detail:"",
            type:"",
            detail_index:""
        });
    },


    render: function() {

        var var_obj = CSSModel.variable_lookup[ RS.route.detail ];

        if ( !var_obj ) {
            return React.createElement("div", {className: "c-variableDetail"}, "no variable found")
        }

        return React.createElement("div", {className: "c-variableDetail"}, 
                React.createElement("pre", {className: "c-variableDetail__varStr"}, 
                     var_obj.css_string), 
                React.createElement("div", {className: "c-variableDetail__close", 
                    onClick:  this.close}, "x")
            );
    }

});



var TypeIcon = React.createClass({displayName: "TypeIcon",

    render: function() {

        var icon_class = "rule_icon";


        if ( this.props.rule.has_error ) {
            icon_class = "dup_icon";
        }else if ( this.props.rule.type == "tagged_rule" ) {
            icon_class = "tagged_icon";

            if ( this.props.rule.metadata ) {
                if ( this.props.rule.metadata.complete ) {
                    icon_class = "tagged_icon";
                }else{
                    icon_class = "tagged_incomplete_icon";
                }
            }else{
                console.log( this.props.rule );
            }
        }

        var extended = "";

        if (
            this.props.rule.is_extended
        ) {
            extended =
                React.createElement("div", {className: "extendedIcon"}, 
                    React.createElement("div", {className: "extendedIcon_content"})
                );
        }

        //if ( this.props.rule.is_duplicate ) {
        //    extra_text.push( ( total_stats == 1 ) ? "dup" : "dp" );
        //}

        var extendee = "";
        if (
            this.props.rule.metadata &&
            this.props.rule.metadata.based_on
        ) {
            extendee =
                React.createElement("div", {className: "extendeeIcon"}, 
                    React.createElement("div", {className: "extendeeIcon_content"})
                );
        }

        //if ( extra_text.length > 0 ) {
        //    extra_text = <div className="extraText">{ extra_text.join(",") }</div>
        //}

        return  React.createElement("div", {className: "typeIcon"}, 
                     extended, 
                     extendee, 
                    React.createElement("div", {className:  icon_class })
                );
    }

});
