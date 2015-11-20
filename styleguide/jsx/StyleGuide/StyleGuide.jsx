


var StyleGuide = React.createClass({

    componentWillMount: function() {
        var me = this;
        RouteState.addDiffListeners(
    		["page"],
    		function ( route , prev_route ) {
                me.forceUpdate();
    		},
            "StyleGuide"
    	);
    },

    componentWillUnmount: function(){
        RouteState.removeDiffListenersViaClusterId( "StyleGuide" );
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

    viewComp: function ( parent_uuid , uuid ) {
        RS.merge({
            tree:parent_uuid,
            rule:uuid,
            detailTab:"example"
        });
    },

    changePage: function ( page ) {
        RS.merge({
            page:page
        });
    },

    render: function() {
        var html = [];
        if ( RS.route.page == "comps" ) {
            var component;

            var components = CSSModel.component_data.css_dom
                .sort(function(a, b)
                        {
                            var x=a.name.toLowerCase(),
                                y=b.name.toLowerCase();
                            return x<y ? -1 : x>y ? 1 : 0;
                        }
                );

            for ( var c=0; c<components.length; c++ ) {
                component = components[ c ];

                //col_left = this.getLeftColumn( group );
                //col_right = this.getRightColumn( group );

                var col_1 = [];
                col_1.push(
                    <div className="Cmod-StyleGuide__column float-right">
                        <div className="Cmod-StyleGuide__column__header">
                            States
                        </div>
                        <div className="Cmod-StyleGuide__column__item"
                            dangerouslySetInnerHTML={ {__html:component.name} }>
                        </div>
                    </div>
                );

                var children_html = [],child;
                for ( var a=0; a<component.children.length; a++ ) {
                    child = component.children[a];
                    children_html.push(
                        <div className="Cmod-StyleGuide__column__item"
                            onClick={ this.viewComp.bind( this ,
                                component.uuid,
                                child.uuid
                            ) }
                            dangerouslySetInnerHTML={ {__html:child.name} }>
                        </div>
                    );
                }
                var col_2 = [];
                col_2.push(
                    <div className="Cmod-StyleGuide__column">
                        <div className="Cmod-StyleGuide__column__header">
                            Child Components
                        </div>
                        { children_html }
                    </div>
                );

                html.push(
                    <div className="Cmod-StyleGuide__group">
                        <div className="Cmod-StyleGuide__group__title">
                            { component.name }
                        </div>
                        { col_1 }{ col_2 }
                    </div>
                );
            }
        }else{
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
        }


        return  <div className="Cmod-StyleGuide">
                    <div className="Cmod-StyleGuide__mainNav">
                        <div className="Cmod-StyleGuide__mainNav__link component"
                            onClick={ this.changePage.bind( this , "comps" ) }>
                            <div>Components</div></div>
                        <div className="Cmod-StyleGuide__mainNav__link core"
                            onClick={ this.changePage.bind( this , "" ) }>
                            <div>Core</div></div>
                    </div>
                    <div className="Cmod-StyleGuide__content">
                        { html }
                    </div>

                    <Detail />
                    <RuleDetail css_info={ CSSModel.component_data } />
                </div>;
    }

});
