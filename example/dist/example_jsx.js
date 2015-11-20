


var Advisor = React.createClass({displayName: "Advisor",


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
                page = React.createElement(Notifications, null);
                break;
            case "formulas" :
                page = React.createElement(Formulas, null);
                break;
            case "advisorconfig" :
                page = React.createElement(AdvisorConfig, null);
                break;
            default:
                page = React.createElement(OrganizationsMain, null);
        }

        var page_extra_class = "";
        if ( RS.route.layout == "list_detail" ) {
            page_extra_class = "skinny "
        }

        return  React.createElement("div", {className: "EXP-advisor "}, 
                    React.createElement("div", {className: "EXP-advisor__exampleMainNavContainer"}, 
                        React.createElement(ExampleMainNav, null)
                    ), 
                    React.createElement("div", {className: 
                            "EXP-advisor__advisorMainNavContainer "
                            + page_extra_class
                        }, 
                        React.createElement(AdvisorMainNav, null)
                    ), 
                    React.createElement("div", {className: 
                            "EXP-advisor__pageContainer "
                            + page_extra_class
                        }, 
                         page 
                    )
                );
    }

});



var AdvisorMainNav = React.createClass({displayName: "AdvisorMainNav",


    changePage: function ( page ) {
        RS.merge({
            page:page,
            org_page:''
        });
    },

    render: function() {
        return  React.createElement("div", {className: "AdvisorNav"}, 
                    React.createElement("div", {className: "AdvisorNav__titleLink", 
                        onClick:  this.changePage.bind( this , 'organizations') }, 
                        React.createElement("div", {className: "skinny-display-none"}, 
                            "Application Name"
                        )
                    ), 
                    React.createElement("div", {className: "AdvisorNav__link", 
                        onClick:  this.changePage.bind( this , 'organizations') }, 
                        React.createElement("div", {className: 
                            "skinny-display-none"}, 
                            "Organizations"
                        ), 
                        React.createElement("div", {className: 
                            "display-none" + ' ' +
                            "skinny-display-block"}, 
                            "Orgs"
                        )
                    ), 
                    React.createElement("div", {className: "AdvisorNav__link", 
                        onClick:  this.changePage.bind( this , 'notifications') }, 
                        React.createElement("div", null, "Notifications")
                    ), 
                    React.createElement("div", {className: "AdvisorNav__link", 
                        onClick:  this.changePage.bind( this , 'advisorconfig') }, 
                        React.createElement("div", null, "Configuration")
                    ), 

                    React.createElement("div", {className: "AdvisorNav__seasonLink"}, 
                        React.createElement("div", null, "2015 Data")
                    )
                );
    }

});




var ExampleMainNav = React.createClass({displayName: "ExampleMainNav",




    render: function() {
        return  React.createElement("div", {className: "ExampleMainNav"}, 
                    React.createElement("div", {className: "ExampleMainNav__logo"}), 
                    React.createElement("div", {className: "ExampleMainNav__appNav"}, 
                        React.createElement("div", {className: "ExampleMainNav__appNav__label"}, "Application Name"), 
                        React.createElement("div", {className: "ExampleMainNav__separator position-left"})
                    ), 
                    React.createElement("div", {className: "ExampleMainNav__notifications"}), 
                    React.createElement("div", {className: "ExampleMainNav__upgrade"}, 
                        React.createElement("div", {className: "ExampleMainNav__upgrade__label"}, "Upgrade"), 
                        React.createElement("div", {className: "ExampleMainNav__separator position-right"})
                    ), 
                    React.createElement("div", {className: "ExampleMainNav__user"}, 
                        React.createElement("div", null, "joe@example.com")
                    )
                );
    }

});



var AdvisorConfig = React.createClass({displayName: "AdvisorConfig",




    render: function() {



        return  React.createElement("div", {className: "advisorConfig"}, 
                    "config"
                );
    }

});



var AdvisorConfig = React.createClass({displayName: "AdvisorConfig",

    showSearch: function () {
        RS.merge({filters:'',map:'',search:'search'});
    },

    render: function() {

        return  React.createElement("div", {className: "fill-width"}, 
                    React.createElement("div", {className: "EXP-Page__header"}, 
                        React.createElement("div", {className: "EXP-Page__header__title"}, 
                            React.createElement("div", null, "Advisor Configuration")
                        ), 
                        React.createElement("div", {className: "EXP-Page__header__button search", 
                            onClick:  this.showSearch})
                    ), 

                    React.createElement("div", {className: "EXP-List"}

                        
                    )

                );
    }

});



var Notifications = React.createClass({displayName: "Notifications",

    showSearch: function () {
        RS.merge({filters:'',map:'',search:'search'});
    },

    render: function() {

        return  React.createElement("div", {className: "fill-width"}, 
                    React.createElement("div", {className: "EXP-Page__header"}, 
                        React.createElement("div", {className: "EXP-Page__header__title"}, 
                            React.createElement("div", null, "Notifications")
                        ), 
                        React.createElement("div", {className: "EXP-Page__header__button search", 
                            onClick:  this.showSearch})
                    )
                );
    }

});




