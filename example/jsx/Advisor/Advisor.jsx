


var Advisor = React.createClass({


    componentWillMount: function() {
        this.updateModel();

        var me = this;
        RouteState.addDiffListeners(
    		["page","org_selector","customer","layout"],
    		function ( route , prev_route ) {
                // update
                me.updateModel();
                me.forceUpdate();
    		},
            "Advisor"
    	);
    },

    componentWillUnmount: function(){
        RouteState.removeDiffListenersViaClusterId( "Advisor" );
    },

    updateModel: function () {
    },

    render: function() {

        var page = "";
        switch ( RS.route.page ) {
            case "notifications" :
                page = <Notifications />;
                break;
            case "formulas" :
                page = <Formulas />;
                break;
            case "advisorconfig" :
                page = <AdvisorConfig />;
                break;
            default:
                page = <OrganizationsMain />;
        }

        var page_extra_class = "";
        if ( RS.route.layout == "list_detail" ) {
            page_extra_class = "skinny "
        }

        return  <div className="EXP-advisor ">
                    <div className="EXP-advisor__exampleMainNavContainer">
                        <ExampleMainNav />
                    </div>
                    <div className={
                            "EXP-advisor__advisorMainNavContainer "
                            + page_extra_class
                        }>
                        <AdvisorMainNav />
                    </div>
                    <div className={
                            "EXP-advisor__pageContainer "
                            + page_extra_class
                        }>
                        { page }
                    </div>
                </div>;
    }

});
