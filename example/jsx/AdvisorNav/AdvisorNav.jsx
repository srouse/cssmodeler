

var AdvisorMainNav = React.createClass({


    changePage: function ( page ) {
        RS.merge({
            page:page,
            org_page:''
        });
    },

    render: function() {
        return  <div className="AdvisorNav">
                    <div className="AdvisorNav__titleLink"
                        onClick={ this.changePage.bind( this , 'organizations') }>
                        <div className="skinny-display-none">
                            Application Name
                        </div>
                    </div>
                    <div className="AdvisorNav__link"
                        onClick={ this.changePage.bind( this , 'organizations') }>
                        <div className="
                            skinny-display-none">
                            Organizations
                        </div>
                        <div className="
                            display-none
                            skinny-display-block">
                            Orgs
                        </div>
                    </div>
                    <div className="AdvisorNav__link"
                        onClick={ this.changePage.bind( this , 'notifications') }>
                        <div>Notifications</div>
                    </div>
                    <div className="AdvisorNav__link"
                        onClick={ this.changePage.bind( this , 'advisorconfig') }>
                        <div>Configuration</div>
                    </div>

                    <div className="AdvisorNav__seasonLink">
                        <div>2015 Data</div>
                    </div>
                </div>;
    }

});