var OrganizationsMain = React.createClass({displayName: "OrganizationsMain",

    componentWillMount: function() {
        var me = this;
        RouteState.addDiffListeners(
    		["org"],
    		function ( route , prev_route ) {
                // update
                me.forceUpdate();
    		},
            "OrganizationsMain"
    	);
    },
    componentDidMount: function () {
        this.renderScrollbars();
    },
    componentWillUnmount: function(){
        RouteState.removeDiffListenersViaClusterId( "OrganizationsMain" );
    },

    showFilters: function () {
        RS.merge({filters:'filters',map:'',search:''});
    },
    showMap: function () {
        RS.merge({filters:'',map:'map',search:''});
    },
    showSearch: function () {
        RS.merge({filters:'',map:'',search:'search'});
    },

    selectOrg: function ( org_id ) {
        RS.toggle({org:org_id,layout:"list_detail"},{org:"",layout:""});
    },

    componentDidUpdate: function () {
        //this.myScrollbar.update();
    },


    renderScrollbars: function () {
        /*
        this.myScrollbar = new GeminiScrollbar({
            element: document.querySelector('.my-scrollbar')
        }).create();
        */
    },

    render: function() {

        var advisor = AdvisorModel.get( AdvisorModel.advisor[0] );
        var org,org_list = [];
        for ( var i=0; i<advisor.organizations.length; i++ ) {
            org = AdvisorModel.get( advisor.organizations[i] );

            org_list.push(
                React.createElement("div", {className: 
                    "EXP-ColGridList__row" + ' ' +
                    "height-row-large"}, 

                    React.createElement("div", {className: 
                        "EXP-ColGridList__cell" + ' ' +
                        "width-col-3" + ' ' +
                        "font-size-large" + ' ' +

                        "breakpoint-small-width-col-7" + ' ' +
                        "breakpoint-small-font-size-small" + ' ' +
                        "breakpoint-small-margin-right-quarter-2" + ' ' +

                        "skinny-width-col-2" + ' ' +
                        "skinny-background-example-blue-lightest" + ' ' +
                        "skinny-font-size"}, 
                        React.createElement("div", {className: "interactive", 
                            onClick:  this.selectOrg.bind( this , org.guid) }, 
                             org.title
                        )
                    ), 
                    React.createElement("div", {className: 
                        "EXP-ColGridList__cell" + ' ' +
                        "width-col-2 text-align-right" + ' ' +

                        "skinny-display-none"}, 
                        React.createElement("div", null, "test", React.createElement("br", null), "test")
                    ), 
                    React.createElement("div", {className: 
                        "EXP-ColGridList__cell" + ' ' +
                        "width-col-1 text-align-center" + ' ' +

                        "skinny-display-none"}, 
                        React.createElement("div", null,  org.crop_plans.length)
                    ), 
                    React.createElement("div", {className: 
                        "EXP-ColGridList__cell" + ' ' +
                        "width-col-1 text-align-center" + ' ' +

                        "breakpoint-small-display-none" + ' ' +

                        "skinny-display-none"}, 
                        React.createElement("div", null,  org.crop_plans.length)
                    ), 
                    React.createElement("div", {className: 
                        "EXP-ColGridList__cell" + ' ' +
                        "EXP-OrgMainList__farm"}, 
                        React.createElement("div", null,  org.crop_plans.length)
                    )
                )
            );
            org_list.push(
                React.createElement("div", {className: "EXP-ColGridList__separator" + ' ' +
                        "width-col-9" + ' ' +

                        "breakpoint-small-width-col-12" + ' ' +
                        "skinny-width-col-3"
                        }, React.createElement("div", null))
            );
        }

        return  React.createElement("div", {className: "EXP-Page"}, 
                    React.createElement("div", {className: "EXP-Page__header"}, 
                        React.createElement("div", {className: 
                            "EXP-Page__header__title"}, 
                            React.createElement("div", null, "Organizations")
                        ), 
                        React.createElement("div", {className: 
                            "EXP-Page__header__button search", 
                            onClick:  this.showSearch}), 
                        React.createElement("div", {className: 
                            "EXP-Page__header__button map" + ' ' +
                            "skinny-display-none", 
                            onClick:  this.showMap}), 
                        React.createElement("div", {className: 
                            "EXP-Page__header__button filter" + ' ' +
                            "skinny-display-none", 
                            onClick:  this.showFilters})
                    ), 

                    React.createElement("div", {className: 
                        "EXP-ColGridList" + ' ' +
                        "height-minus-row-2" + ' ' +
                        "my-scrollbar"
                        }, 
                         org_list 
                    )
                );
    }

});
