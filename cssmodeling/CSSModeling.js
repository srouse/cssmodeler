

var CSSModeling = function () {};

CSSModeling.groups = {};

CSSModeling.process = function ( data ) {

    var less_data = JSON.parse( JSON.stringify( data ) );
    CSSModeling._process( less_data , "@" , "less" );

    var scss_data = JSON.parse( JSON.stringify( data ) );
    CSSModeling._process( scss_data , "$" , "scss" );

    return {
        less:less_data,
        scss:scss_data
    };
}

CSSModeling._process = function ( data , var_icon , extension ) {
    if ( !var_icon ) {
        var_icon = "@";
    }

    if ( data.groups ) {
        CSSModeling.groups = data.groups;
    }

    // unpack variables
    var variable,output = [],scheme;
    var variable_names,variable_name,variable_value;
    var group, variable_output;
    var final_name, final_value, var_description;
    for ( var variable_name in data.variables ) {
        variable = data.variables[variable_name];
        variable.name = variable_name;
        scheme = data.schemes[ variable.scheme ];
        group = CSSModeling.getGroup( variable.group );

        if ( !scheme ) {
            scheme = variable.scheme;
        }
        var_description  = "";
        if ( variable.description ) {
            var_description  = "/*  " + variable.description + " */\n";
        }
        group.variables.push( var_description );


        variable.names = CSSModeling.schemeToArray( scheme , variable.base );

        for ( var i=0; i<variable.names.length; i++ ) {
            variable_name = variable.names[i];
            variable_value = variable.values[i];

            final_name = var_icon + variable_name;
            final_value = CSSModeling.processAtomString(
                    variable_value,
                    variable.base, "",
                    var_icon
                );

            if ( final_name != final_value ) { // avoid circular references
                variable_output = final_name + ": " +  final_value + ";\n";
                group.variables.push( variable_output );
            }
        }

        group.variables.push( "\n" );
        group.source.variables.push( variable );
    }

    // unpack atoms
    var atom,atom_selector,atom_declaration,atom_rule,atom_description;
    var variable_names;
    for ( var atom_name in data.atoms ) {
        atom = data.atoms[atom_name];
        variable = data.variables[atom.variable];
        CSSModeling.processRuleWithVariable( data, atom, variable , "atoms", var_icon );
    }

    // unpack bases
    var base,dline,base_rule;
    for ( var base_name in data.bases ) {
        base = data.bases[base_name];
        group = CSSModeling.getGroup( base.group );
        group.source.bases.push( base );

        base_rule = base.selector + " {\n";

        base_rule += CSSModeling.renderCTags( base , "base" );

        for ( var d=0; d<base.declaration_lines.length; d++ ) {
            dline = base.declaration_lines[d];
            base_rule += "\t" + dline + "\n";
        }
        base_rule += "}\n";
        group.bases.push( base_rule );
    }

    // unpack utilities
    var util,dline,util_rule,variable,scheme;
    for ( var util_name in data.utilities ) {
        util = data.utilities[util_name];

        if ( util.scheme && data.schemes[util.scheme] ) {
            variable = {names:[],values:[]};
            scheme = data.schemes[ util.scheme ];
            variable.names = CSSModeling.schemeToArray(
                                scheme , util.base
                            );

            CSSModeling.processRuleWithVariable(
                            data, util , variable, "utilities", var_icon
                        );

        }else if ( util.variable && data.variables[util.variable] ) {
            variable = data.variables[util.variable];
            CSSModeling.processRuleWithVariable(
                            data, util, variable , "utilities", var_icon
                        );
        }else{
            group = CSSModeling.getGroup( util.group );
            group.source.utilities.push( util );

            util_rule = util.selector + " {\n";
            util_rule += CSSModeling.renderCTags( util , "utility" );

            for ( var d=0; d<util.declaration_lines.length; d++ ) {
                dline = util.declaration_lines[d];
                util_rule += "\t" + dline + "\n";
            }
            util_rule += "}\n";
            group.utilities.push( util_rule );
        }
    }


    //unpack components
    var comp;
    for ( var comp_name in data.components ) {
        comp = data.components[comp_name];
        group = CSSModeling.getGroup( comp.group );
        group.source.components.push( comp );

        comp_rule = comp.selector + " {\n";

        comp_rule += CSSModeling.renderCTags( comp , "component" );

        for ( var d=0; d<comp.basedon_lines.length; d++ ) {
            dline = comp.basedon_lines[d];
            comp_rule += "\t" + dline + ";\n";
        }
        for ( var d=0; d<comp.declaration_lines.length; d++ ) {
            dline = comp.declaration_lines[d];
            comp_rule += "\t" + dline + "\n";
        }
        comp_rule += "}\n";
        group.components.push( comp_rule );
    }

    return data;
    //CSSModeling.generateFiles( data , extension );
}

