

var VariableDetail = React.createClass({

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
            return <div className="c-variableDetail">no variable found</div>
        }

        console.log( var_obj );

        return <div className="c-variableDetail">
                <pre className="c-variableDetail__varStr">
                    { var_obj.css_string }</pre>
                <div className="c-variableDetail__close"
                    onClick={ this.close }>x</div>
            </div>;
    }

});
