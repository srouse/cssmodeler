
var RuleDetailNav = React.createClass({

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
            return <div>no rule</div>;

        var name = rule.name;
        if ( rule.direct_child_selector ) {
            name = "> " + name;
        }

        return  <div className="ruleDetailNav">
                    <div className="ruleDetailNav_title">
                        <div className="ruleDetailNav_titleText">
                            { name }
                        </div>
                        <div className="ruleDetailNav_typeIcon">
                            <TypeIcon rule={ rule } />
                        </div>
                    </div>

                    <div className="ruleDetail_headerNav">
                        <div className="ruleDetail_item_example"
                            onClick={
                                this.change_tab.bind( this , "example")
                            }>
                            example
                        </div>
                        <div className="ruleDetail_item_css"
                            onClick={
                                this.change_tab.bind( this , "code")
                            }>
                            code
                        </div>
                    </div>
                </div>;
    }

});
