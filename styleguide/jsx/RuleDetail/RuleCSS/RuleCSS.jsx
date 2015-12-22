
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


    render: function() {

        var rule = this.props.rule;

        if ( !rule ) {
            return <div>no rule found</div>;
        }

        var compName = rule.name.replace( /\./g , "" );

        var comp_html = "No example";
        if ( rule.type == "tagged_rule" ) {
            var sub_comp_info = RuleUtil.replaceCompsFormated(
                rule , rule.metadata.example, [] , this.props.css_info
            );
            comp_html = sub_comp_info.formatted_html;//sub_comp_info.html.replace( /<\/div>/g , "</div>\n" );
        }

        return  <div className="ruleCSS">
                    <div className="ruleDetail_code">
                        <div className="ruleDetail_title">HTML</div>
                        <div className="ruleDetail_codeLine">
                            <pre className="prettyprint lang-html">
                                { comp_html.trim() }
                            </pre>
                        </div>
                    </div>
                </div>;
    }

});
