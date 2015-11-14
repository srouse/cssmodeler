


var StyleGuide = React.createClass({displayName: "StyleGuide",


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
        return  React.createElement("div", {className: "Cmod-StyleGuide"}, 
                    "hi"
                );
    }

});