CSSModeling.processAtomString = function ( str , name , value , var_icon ) {
    if ( !str )
        return "";

    var str_out = str.replace( /@var_name/g , name );
    str_out = str_out.replace( /@base/g , name );
    str_out = str_out.replace( /@var_value/g , value );
    str_out = str_out.replace( /_@_/g , var_icon );

    return str_out.trim();
}




CSSModeling.renderCTags = function ( object , type ) {
    // add ctags
    var output = "";
    output += "\t/* -ctag-tag: "+type+","+object.group+";*/\n" ;
    output += "\t/* -ctag-type: "+type+";*/\n" ;

    if ( object.example ) {
        output += "\t/* -ctag-example: " + object.example + "; */\n";
    }else{
        output += "\t/* -ctag-example: ...; */\n";
    }

    if ( object.description ) {
        output += "\t/* -ctag-description: " + object.description + "; */\n";
    }

    return output;
}

CSSModeling.processGroupForArray = function ( groups , array_name , include_ctags ) {
    var output = [];
    for ( var group_name in groups ) {
        group = groups[group_name];
        if ( group[array_name] && group[array_name].length > 0 ) {
            output.push( "\n/*\n===================\n"
                        + group.title
                        + "\n===================\n*/\n");

            if ( include_ctags == true ) {
                output.push( "\n/* -ctag-title: " + group.title + "*/"  );
                output.push( "\n/* -ctag-description: " + group.description + "*/"  );
            }

            if ( group.description) {
                output.push( "/*  "
                            + group.description.replace(/(.{80})/g, "$1\n")
                            + "  */\n");
            }

            output = output.concat( group[array_name] );
        }
    }

    return output;
}

CSSModeling.getGroup = function ( group_name ) {

    if ( !group_name ) {
        group_name = "global";
    }

    if ( !CSSModeling.groups[ group_name ] ) {
        CSSModeling.groups[ group_name ] = {variables:[],atoms:[],title:group_name};
    }
    if ( !CSSModeling.groups[ group_name ].variables ) {
        CSSModeling.groups[ group_name ].variables = [];
    }
    if ( !CSSModeling.groups[ group_name ].atoms ) {
        CSSModeling.groups[ group_name ].atoms = [];
    }
    if ( !CSSModeling.groups[ group_name ].bases ) {
        CSSModeling.groups[ group_name ].bases = [];
    }
    if ( !CSSModeling.groups[ group_name ].utilities ) {
        CSSModeling.groups[ group_name ].utilities = [];
    }
    if ( !CSSModeling.groups[ group_name ].components ) {
        CSSModeling.groups[ group_name ].components = [];
    }
    if ( !CSSModeling.groups[ group_name ].source ) {
        CSSModeling.groups[ group_name ].source = {
            variables:[],atoms:[],bases:[],
            utilities:[],components:[]
        };
    }

    return CSSModeling.groups[ group_name ];
}


