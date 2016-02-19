


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

    getSchemeShortcut: function ( css_obj, selector , base ) {
        var scheme = CSSModel.schemes[ css_obj.scheme ];
        var shortcut = false;

        if ( scheme )
            shortcut = scheme.shortcut;

        if ( css_obj.shortcut )
            shortcut = css_obj.shortcut;

        if ( base ) {
            selector = selector.replace( /\@var_name_no_base/g , "" );
            selector = selector.replace( /\@var_name/g , base );
        }else{
            selector = selector.replace( /\@var_name/g , "" );
        }

        if ( shortcut )
            return shortcut.replace( "@base" , selector );

        return "no scheme found";
    },

    getLeftColumn: function( group ){

        var atom,atom_html,col_left;
        atom_html = [];
        atom_html.push(
            <div className="Cmod-StyleGuide__column__header">
                Atoms
            </div>
        );

        // for ( var atom_name in group.atoms ) {
        var sub_group;
        for ( var sub_group_name in group.sub_groups ) {
            sub_group = group.sub_groups[ sub_group_name ];

            if (
                sub_group.atoms.length > 0 &&
                sub_group.title != "uncategorized"
            ) {
                atom_html.push(
                    <div className="Cmod-StyleGuide__column__subHeader">
                        { sub_group.title }
                    </div>
                );
            }

            for ( var a=0; a<sub_group.atoms.length; a++ ) {

                atom = sub_group.atoms[ a ];

                atom_title = atom.selector;
                if ( atom.scheme ) {
                    atom_title = this.getSchemeShortcut(
                                        atom,
                                        atom.selector,
                                        atom.base
                                    );
                }

                if ( atom.variable ) {
                    var variable = CSSModel.variable_lookup[ atom.variable ];
                    atom_title = this.getSchemeShortcut(
                                        variable,
                                        atom.selector,
                                        variable.base
                                    );
                }

                atom_html.push(
                    <div className="Cmod-StyleGuide__column__item"
                        key={ atom.name }
                        onClick={ this.goto.bind( this , "atom" , atom.name ) }
                        dangerouslySetInnerHTML={ {__html:atom_title} }>
                    </div>
                );
            }
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

    getVariableList: function( group ){

        var scheme;

        var variables,utility_html,variable_title;
        variable_html = [];
        variable_html.push(
            <div className="Cmod-StyleGuide__column__header">
                Variables
            </div>
        );

        //for ( var variable_name in group.variables ) {
        for ( var a=0; a<group.variables.length; a++ ) {
            variable = group.variables[ a ];

            if ( variable.ignore_variable === true ) {
                continue;
            }

            variable_title = "<em>" + variable.selector + "</em>";
            if ( variable.scheme ) {
                scheme = CSSModel.schemes[ variable.scheme ];
                variable_title = this.getSchemeShortcut(
                                        variable,
                                        variable.base
                                    );
            }

            variable_html.push(
                <div className="Cmod-StyleGuide__column__item"
                    key={ variable.name }
                    onClick={ this.goto.bind( this , "variable" , variable.name ) }
                    dangerouslySetInnerHTML={ {__html:variable_title} }>
                </div>
            );
        }

        if ( variable_html.length == 1 ) {
            variable_html = [];
        }

        return variable_html;
    },

    getRightColumn: function( group ){
        var scheme;

        var utilities,utility_html,utility_title;
        utility_html = [];
        utility_html.push(
            <div className="Cmod-StyleGuide__column__header">
                Utilities
            </div>
        );

        // for ( var utility_name in group.utilities ) {
        for ( var u=0; u<group.utilities.length; u++ ) {
            utility = group.utilities[ u ];

            utility_title = "<em>" + utility.selector + "</em>";
            if ( utility.scheme ) {
                scheme = CSSModel.schemes[ utility.scheme ];
                utility_title = this.getSchemeShortcut(
                                        utility,
                                        utility.base
                                    );
            }

            utility_html.push(
                <div className="Cmod-StyleGuide__column__item"
                    key={ utility.name }
                    onClick={ this.goto.bind( this , "utility" , utility.name ) }
                    dangerouslySetInnerHTML={ {__html:utility_title} }>
                </div>
            );
        }

        if ( utility_html.length == 1 ) {
            utility_html = [];
        }



        var variable_html = this.getVariableList( group );


        var col_right = [];
        col_right.push(
            <div className="Cmod-StyleGuide__column float-right">
                { utility_html }
                { variable_html }
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
            var component,components;
            var comps_html,objects_html;

            for ( var status_type in CSSModel.component_data.status_hash ) {
                components = CSSModel.component_data.status_hash[ status_type ];

                comps_html = [];
                objects_html = [];
                //var components = CSSModel.component_data.css_dom
                components = components
                    .sort(function(a, b)
                            {
                                var x=a.name.toLowerCase(),
                                    y=b.name.toLowerCase();
                                return x<y ? -1 : x>y ? 1 : 0;
                            }
                    );

                for ( var c=0; c<components.length; c++ ) {
                    component = components[ c ];
                    var col_1 = [];

                    var type_html;
                    if ( component.name.indexOf( ".o-") == 0 ) {
                        type_html = objects_html;
                    }else{
                        type_html = comps_html;
                    }
                    type_html.push(
                        <div className="c-styleGuideComps__component"
                            onClick={ this.viewComp.bind( this ,
                                component.uuid,
                                component.uuid
                            ) }>
                            <div className="c-styleGuideComps__component__typeIcon">
                                <TypeIcon rule={ component } />
                            </div>
                            { component.name }
                        </div>
                    );

                }

                if ( status_type == "dev" ) {
                    status_type = "Development";
                    html.push(
                        <div className="c-styleGuideComps__group">
                            <div className="c-styleGuideComps__group__title">
                                { status_type }
                            </div>
                            <div className="c-styleGuideComps__objectGroup">{ objects_html }</div>
                            <div className="c-styleGuideComps__componentGroup">{ comps_html }</div>
                        </div>
                    );
                }else if ( status_type == "prod" ) {
                    status_type = "Production";
                    html.unshift(
                        <div className="c-styleGuideComps__group">
                            <div className="c-styleGuideComps__group__title">
                                { status_type }
                            </div>
                            <div className="c-styleGuideComps__objectGroup">{ objects_html }</div>
                            <div className="c-styleGuideComps__componentGroup">{ comps_html }</div>
                        </div>
                    );
                }else{
                    html.push(
                        <div className="c-styleGuideComps__group">
                            <div className="c-styleGuideComps__group__title">
                                { status_type.charAt(0).toUpperCase() + status_type.slice(1) }
                            </div>
                            <div className="c-styleGuideComps__objectGroup">{ objects_html }</div>
                            <div className="c-styleGuideComps__componentGroup">{ comps_html }</div>
                        </div>
                    );
                }

                html.push(
                    <div className="c-styleGuideComps__key">
                        <div className="c-styleGuideComps__key__item">
                            <div className="c-styleGuideComps__key__typeIcon">
                                <TypeIcon rule={{
                                        has_error:false,
                                        type:"tagged_rule",
                                        metadata:{
                                            complete:true,
                                            based_on:false
                                        },
                                        is_extended:false
                                }} />
                            </div>
                            complete
                        </div>
                        <div className="c-styleGuideComps__key__item">
                            <div className="c-styleGuideComps__key__typeIcon">
                                <TypeIcon rule={{
                                        has_error:false,
                                        type:"rule",
                                        is_extended:false
                                }} />
                            </div>
                            no example
                        </div>
                        <div className="c-styleGuideComps__key__item">
                            <div className="c-styleGuideComps__key__typeIcon">
                                <TypeIcon rule={{
                                        has_error:true,
                                        type:"rule",
                                        is_extended:false
                                }} />
                            </div>
                            error
                        </div>
                    </div>
                )

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
                        <h1>Style Guide</h1>
                    </div>
                    <div className="Cmod-StyleGuide__content">
                        { html }
                    </div>

                    <Detail />
                    <VariableDetail />
                    { /* <RuleDetail css_info={ CSSModel.component_data } /> */ }
                </div>;
    }

});
