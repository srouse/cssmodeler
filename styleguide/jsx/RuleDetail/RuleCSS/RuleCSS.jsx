
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

    processSelectorIntoHTML: function ( selector ) {
        var rule_arr = selector.split(" ");
        var new_rule_arr = [];
        for ( var i=0; i<rule_arr.length; i++ ) {
            new_rule_arr.push( rule_arr[i] );
            new_rule_arr.push( <br /> );
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
            return <div>no info</div>;

        var css_str = [];


        css_str.push(
            <div className="ruleDetail_title">Full Selector</div>
        );
        css_str.push(
            <div className="ruleDetail_codeLine"
                key={ "description" }>
                <span className="ruleDetail_variableName">
                    { rule.selector }
                </span>
            </div>
        );


        if (
            rule.metadata.description &&
            $.trim( rule.metadata.description ).length > 0
        ) {
            css_str.push(
                <div className="ruleDetail_title">Description</div>
            );
            for ( var d=0; d<rule.metadata.description.length; d++ ) {
                css_str.push(
                    <div className="ruleDetail_codeLine"
                        key={ "description" }>
                        <pre>{ rule.metadata.description[d].content }</pre>
                    </div>
                );
            }
        }


        css_str.push(
            <div className="ruleDetail_title">Based On</div>
        );

        if (
            rule.metadata.pointers.length == 0 &&
            rule.metadata.extends.length == 0
        ) {
            css_str.push(
                <div className="ruleDetail_noneFound">None</div>
            );
        }

        var pointers = rule.metadata.pointers;
        for ( var p=0; p<pointers.length; p++ ) {
            css_str.push(
                <div className="ruleDetail_codeLine"
                    key={ "pointer_" + p }>
                    <span className="ruleDetail_variableName">{ pointers[p] }</span>
                </div>
            );
        }
        var _extends = rule.metadata.extends;
        for ( var p=0; p<_extends.length; p++ ) {
            css_str.push(
                <div className="ruleDetail_codeLine"
                    key={ "extends_" + p }>
                    <span className="ruleDetail_variableName">{ _extends[p] }</span>
                </div>
            );
        }




        css_str.push(
            <div className="ruleDetail_title">Local Declarations</div>
        );
        if ( rule.metadata && rule.metadata.local ) {
            var local = rule.metadata.local;
            for ( var name in local ) {
                css_str.push(
                    <div className="ruleDetail_codeLine"
                        key={ "local_" + name }>
                        <span className="ruleDetail_variableName">
                            { name }</span>: { local[name] };
                    </div>
                );
            }
        }


        if ( rule.pseudos && rule.pseudos.length > 0 ) {
            css_str.push(
                <div className="ruleDetail_title">Pseudo Selectors</div>
            );
            var pseudos = rule.pseudos,pseudo;
            for ( var p=0; p<pseudos.length; p++ ) {
                pseudo = pseudos[p];
                css_str.push(
                    <div className="ruleDetail_codeLine"
                        key={ "pseudo_" + p }>
                        <span className="ruleDetail_selectorSpan">
                            { pseudo.selector }
                        </span> { "{" }
                    </div>
                );
                var local = pseudo.metadata.local;
                for ( var name in local ) {
                    css_str.push(
                        <div className="ruleDetail_codeLine indent"
                            key={ "local_pseudo_" + name }>
                            <span className="ruleDetail_variableName">
                                { name }</span>: { local[name] };
                        </div>
                    );
                }
                css_str.push(
                    <div className="ruleDetail_codeLine"
                        key={ "pseudo_close" + p }>
                        { "}" }
                    </div>
                );
            }
        }


        if ( rule.states && rule.states.length > 0 ) {
            css_str.push(
                <div className="ruleDetail_title">States</div>
            );
            var states = rule.states,state;
            for ( var p=0; p<states.length; p++ ) {
                state = states[p];
                css_str.push(
                    <div className="ruleDetail_codeLine"
                        key={ "state_" + p }>
                        <span className="ruleDetail_selectorSpan">
                            { state.selector }
                        </span> { "{" }
                    </div>
                );
                var local_obj = state.metadata.local;
                for ( var name in local_obj ) {
                    css_str.push(
                        <div className="ruleDetail_codeLine indent"
                            key={ "local_state_" + p + "_" + name }>
                            <span className="ruleDetail_variableName">
                                { name }</span>: { local_obj[name] };
                        </div>
                    );
                }
                css_str.push(
                    <div className="ruleDetail_codeLine"
                        key={ "state_close" + p }>
                        { "}" }
                    </div>
                );
            }
        }

        css_str.push(
            <div className="ruleDetail_title">
                Example HTML
                <div className="ruleDetail_titleButton"
                    onClick={ this.toReact }>React</div>
            </div>
        );

        var html_obj = RuleUtil.findRuleExample( rule , this.props.css_info , true );
        var html = html_obj.html;
        if ( RouteState.route.react == "react" ) {
            html = html.replace( /class=/gi , "className=");
        }
        css_str.push(
            <div className="ruleDetail_codeLine"
                key={ "local_html" }>
                <pre><code>{ vkbeautify.xml( html , "	" ) }</code></pre>
            </div>
        );


        console.log( rule );

        return css_str;
    },

    render: function() {
        var rule =  this.props.css_info.uuid_hash[
                        this.props.rule_uuid
                    ];

        var rule = this.props.rule;

        if ( !rule ) {
            return <div></div>;
        }



        var cssStr = this.getCSSString( rule );
        return  <div className="ruleCSS">
                    <div className="ruleDetail_code">
                        { cssStr }
                    </div>
                </div>;
    }

});
