
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
    },

    componentWillUnmount: function(){
        RouteState.removeDiffListenersViaClusterId( "rule_preview" );
    },


    render: function() {

        var rule = this.props.rule;

        if ( !rule ) {
            return <div></div>;
        }

        var compName = rule.name.replace( /\./g , "" );
        var comp = CSSModel.components[ compName ];
        var comp_html = "No example";
        if ( rule.type == "tagged_rule" ) {
            var sub_comp_info = RuleUtil.replaceComps(
                rule , rule.metadata.example, [] , this.props.css_info
            );
            comp_html = sub_comp_info.html.replace( /<\/div>/g , "</div>\n" );
        }

        return  <div className="ruleCSS">
                    <div className="ruleDetail_code">
                        <div className="ruleDetail_title">CSS</div>
                        <div className="ruleDetail_codeLine">
                            <pre>{ comp.css_string.trim() }</pre>
                        </div>
                        <div className="ruleDetail_title">HTML</div>
                        <div className="ruleDetail_codeLine">
                            <pre>{ comp_html.trim() }</pre>
                        </div>
                    </div>
                </div>;
    }

});
