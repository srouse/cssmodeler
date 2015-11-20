


var ExampleMainNav = React.createClass({




    render: function() {
        return  <div className="exampleMainNav">
                    <div className="exampleMainNav__logo"></div>
                    <div className="exampleMainNav__appNav">
                        <div className="exampleMainNav__appNav__label">Application Name</div>
                        <div className="exampleMainNav__separator position-left"></div>
                    </div>
                    <div className="exampleMainNav__notifications"></div>
                    <div className="exampleMainNav__upgrade">
                        <div className="exampleMainNav__upgrade__label">Upgrade</div>
                        <div className="exampleMainNav__separator position-right"></div>
                    </div>
                    <div className="exampleMainNav__user">
                        <div>joe@example.com</div>
                    </div>
                </div>;
    }

});
