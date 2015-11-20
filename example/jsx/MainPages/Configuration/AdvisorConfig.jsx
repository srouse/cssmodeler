

var AdvisorConfig = React.createClass({

    showSearch: function () {
        RS.merge({filters:'',map:'',search:'search'});
    },

    render: function() {

        return  <div className="fill-width">
                    <div className="TAPage__header">
                        <div className="TAPage__header__title">
                            <div>Advisor Configuration</div>
                        </div>
                        <div className="TAPage__header__button search"
                            onClick={ this.showSearch }></div>
                    </div>

                    <div className="EXP-List">

                        
                    </div>

                </div>;
    }

});
