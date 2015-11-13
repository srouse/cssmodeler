

var CSSModeling = function () {};

CSSModeling.groups = {};

CSSModeling.process = function ( data ) {

    var less_data = JSON.parse( JSON.stringify( data ) );
    CSSModeling._process( less_data , "@" );

    var scss_data = JSON.parse( JSON.stringify( data ) );
    CSSModeling._process( scss_data , "$" );

    var state_data,less_states=[];
    for ( var state_name in data.states ) {
        state_data = JSON.parse( JSON.stringify( data ) );
        state_data.state_name = state_name;
        CSSModeling._process(
                    state_data , "@" ,
                    data.states[state_name]
                );
        less_states.push( state_data );
    }

    var state_data,scss_states=[];
    for ( var state_name in data.states ) {
        state_data = JSON.parse( JSON.stringify( data ) );
        state_data.state_name = state_name;
        CSSModeling._process(
                    state_data , "$" ,
                    data.states[state_name]
                );
        scss_states.push( state_data );
    }

    return {
        less:less_data,
        scss:scss_data,
        less_states:less_states,
        scss_states:scss_states
    };
}

CSSModeling._process = function ( data , var_icon , wrapper_info ) {

    var is_style = false;
    var wrapper_name,wrapper;
    var important = false;
    if ( wrapper_info ) {
        is_style = true;
        important = wrapper_info.important;
    }

    if ( !var_icon ) {
        var_icon = "@";
    }

    if ( data.groups ) {
        CSSModeling.groups = data.groups;
    }

    // unpack variables
    var variable,scheme;
    var variable_names,variable_name,variable_value;
    var group, variable_output;
    var final_name, final_value, var_description;
    for ( var variable_name in data.variables ) {
        variable = data.variables[variable_name];
        var css_values = [];

        variable.name = variable_name;
        scheme = data.schemes[ variable.scheme ];
        group = CSSModeling.getGroup( variable.group, data.groups );

        if ( !scheme ) {
            scheme = variable.scheme;
        }

        var_description  = "";
        //if ( variable.description ) {
        //    var_description  = "/*  " + variable.description + " */\n";
        //}

        if ( !is_style ) {
            group.variables.push( var_description );
            css_values.push( var_description );
        }
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

            if ( !is_style ) {
                if ( final_name != final_value ) { // avoid circular references
                    variable_output = final_name + ": " +  final_value + ";\n";
                    group.variables.push( variable_output );
                    css_values.push( variable_output );
                }
            }
        }
        if ( !is_style ) {
            group.variables.push( "\n" );
            css_values.push( "\n" );
        }
        group.source.variables.push( variable );
        variable.css_string = css_values.join("");
        // same for vars...
        variable.mixins_string = css_values.join("");
    }

    // unpack atoms
    var atom,atom_selector,atom_declaration,atom_rule,atom_description;
    var variable_names;
    for ( var atom_name in data.atoms ) {
        atom = data.atoms[atom_name];
        atom.name = atom_name;

        variable = data.variables[atom.variable];

        if ( wrapper_info ) {
            atom.wrapper = wrapper_info.wrapper;
            atom.selector = "." + wrapper_info.name + "-" + atom.selector.substring( 1 );
        }

        CSSModeling.processRuleWithVariable(
                        data, atom, variable,
                        "atoms", var_icon, important
                    );
    }

    // unpack bases
    if ( !is_style ) {
        var base,dline,base_rule;
        for ( var base_name in data.bases ) {
            base = data.bases[base_name];
            base.name = base_name;

            // wrappers don't make sense with bases
            CSSModeling.processRuleWithVariable(
                            data, base, false ,
                            "bases", var_icon, important
                        );
        }
    }

    // unpack utilities
    var util,dline,util_rule,variable,scheme;
    for ( var util_name in data.utilities ) {
        util = data.utilities[util_name];
        util.name = util_name;

        if ( wrapper_info ) {
            util.wrapper = wrapper_info.wrapper;
            util.selector = "." + wrapper_info.name + "-" + util.selector.substring( 1 );
        }

        CSSModeling.processRuleWithVariable(
                        data, util, variable,
                        "utilities", var_icon, important
                    );
    }

    /*if ( !is_style ) {
        //unpack components
        var comp,dline,comp_rule;
        for ( var comp_name in data.components ) {
            comp = data.components[comp_name];
            comp.name = comp_name;

            // wrappers don't make sense with comps
            CSSModeling.processRuleWithVariable(
                            data, comp, false ,
                            "components", var_icon, important
                        );
        }
    }*/

    return data;
}




