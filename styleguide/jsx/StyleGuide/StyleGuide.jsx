


var StyleGuide = React.createClass({


    componentWillMount: function() {
        /*
        var me = this;
        RouteState.addDiffListeners(
    		["page"],
    		function ( route , prev_route ) {
                me.forceUpdate();
    		},
            "StyleGuide"
    	);
        */
    },

    componentWillUnmount: function(){
        // RouteState.removeDiffListenersViaClusterId( "StyleGuide" );
    },


    render: function() {
        return  <div className="Cmod-StyleGuide">
                    hi
                </div>;
    }

});
