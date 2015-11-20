


var OrganizationsMain = React.createClass({

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
                <div className="
                    EXP-ColGridList__row
                    height-row-large">

                    <div className="
                        EXP-ColGridList__cell
                        width-col-3
                        font-size-large

                        breakpoint-small-width-col-7
                        breakpoint-small-font-size-small
                        breakpoint-small-margin-right-quarter-2

                        skinny-width-col-2
                        skinny-background-example-blue-lightest
                        skinny-font-size">
                        <div className="interactive"
                            onClick={ this.selectOrg.bind( this , org.guid ) }>
                            { org.title }
                        </div>
                    </div>
                    <div className="
                        EXP-ColGridList__cell
                        width-col-2 text-align-right

                        skinny-display-none">
                        <div>test<br />test</div>
                    </div>
                    <div className="
                        EXP-ColGridList__cell
                        width-col-1 text-align-center

                        skinny-display-none">
                        <div>{ org.crop_plans.length }</div>
                    </div>
                    <div className="
                        EXP-ColGridList__cell
                        width-col-1 text-align-center

                        breakpoint-small-display-none

                        skinny-display-none">
                        <div>{ org.crop_plans.length }</div>
                    </div>
                    <div className="
                        EXP-ColGridList__cell
                        EXP-OrgMainList__farm">
                        <div>{ org.crop_plans.length }</div>
                    </div>
                </div>
            );
            org_list.push(
                <div className="EXP-ColGridList__separator
                        width-col-9

                        breakpoint-small-width-col-12
                        skinny-width-col-3
                        "><div></div></div>
            );
        }

        return  <div className="TAPage">
                    <div className="TAPage__header">
                        <div className="
                            TAPage__header__title">
                            <div>Organizations</div>
                        </div>
                        <div className="
                            TAPage__header__button search"
                            onClick={ this.showSearch }></div>
                        <div className="
                            TAPage__header__button map
                            skinny-display-none"
                            onClick={ this.showMap }></div>
                        <div className="
                            TAPage__header__button filter
                            skinny-display-none"
                            onClick={ this.showFilters }></div>
                    </div>

                    <div className="
                        EXP-ColGridList
                        height-minus-row-2
                        my-scrollbar
                        ">
                        { org_list }
                    </div>
                </div>;
    }

});
