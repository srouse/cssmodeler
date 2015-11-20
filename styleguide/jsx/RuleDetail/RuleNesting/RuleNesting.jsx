

var RuleNesting = React.createClass({

    render: function() {
        var rule = this.props.rule;
        if ( !rule )
            return <div>no rule found</div>;

        var content =
            <RuleNestingColumn {...this.props}
                rule={ rule } index={ 0 } />;

        return  <div className="ruleNesting">
                    { content }
                </div>;
    }

});