CSSModeling.processAtomString = function ( str , name , value , var_icon ) {
    if ( !str )
        return "";

    var str_out = str.replace( /@var_name/g , name );
    str_out = str_out.replace( /@base/g , name );
    str_out = str_out.replace( /@var_value/g , value );
    str_out = str_out.replace( /_@_/g , var_icon );

    var include_icon = ".";
    var is_less = ( var_icon == "@" );
    if ( !is_less ) {// is SCSS
        include_icon = "@include ";
    }

    if ( str_out.indexOf( "calc(" ) != -1 ) {
        if ( is_less ) {
            // little brut force...should be a regex.
            str_out = str_out.replace(/ \+ /g, " ~'+' " );
            str_out = str_out.replace(/ \- /g, " ~'-' " );
            str_out = str_out.replace(/ \/ /g, " ~'/' " );
            str_out = str_out.replace(/ \* /g, " ~'*' " );
        }else{
            str_out_arr = str_out.split("$");

            var section,next_space_index,next_paren_index,new_section,new_str_out=[];
            for ( var i=0; i<str_out_arr.length; i++ ) {
                section = str_out_arr[i];
                if ( i != 0 ) {
                    next_space_index = section.indexOf( " " );
                    next_paren_index = section.indexOf( ")" );

                    end_index = section.length;
                    if ( next_space_index != -1 )
                        end_index = next_space_index;
                    if ( next_paren_index != -1 )
                        end_index = Math.min( end_index , next_paren_index );

                    new_str_out.push( "#{$" );
                    new_section = section.substr( 0, end_index )
                                + "}"
                                + section.substr( end_index );
                    new_str_out.push( new_section );
                }else{
                    new_str_out.push( section );
                }
            }
            str_out = new_str_out.join("");
        }
    }

    str_out = str_out.replace( /_inc_/g , include_icon );

    return str_out.trim();
}




CSSModeling.renderCTags = function ( object , type ) {
    return "";

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
    var output = [],group;
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

            //if ( group.description) {
            //    output.push( "/*  "
            //                + group.description.replace(/(.{80})/g, "$1\n")
            //                + "  */\n");
            //}


            output = output.concat( group[array_name] );
        }
    }
    return output;
}

CSSModeling.processTypeForArray = function ( type_objs, include_ctags ) {
    var output = [],type_obj;
    var css_output = [],mixins_output = [];
    for ( var type_name in type_objs ) {
        type_obj = type_objs[type_name];

        if ( include_ctags == true ) {
            css_output.push( "\n/* -ctag-title: " + group.title + "*/"  );
            css_output.push( "\n/* -ctag-description: " + group.description + "*/"  );
        }

        // if ( type_obj.description) {
        //    css_output.push( "/*  "
        //                + type_obj.description.replace(/(.{80})/g, "$1\n")
        //                + "  */\n");
        // }*/

        css_output.push( type_obj.css_string );
        mixins_output.push( type_obj.mixins_string );
    }
    return {css:css_output,mixins:mixins_output};
}