CSSModeling.schemeToArray = function ( scheme , base , prefix , depth ) {
    if ( scheme.scheme ) {
        return CSSModeling._schemeToArray( scheme.scheme , base , prefix , depth );
    }else{
        console.log( "ERROR: misformatted scheme ");
        return [];
    }
}

    CSSModeling._schemeToArray = function ( scheme , base , prefix , depth ) {
        var arr_out = [];
        if ( !prefix )
            prefix = "";
        if ( !depth )
            depth = 0;

        if ( typeof scheme == "string" ) {
            var value = prefix + scheme;
            value = value.replace( /@base/g , base );
            if ( depth == 0 ) {
                return [value];
            }else{
                return value;
            }
        }else if ( Object.prototype.toString.call( scheme ) === '[object Array]' ) {
            for ( var a=0; a<scheme.length; a++ ) {
                arr_out = arr_out.concat(
                        CSSModeling._schemeToArray( scheme[a] , base , prefix , depth++ )
                    );
            }
            return arr_out;
        }else{
            for ( var name in scheme ) {
                arr_out = arr_out.concat(
                        CSSModeling._schemeToArray( scheme[name] , base , prefix + name , depth++ )
                    );
            }
            return arr_out;
        }
    }


CSSModeling.processRuleWithVariable = function ( data, rule, variable , type, var_icon ) {
    group = CSSModeling.getGroup( rule.group );
    group.source[type].push( rule );

    rule_description  = "\n";
    if ( rule.description ) {
        rule_description  = "\n/*  " + rule.description + "*/\n";
    }
    group[type].push( rule_description );

    if ( !variable ) {
        variable = {names:[""],values:[""]};
    }

    if ( variable ) {
        for ( var i=0; i<variable.names.length; i++ ) {
            variable_name = variable.names[i];
            variable_value = variable.values[i];

            rule_selector = CSSModeling.processAtomString(
                            rule.selector,
                            variable_name, variable_value,
                            var_icon
                        );

            if ( rule.declaration_lines ) {
                rule_declaration = "";
                for ( var d=0; d<rule.declaration_lines.length; d++ ) {
                    dline = rule.declaration_lines[d];
                    dline = CSSModeling.processAtomString(
                                    dline,
                                    variable_name, variable_value,
                                    var_icon
                                );
                    rule_declaration += "\t" + dline + "\n";
                }
            }else if ( rule.declaration_values ) {
                rule_declaration = "\t" + CSSModeling.processAtomString(
                                rule.declaration_values[i],
                                variable_name, variable_value,
                                var_icon
                            );
            }else{
                rule_declaration = "\t" + CSSModeling.processAtomString(
                                rule.declaration_value,
                                variable_name, variable_value,
                                var_icon
                            );
            }


            // if it is @media for example
            if ( rule.wrapper ) {
                rule_rule = CSSModeling.processAtomString(
                                rule.wrapper[0],
                                variable_name, variable_value,
                                var_icon
                            ) + " ";

                rule_rule += rule_selector + " { " + rule_declaration + " } ";
                rule_rule += CSSModeling.processAtomString(
                                rule.wrapper[1],
                                variable_name, variable_value,
                                var_icon
                            ) + "\n";

                rule_rule += rule_selector + " {\n";
                rule_rule += CSSModeling.renderCTags( rule , "atom" );
                rule_rule += "\t" + CSSModeling.processAtomString(
                                rule.wrapper[0],
                                variable_name, variable_value,
                                var_icon
                            ) + " ";
                rule_rule += rule_declaration;
                rule_rule += CSSModeling.processAtomString(
                                rule.wrapper[1],
                                variable_name, variable_value,
                                var_icon
                            ) + "\n";
                rule_rule += "}\n";

            }else{
                rule_rule = rule_selector + " { \n";
                rule_rule += CSSModeling.renderCTags( rule , "atom" );
                rule_rule += rule_declaration + " \n}\n";
            }

            group[type].push( rule_rule );
        }
    }
}



