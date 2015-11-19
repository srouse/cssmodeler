


var StyleGuide = React.createClass({

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

    goto: function( type , id ){
        RS.merge({
            detail:id,
            type:type,
            detail_index:""+0
        });
    },

    getSchemeShortcut: function ( css_obj, base ) {
        var scheme = CSSModel.schemes[ css_obj.scheme ];
        if ( scheme ) {
            return scheme.shortcut.replace( "@base" , base );
        }else{
            return "no scheme found";
        }
    },

    getLeftColumn: function( group ){

        var atom,atom_html,col_left;
        atom_html = [];
        atom_html.push(
            <div className="Cmod-StyleGuide__column__header">
                Atoms
            </div>
        );
        for ( var atom_name in group.atoms ) {
            atom = group.atoms[ atom_name ];

            atom_title = atom.selector;
            if ( atom.scheme ) {
                atom_title = this.getSchemeShortcut(
                                    atom,
                                    atom.selector.replace( /\@var_name/g , atom.base )
                                );
            }
            if ( atom.variable ) {
                var variable = CSSModel.variables[ atom.variable ];
                atom_title = this.getSchemeShortcut(
                                    variable,
                                    atom.selector.replace( /\@var_name/g , variable.base )
                                );
            }

            atom_html.push(
                <div className="Cmod-StyleGuide__column__item"
                    onClick={ this.goto.bind( this , "atom" , atom_name ) }
                    dangerouslySetInnerHTML={ {__html:atom_title} }>
                </div>
            );
        }

        if ( atom_html.length == 1 ) {
            atom_html = [];
        }

        col_left = [];
        col_left.push(
            <div className="Cmod-StyleGuide__column">
                { atom_html }
            </div>
        );
        return col_left;
    },



    getRightColumn: function( group ){
        var scheme;

        var bases,base_html;
        base_html = [];
        base_html.push(
            <div className="Cmod-StyleGuide__column__header">
                Resets/Bases
            </div>
        );
        for ( var base_name in group.bases ) {
            base = group.bases[ base_name ];
            base_html.push(
                <div className="Cmod-StyleGuide__column__item"
                    onClick={ this.goto.bind( this , "base" , base_name ) }
                    dangerouslySetInnerHTML={ {__html:base.selector} }>
                </div>
            );
        }
        if ( base_html.length == 1 ) {
            base_html = [];
        }

        var utilities,utility_html,utility_title;
        utility_html = [];
        utility_html.push(
            <div className="Cmod-StyleGuide__column__header">
                Utilities
            </div>
        );
        for ( var utility_name in group.utilities ) {
            utility = group.utilities[ utility_name ];

            utility_title = utility.selector;
            if ( utility.scheme ) {
                scheme = CSSModel.schemes[ utility.scheme ];
                utility_title = this.getSchemeShortcut(
                                        utility,
                                        utility.base
                                    );
            }

            utility_html.push(
                <div className="Cmod-StyleGuide__column__item"
                    onClick={ this.goto.bind( this , "utility" , utility_name ) }
                    dangerouslySetInnerHTML={ {__html:utility_title} }>
                </div>
            );
        }

        if ( utility_html.length == 1 ) {
            utility_html = [];
        }


        var col_right = [];
        col_right.push(
            <div className="Cmod-StyleGuide__column float-right">
                { utility_html }
                { base_html }
            </div>
        );
        return col_right;
    },

    render: function() {
        var html = [];
        var group,col_left,col_right;
        for ( var group_name in CSSModel.groups ) {
            group = CSSModel.groups[ group_name ];

            col_left = this.getLeftColumn( group );
            col_right = this.getRightColumn( group );

            html.push(
                <div className="Cmod-StyleGuide__group">
                    <div className="Cmod-StyleGuide__group__title">
                        { group.title }
                    </div>
                    { col_left }{ col_right }
                </div>
            );
        }

        return  <div className="Cmod-StyleGuide">
                    { html }
                    <Detail />
                </div>;
    }

});