CSSModeling.getGroup = function ( group_name , groups ) {

    //groups = CSSModeling.groups;

    if ( !group_name ) {
        group_name = "global";
    }

    if ( !groups[ group_name ] ) {
        groups[ group_name ] = {variables:[],atoms:[],title:group_name};
    }
    if ( !groups[ group_name ].variables ) {
        groups[ group_name ].variables = [];
    }
    if ( !groups[ group_name ].atoms ) {
        groups[ group_name ].atoms = [];
    }
    if ( !groups[ group_name ].bases ) {
        groups[ group_name ].bases = [];
    }
    if ( !groups[ group_name ].utilities ) {
        groups[ group_name ].utilities = [];
    }
    if ( !groups[ group_name ].components ) {
        groups[ group_name ].components = [];
    }
    if ( !groups[ group_name ].source ) {
        groups[ group_name ].source = {
            variables:[],atoms:[],bases:[],
            utilities:[],components:[]
        };
    }

    return groups[ group_name ];
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


CSSModeling.processRuleWithVariable = function (
    data, rule, variable,
    type, var_icon, important
) {
    var is_less = var_icon == "@";
    group = CSSModeling.getGroup( rule.group, data.groups );
    group.source[type].push( rule );

    rule_description  = "\n";
    if ( rule.description ) {
        rule_description  = "\n/*  " + rule.description + "*/\n";
    }
    group[type].push( rule_description );

    // some exceptions...
    if ( rule.scheme && data.schemes[rule.scheme] ) {
        variable = {names:[],values:[]};
        scheme = data.schemes[ rule.scheme ];
        variable.names = CSSModeling.schemeToArray(
                            scheme , rule.base
                        );
    }else if ( rule.variable && data.variables[rule.variable] ) {
        variable = data.variables[rule.variable];
    }

    // catch if there isn't a variable
    if ( !variable ) {
        variable = {names:[""],values:[""]};
    }

    if ( variable ) {
        var all_rule_css_strs = [],rule_css_str;
        var all_rule_mixins_strs = [],rule_mixins_str;
        for ( var i=0; i<variable.names.length; i++ ) {
            variable_name = variable.names[i];
            variable_value = variable.values[i];

            rule_selector = CSSModeling.processAtomString(
                            rule.selector,
                            variable_name, variable_value,
                            var_icon
                        );

            rule_declaration = "";
            if ( rule.declaration_lines ) {

                var dline;
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

                rule_declaration += "\t" + CSSModeling.processAtomString(
                                rule.declaration_values[i],
                                variable_name, variable_value,
                                var_icon
                            );

            }else{

                rule_declaration += "\t" + CSSModeling.processAtomString(
                                rule.declaration_value,
                                variable_name, variable_value,
                                var_icon
                            );

            }


            if ( important ) {
                rule_declaration = rule_declaration.replace(/;/g , " !important;" );
            }

            var rule_css_declaration = rule_declaration;
            var rule_mixin_declaration = rule_declaration;

            if ( !is_less ) {
                rule_mixin_declaration = rule_declaration.replace(/;/g , " $important;" );
            }

            if ( rule.declaration_includes ) {
                var dline;
                for ( var d=0; d<rule.declaration_includes.length; d++ ) {
                    dline = rule.declaration_includes[d];
                    dline = CSSModeling.processAtomString(
                                    dline,
                                    variable_name, variable_value,
                                    var_icon
                                );

                    rule_css_declaration += "\t" + dline + "\n";

                    if ( !is_less ) {
                        if ( important ) {
                            dline = dline.replace(/;/g , " ( !important );" );
                        }else{
                            dline = dline.replace(/;/g , " ();" );
                        }
                    }

                    rule_mixin_declaration += "\t" + dline + "\n";
                }
            }

            // if it is a state context (@media for example)
            if ( rule.wrapper ) {

                // CSS str
                rule_css_str = rule_selector + " { ";
                rule_css_str += CSSModeling.processAtomString(
                                rule.wrapper[0],
                                variable_name, variable_value,
                                var_icon
                            ) + " ";

                rule_css_str += rule_css_declaration

                rule_css_str += CSSModeling.processAtomString(
                                rule.wrapper[1],
                                variable_name, variable_value,
                                var_icon
                            ) + "\n";
                rule_css_str +=  " } ";

                // Mixin str
                if ( is_less ) {
                    rule_mixins_str = rule_selector + " () {\n";
                }else{
                    rule_mixins_str = "@mixin "
                        + rule_selector.replace(/\./g , "" )
                        + " ( $important:null ) {\n";
                }
                rule_mixins_str += CSSModeling.renderCTags( rule , "atom" );
                rule_mixins_str += "\t" + CSSModeling.processAtomString(
                                rule.wrapper[0],
                                variable_name, variable_value,
                                var_icon
                            ) + " ";

                rule_mixins_str += rule_mixin_declaration;

                rule_mixins_str += CSSModeling.processAtomString(
                                rule.wrapper[1],
                                variable_name, variable_value,
                                var_icon
                            ) + "\n";
                rule_mixins_str += "}\n";

            }else{

                // CSS str
                rule_css_str = rule_selector + " { \n";
                rule_css_str += CSSModeling.renderCTags( rule , "atom" );
                rule_css_str += rule_css_declaration;
                rule_css_str += " \n}\n";

                // Mixin str
                rule_mixins_str = "";
                if ( type != "bases" ) {

                    if ( is_less ) {
                        rule_mixins_str += rule_selector + " () {\n";
                    }else{
                        rule_mixins_str += "@mixin "
                            + rule_selector.replace(/\./g , "" )
                            + " ( $important:null ) {\n";
                    }
                    rule_mixins_str += CSSModeling.renderCTags( rule , "atom" );
                    rule_mixins_str += rule_mixin_declaration;
                    rule_mixins_str += " \n}\n";
                }

            }

            all_rule_css_strs.push( rule_css_str );
            all_rule_mixins_strs.push( rule_mixins_str );

            group[type].push( rule_css_str );
            group[type].push( rule_mixins_str );
        }

        rule.css_string = all_rule_css_strs.join("\n");
        rule.mixins_string = all_rule_mixins_strs.join("\n");
    }
}



CSSModeling.createStyleGuide = function ( data ) {
    var html = ['<!DOCTYPE html><html lang="en"><head><title>CSS System Styleguide</title>'];
    // html.push( '<link rel="stylesheet" type="text/css" href="../dist/css.css">' );
    html.push( '<link rel="stylesheet" type="text/css" href="styleguide.css">' );
    html.push( '<script src="jquery.min.js"></script>' );
    html.push( '<script src="styleguide.js"></script>' );
    html.push( '</head><body>' );

    var html_details = [];

    html.push( "<div class='groups'>" );
    var variable;
    for ( var group_name in data.groups ) {

        //make sure all the defaults are decorated...
        group = CSSModeling.getGroup( group_name, data.groups );//data.groups[group_name];

        if (
            group.source.atoms.length == 0 &&
            group.source.bases.length == 0 &&
            group.source.utilities.length == 0
        ) {
            continue;
        }

        html.push( "<div class='css_group group'>" );
        html.push( "<h1>" + group.title + "</h1>" );

        /*
        html.push( "<div class='css_col_right'>" );

            // =================COMPONENTS================
            html.push( "<div class='css_components'>" );
            html.push( "<h2>Components</h2>" );
            var component;
            for ( var a=0; a<group.source.components.length; a++ ) {
                component = group.source.components[a];
                html.push( "<div class='element' onclick='showBase()'>" + component.selector + "</div>" );
            }
            html.push( "</div>" );

        html.push( "</div>" );
        */


        // =================VARIABLES================
        /*
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
        */

        // =================ATOMS==================
        html.push( "<div class='css_col_left'>" );

            // ===========ATOMS===============================
            if ( group.source.atoms.length > 0 ) {
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
                        html.push( "<div class='element' onClick='showDetail(\""+atom.name+"\",\"atom\")'>" + atom_selector + "</div>" );
                    }else{
                        html.push( "<div class='element' onClick='showDetail(\""+atom.name+"\",\"atom\")'>" + atom.selector + "</div>" );
                    }
                    //if ( atom.description ) {
                    //    html.push( "<div class='description'>" + atom.description + "</div>" );
                    //}

                    //console.log( atom.name );
                    html_details.push( CSSModeling.createStyleGuideDetail( atom , "atom") );
                }
                html.push( "</div>" );
            }

            // ===========UTILITIES===============================
            if ( group.source.utilities.length > 0 ) {
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
                        html.push( "<div class='element' onClick='showDetail(\""+utility.name+"\",\"utility\")'>" + util_selector + "</div>" );
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
                        html.push( "<div class='element' onClick='showDetail(\""+utility.name+"\",\"utility\")'>" + util_selector + "</div>" );
                    }else{
                        html.push( "<div class='element' onClick='showDetail(\""+utility.name+"\",\"utility\")'>" + utility.selector + "</div>" );
                    }

                    //if ( utility.description ) {
                    //    html.push( "<div class='description'>" + utility.description + "</div>" );
                    //}

                    html_details.push( CSSModeling.createStyleGuideDetail( utility , "utility") );
                }
                html.push( "</div>" );
            }

            // ===========BASES===============================
            if ( group.source.bases.length > 0 ) {
                html.push( "<div class='css_bases'>" );
                html.push( "<h2>Bases</h2>" );
                var base;
                for ( var a=0; a<group.source.bases.length; a++ ) {
                    base = group.source.bases[a];
                    html.push( "<div class='element' onClick='showDetail(\""+base.name+"\",\"base\")'>" + base.selector + "</div>" );
                    //if ( base.description ) {
                    //    html.push( "<div class='description'>" + base.description + "</div>" );
                    //}

                    html_details.push( CSSModeling.createStyleGuideDetail( base , "base") );
                }
                html.push( "</div>" );
            }

        html.push( "</div>" );
        html.push( "</div>" );
    }

    html.push( "</div>" );

    html.push( "<div class='style_details'>" + html_details.join("") + "</div>" );

    html.push( "</body></html>" );

    return html.join("\n");
}

CSSModeling.createStyleGuideDetail = function ( style_obj , type ) {
    return "<div class='style_detail style_"+type+"_"+style_obj.name+"'>" +
                "<pre>" +
                style_obj.css_string +
                "</pre>" +
            "</div>";
}

var module = module || {};
module.exports = CSSModeling;
