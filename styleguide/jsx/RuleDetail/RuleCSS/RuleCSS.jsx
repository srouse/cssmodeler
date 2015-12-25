


var RuleCSS = React.createClass({


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
            return <div>no rule found</div>;
        }


        var comp_css = this.getCSSStub( rule , 0 );


        return  <div className="ruleCSS">
                    <div className="ruleDetail_code">
                        <div className="ruleDetail_title">CSS</div>
                        <div className="ruleDetail_codeLine">
                            <pre className="prettyprint lang-css">
                                { comp_css }
                            </pre>
                        </div>
                    </div>
                </div>;
    }

});
