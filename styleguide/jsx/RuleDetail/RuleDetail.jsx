

var RuleDetail = React.createClass({

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
            content = <RuleHTML
                        css_info={ this.props.css_info }
                        rule_uuid={ tree_rule.rule_uuid }
                        rule={ tree_rule } />;
        }else if ( RouteState.route.detailTab == "css" ) {
            content = <RuleCSS
                        css_info={ this.props.css_info }
                        rule_uuid={ tree_rule.rule_uuid }
                        rule={ tree_rule } />;
        }else if ( RouteState.route.detailTab == "overview" ) {
            content = <RuleOverview
                        css_info={ this.props.css_info }
                        rule={ rule } />;
        }else if ( RouteState.route.detailTab == "example" ) {
            content = <RulePreview
                        css_info={ this.props.css_info }
                        rule_uuid={ this.state.rule_uuid }
                        rule={ rule } />;
        }

        return  <div className="ruleDetail">

                    <div className="ruleDetail_header">
                        <div className="ruleDetail_title">
                            <div className="ruleDetail_close"
                                onClick={ this.close }>&lt; back</div>
                            { /*<div className="ruleDetail_showTree"
                                onClick={ this.closeDetail }></div> */ }
                        </div>
                    </div>

                    <div className="ruleDetail_contentContainer">
                        { content }
                    </div>

                    <div className="ruleDetail_ruleNestingContainer">
                        <RuleNesting
                            css_info={ this.props.css_info }
                            rule={ tree_rule } />
                    </div>

                    <div className="ruleDetail_ruleNavPlaceholder">
                        <RuleDetailNav
                            css_info={ this.props.css_info }
                            rule_uuid={ this.state.rule_uuid }
                            rule={ rule } />
                    </div>

                </div>;
    }

});