CSSModeling.createStyleGuide = function ( data ) {
    var html = ['<!DOCTYPE html><html lang="en"><head><title>CSS System Styleguide</title>'];
    // html.push( '<link rel="stylesheet" type="text/css" href="../dist/css.css">' );
    html.push( '<link rel="stylesheet" type="text/css" href="styleguide.css">' );
    html.push( '</head><body>' );

    var variable;
    for ( var group_name in data.groups ) {

        //make sure all the defaults are decorated...
        group = CSSModeling.getGroup( group_name );//data.groups[group_name];

        html.push( "<div class='css_group group'>" );
        html.push( "<h1>" + group.title + "</h1>" );


        html.push( "<div class='css_col_right'>" );
            html.push( "<div class='css_utilities'>" );
            html.push( "<h2>Utilities</h2>" );
            var utility;
            var scheme_shortcut,util_selector,variable,scheme;
            for ( var a=0; a<group.source.utilities.length; a++ ) {
                utility = group.source.utilities[a];
                variable = data.variables[utility.variable];
                scheme = data.schemes[utility.scheme];

                if ( scheme ) {
                    scheme_shortcut = CSSModeling.processAtomString(
                        scheme.shortcut,
                        utility.base, "",
                        ""
                    );
                    util_selector = CSSModeling.processAtomString(
                        utility.selector,
                        scheme_shortcut, "",
                        ""
                    );
                    html.push( "<div class='element'>" + util_selector + "</div>" );
                }else if ( variable ) {
                    scheme = data.schemes[ variable.scheme ];
                    scheme_shortcut = CSSModeling.processAtomString(
                        scheme.shortcut,
                        variable.base, "",
                        ""
                    );
                    util_selector = CSSModeling.processAtomString(
                        utility.selector,
                        scheme_shortcut, "",
                        ""
                    );
                    html.push( "<div class='element'>" + util_selector + "</div>" );
                }else{
                    html.push( "<div class='element'>" + utility.selector + "</div>" );
                }



                //if ( utility.description ) {
                //    html.push( "<div class='description'>" + utility.description + "</div>" );
                //}
            }
            html.push( "</div>" );

            html.push( "<div class='css_bases'>" );
            html.push( "<h2>Bases</h2>" );
            var base;
            for ( var a=0; a<group.source.bases.length; a++ ) {
                base = group.source.bases[a];
                html.push( "<div class='element' onclick='showBase()'>" + base.selector + "</div>" );
                //if ( base.description ) {
                //    html.push( "<div class='description'>" + base.description + "</div>" );
                //}
            }
            html.push( "</div>" );


            html.push( "<div class='css_components'>" );
            html.push( "<h2>Components</h2>" );
            var component;
            for ( var a=0; a<group.source.components.length; a++ ) {
                component = group.source.components[a];
                html.push( "<div class='element' onclick='showBase()'>" + component.selector + "</div>" );
            }
            html.push( "</div>" );


        html.push( "</div>" );


        html.push( "<div class='css_col_left'>" );
            html.push( "<div class='css_variables'>" );
            html.push( "<h2>Variables</h2>" );
            for ( var v=0; v<group.source.variables.length; v++ ) {
                variable = group.source.variables[v];
                scheme = data.schemes[ variable.scheme ];

                //html.push( "<p>" + variable.name + "</p>" );
                html.push( "<div class='element' onclick='showVar("+v+")'>@" +
                    CSSModeling.processAtomString(
                        scheme.shortcut,
                        variable.base, "",
                        ""
                    )
                    + "</div>" );
                //if ( variable.description ) {
                //    html.push( "<div class='description'>" + variable.description + "</div>" );
                //}
            }
            html.push( "</div>" );
        html.push( "</div>" );

        html.push( "<div class='css_col_left'>" );
            html.push( "<div class='css_atoms'>" );
            html.push( "<h2>Atoms</h2>" );
            var scheme_shortcut,atom_selector;
            for ( var a=0; a<group.source.atoms.length; a++ ) {
                atom = group.source.atoms[a];
                variable = data.variables[ atom.variable ];
                if ( variable ) {
                    scheme = data.schemes[ variable.scheme ];
                    scheme_shortcut = CSSModeling.processAtomString(
                        scheme.shortcut,
                        variable.base, "",
                        ""
                    );
                    atom_selector = CSSModeling.processAtomString(
                        atom.selector,
                        scheme_shortcut, "",
                        ""
                    );
                    html.push( "<div class='element'>" + atom_selector + "</div>" );
                }else{
                    html.push( "<div class='element'>" + atom.selector + "</div>" );
                }
                //if ( atom.description ) {
                //    html.push( "<div class='description'>" + atom.description + "</div>" );
                //}
            }
            html.push( "</div>" );
        html.push( "</div>" );




        html.push( "</div>" );
    }

    //html += "<div class>" + + "</div>";

    html.push( "</body></html>" );

    return html.join("\n");
}


var module = module || {};
module.exports = CSSModeling;
