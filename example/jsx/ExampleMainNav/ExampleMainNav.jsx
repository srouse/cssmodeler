


var ExampleMainNav = React.createClass({




    render: function() {
        return  <div className="ExampleMainNav">
                    <div className="ExampleMainNav__logo"></div>
                    <div className="ExampleMainNav__appNav">
                        <div className="ExampleMainNav__appNav__label">Application Name</div>
                        <div className="ExampleMainNav__separator position-left"></div>
                    </div>
                    <div className="ExampleMainNav__notifications"></div>
                    <div className="ExampleMainNav__upgrade">
                        <div className="ExampleMainNav__upgrade__label">Upgrade</div>
                        <div className="ExampleMainNav__separator position-right"></div>
                    </div>
                    <div className="ExampleMainNav__user">
                        <div>joe@example.com</div>
                    </div>
                </div>;
    }

});
