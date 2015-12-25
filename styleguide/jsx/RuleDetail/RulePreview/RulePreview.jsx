
var RulePreview = React.createClass({

    componentDidMount: function() {
        var me = this;
        RouteState.addDiffListeners(
    		["rulestate","bg","outline"],
    		function ( route , prev_route ) {
                me.refreshDisplayedState();
    		},
            "rule_preview"
    	);

        this.refreshDisplayedState();
    },

    componentWillUnmount: function(){
        RouteState.removeDiffListenersViaClusterId( "rule_preview" );
    },

    refreshDisplayedState: function () {
        var state,state_name;
        var rule = this.props.rule;

        if ( !rule )
            return;

        for ( var s=0; s<rule.states.length; s++ ) {
            state = rule.states[s];
            if ( RouteState.route.rulestate ) {
                if ( s == RouteState.route.rulestate-1 ) {
                    $( ".state_" + s ).addClass("selected");
                }else{
                    $( ".state_" + s ).removeClass("selected");
                }
            }else{
                $( ".state_" + s ).removeClass("selected");
            }
        }

        if ( RouteState.route.bg ) {
            $( ".rulePreview_toggleBGColor" ).addClass("selected");
        }else{
            $( ".rulePreview_toggleBGColor" ).removeClass("selected");
        }

        if ( RouteState.route.outline == "outline" ) {
            $( ".rulePreview_outline" ).addClass("selected");
        }else{
            $( ".rulePreview_outline" ).removeClass("selected");
        }

    },

    toggleBGColor: function () {
        RouteState.toggle({
            bg:"white"
        },{
            bg:""
        });
    },

    outlineElement: function () {
        RouteState.toggle({
            outline:"outline"
        },{
            outline:""
        });
    },

    changeBackgroundColor: function () {
        RouteState.toggle({
            bg:"#fff"
        },{
            bg:""
        });
    },

    changeState: function ( index ) {
        RouteState.toggle({
            rulestate:index
        },{
            rulestate:""
        });
    },

    showHTML: function () {
        var example = this.findRuleExample( this.props.rule );
    },

    componentDidUpdate: function() {
        var rule = this.props.rule;
        var rule_dom = $(".rulePreview_iframe").contents().find( rule.selector );

        if (
            rule_dom.css("display") == "none" ||
            rule_dom.css("visibility") == "hidden"
        ) {
            // changing state would be circular...
            $(".rulePreview_visibility").removeClass("visible");
        }else{
            $(".rulePreview_visibility").addClass("visible");
        }

        this.refreshDisplayedState();
    },


    getRuleHTML: function ( rule ) {
        var html = "";

        var example = "No example";
        if ( rule.type == "tagged_rule" ) {
            var sub_comp_info = RuleUtil.replaceComps(
                rule , rule.metadata.example, [] , this.props.css_info
            );
            example = sub_comp_info.html;
        }

        html += "<link rel='stylesheet' type='text/css' href='../core.css?"+ Math.random() +"'>";
        html += "<link rel='stylesheet' type='text/css' href='../components.css?"+ Math.random() +"'>";
        html += example;

        return html;
    },

    render: function() {
        var rule = this.props.rule;

        if ( !rule )
            return <div></div>;

        example = this.getRuleHTML( rule );

        this.ele_border = false;

        var states = [],state,state_class;

        if ( rule.states && rule.states.length > 0 ) {

            /*states.push(
                <div className="rulePreview_navLabel"
                    key={ "rulePreview_navLabel" }>
                    states
                </div>
            );*/

            for ( var s=0; s<rule.states.length; s++ ) {
                state = rule.states[s];
                state_class = "rulePreview_state state_" + s;

                states.push(
                    <div className={ state_class }
                            title={ state.selector }
                            key={ "rulePreview_state_" + state.raw_selector }
                            onClick={
                                this.changeState.bind( this , s+1+"" )
                            }>
                        --{ state.selector.split("--")[1] }
                    </div> );
            }

            states.push(
                <div className="rulePreview_stateApplied"
                    key={ "rulePreview_stateApplied" }>
                </div>
            );
        }

        return  <div className="rulePreview">
                    <div className="rulePreview_stage">
                        <MagicFrame example={ example } rule={ rule } />
                    </div>
                    <div className="rulePreview_nav">
                        { states }
                        <div className="rulePreview_toggleBGColor"
                            onClick={ this.toggleBGColor }>
                            bg color
                        </div>
                        <div className="rulePreview_outline"
                            onClick={ this.outlineElement }>
                            outline
                        </div>
                    </div>
                </div>;
    }

});

var MagicFrame = React.createClass({
    render: function() {
        return <iframe style={{border: 'none'}}
                        className="rulePreview_iframe" />;
    },

    componentDidMount: function() {
        var me = this;
        RouteState.addDiffListeners(
    		["outline","bg","rulestate"],
    		function ( route , prev_route ) {
                me.postProcessElement();
    		},
            "rule_magicFrame"
    	);

        this.renderFrameContents();
    },

    componentWillUnmount: function(){
        RouteState.removeDiffListenersViaClusterId( "rule_magicFrame" );
    },

    renderFrameContents: function() {
        var doc = this.getDOMNode().contentDocument;
        if( doc.readyState === 'complete' ) {
            var content = this.props.example;
            var ifrm = this.getDOMNode();
            ifrm = (ifrm.contentWindow) ?
                        ifrm.contentWindow :
                            (ifrm.contentDocument.document) ?
                                ifrm.contentDocument.document : ifrm.contentDocument;

            ifrm.document.open();
            ifrm.document.write(content);
            ifrm.document.close();
        } else {
            setTimeout( this.renderFrameContents , 0);
        }

        this.postProcessElement();
    },

    postProcessElement: function () {
        if ( !this.isMounted() ) {
            return;
        }

        var rule = this.props.rule;
        var doc = this.getDOMNode().contentDocument;

        var rule_dom = $(doc).contents().find( rule.selector );

        if ( RouteState.route.outline == "outline" ) {
            rule_dom.css("border", "1px solid #f00" );
        }else{
            rule_dom.css( "border", "" );
        }

        // make sure it is always visible....
        //rule_dom.css("display", "block" );
        if ( rule_dom.css("display") == "none" ) {
            rule_dom.css("display", "block" );
        }

        var frame_bg = "#eee";
        if ( RouteState.route.bg == "white" ) {
            frame_bg = "#fff";
        }

        var body = $(doc).contents().find( "body" );
        body.css("background-color", frame_bg );

        //need to remove previous state without refresh entire page...
        if (
            RouteState.prev_route.rulestate
            && rule.states
            && rule.states.length > 0
        ) {
            var selector =  rule.states[
                                    RouteState.prev_route.rulestate-1
                                ].selector;


            var target_dom = $(doc).contents().find( rule.selector );
            target_dom.removeClass( selector.replace(".","") );
        }

        if ( RouteState.route.rulestate ) {
            var selector =  rule.states[
                                    RouteState.route.rulestate-1
                                ].selector;

            var target_dom = $(doc).contents().find( rule.selector );
            target_dom.addClass( selector.replace(".","") );
        }

    },

    componentDidUpdate: function() {
        this.renderFrameContents();
    },
    componentWillUnmount: function() {
        React.unmountComponentAtNode( this.getDOMNode().contentDocument.body );
    }
});
