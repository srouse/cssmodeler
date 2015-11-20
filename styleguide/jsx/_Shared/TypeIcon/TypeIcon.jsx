

var TypeIcon = React.createClass({

    render: function() {

        var icon_class = "rule_icon";


        if ( this.props.rule.has_error ) {
            icon_class = "dup_icon";
        }else if ( this.props.rule.type == "tagged_rule" ) {
            icon_class = "tagged_icon";

            if ( this.props.rule.metadata ) {
                if ( this.props.rule.metadata.complete ) {
                    icon_class = "tagged_icon";
                }else{
                    icon_class = "tagged_incomplete_icon";
                }
            }else{
                console.log( this.props.rule );
            }
        }

        var extended = "";

        if (
            this.props.rule.is_extended
        ) {
            extended =
                <div className="extendedIcon">
                    <div className="extendedIcon_content"></div>
                </div>;
        }

        //if ( this.props.rule.is_duplicate ) {
        //    extra_text.push( ( total_stats == 1 ) ? "dup" : "dp" );
        //}

        var extendee = "";
        if (
            this.props.rule.metadata &&
            this.props.rule.metadata.based_on
        ) {
            extendee =
                <div className="extendeeIcon">
                    <div className="extendeeIcon_content"></div>
                </div>;
        }

        //if ( extra_text.length > 0 ) {
        //    extra_text = <div className="extraText">{ extra_text.join(",") }</div>
        //}

        return  <div className="typeIcon">
                    { extended }
                    { extendee }
                    <div className={ icon_class }></div>
                </div>;
    }

});
