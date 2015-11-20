

var RuleNestingColumn = React.createClass({

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
            return <div>no rule</div>;

        var child;
        var children = [];
        var total = rule.children.length;
        var is_last,has_children;
        for ( var i=0; i<total; i++ ) {
            child = rule.children[i];
            children.push(
                <RuleNestingColumn {...this.props}
                    key={ "ruleNestingColumn_" + child.uuid }
                    rule= { child } index={ this.props.index+1 } />
            );
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
            <div className={ "ruleNestingColumn_title" + extra_title_class }
                onClick={
                    this.gotoRule.bind( this , rule.uuid )
                }>
                <div className="ruleNesting_titleText">
                    { name }
                </div>
                <div className="ruleNesting_typeIcon">
                    <TypeIcon rule={ rule } />
                </div>
            </div>;


        return  <div className={ "ruleNestingColumn" + extra_class }
                    key={ rule.uuid +"-"+ rule.children.length }>

                    <div className={ "ruleNestingColumn_line" + extra_class }
                        style={{height:
                            (( max_height ) * 30 ) + "px"
                        }}>
                    </div>

                    <div className={
                            "ruleNestingColumn_stackedLine" + extra_class
                        }
                        style={{height:
                            (( stack_max_height ) * 30 ) + "px"
                        }}>
                    </div>

                    <div className={
                            "ruleNestingColumn_lineCover" + extra_class
                        }>
                    </div>

                    { rule_title }
                    <div className={
                            "ruleNestingColumn_children" + extra_class
                        }>
                        { children }
                    </div>

                    <div style={{clear:"both"}}></div>
                </div>;
    }

});
