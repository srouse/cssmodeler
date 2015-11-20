

var RuleOverview = React.createClass({

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
                    <div className="ruleOverview_subName"
                        key={ "ruleoverview_" + child.uuid }
                        onClick={
                            this.gotoRule.bind( this , child.uuid )
                        }>
                        { child.name }
                    </div>
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
                    <div className="ruleOverview_subName"
                        key={ "ruleoverview_parent_" + parent.uuid }
                        onClick={
                            this.gotoRule.bind( this , parent.uuid )
                        }>
                        { parent.name }
                    </div>
                );
            }else{
                parent = {parent_rule_uuid:false};
            }
        }
        parents.push(
            <div className="ruleOverview_subName"
                key={ "ruleoverview_rule_" + rule.uuid }
                onClick={
                    this.gotoRule.bind( this , rule.uuid )
                }>
                { rule.name }
            </div>
        );


        var parent_back =
            <div
                className="ruleOverview_parentPlaceholder">
            </div>;

        if ( rule.parent_rule_uuid ) {
            parent = this.props.css_info.uuid_hash[ rule.parent_rule_uuid ];
            parent_back =
                <div className="ruleOverview_parentLink"
                    onClick={
                        this.gotoRule.bind(
                            this , rule.parent_rule_uuid
                        )
                    }>
                </div>;
        }

        // STATES
        if ( rule.states ) {
            for ( var r=0; r<rule.states.length; r++ ) {
                states.push(
                    <div className="ruleOverview_stateSubName"
                        key={ "ruleoverview_state_" + rule.states[r].uuid }
                        title={ rule.states[r].selector }>
                        { rule.states[r].selector }
                    </div>
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
                        <div className="ruleOverview_subName"
                            key={ "ruleoverview_relation_" + relationship.uuid }
                            onClick={
                                this.viewRuleDetail.bind( this , relationship.uuid )
                            } title={ relationship.selector }>
                            { relationship.name }
                        </div>
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
                        <div className="ruleOverview_subName"
                            key={ "ruleoverview_dup_" + child.uuid }
                            onClick={
                                this.viewRuleDetailViaSelector.bind(
                                    this , child.selector
                                )
                            } title={ child.selector }>
                            { child.selector }
                        </div>
                    );
                }
            }
        }

        return  <div className="ruleOverview">
                    <div className="ruleOverview_context">
                        <div className="ruleOverview_subTitle">
                            full selector
                        </div>
                        { parents }
                        <div className="ruleOverview_subTitle">
                            children
                        </div>
                        { children }
                        <div className="ruleOverview_subTitle">
                            states
                        </div>
                        { states }
                        <div className="ruleOverview_subTitle">
                            relationships
                        </div>
                        { relationships }
                        <div className="ruleOverview_subTitle">
                            duplicate names
                        </div>
                        { duplicates }
                        <div className="list_bottom_padding"></div>
                    </div>
                </div>;
    }

});
