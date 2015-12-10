

var CSSModeling = function () {};

CSSModeling.groups = {};

CSSModeling.process = function ( data , preprocessor_type ) {

    CSSModeling.data = data;

    if ( preprocessor_type == "less" ) {
        var less_data = JSON.parse( JSON.stringify( data ) );
        CSSModeling._process( less_data , "@" );

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

        return {
            less:less_data,
            less_states:less_states
        };
    }else if ( preprocessor_type == "scss" ) {
        var scss_data = JSON.parse( JSON.stringify( data ) );
        CSSModeling._process( scss_data , "$" );

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
            scss:scss_data,
            scss_states:scss_states
        };
    }
}

CSSModeling._process = function ( data , var_icon , wrapper_info ) {

    var is_style = false;
    var wrapper;
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

    for ( var v=0; v<data.variables.length; v++ ) {
        variable = data.variables[v];

        var css_values = [];
        scheme = data.schemes[ variable.scheme ];

        if ( !scheme ) {
            scheme = variable.scheme;
        }

        var_description  = "";

        if ( !is_style ) {
            css_values.push( var_description );
        }
        variable.names = CSSModeling.schemeToArray( scheme , variable.base );

        var rotation_total = Math.floor( variable.names.length / variable.values.length );

        for ( var i=0; i<variable.names.length; i++ ) {
            variable_name = variable.names[i];
            // repeat if there is not enough values....
            // TODO: throw warning if isn't evenly divisible
            if ( rotation_total > 1 ) {
                variable_value = variable.values[ i % variable.values.length ];
            }else{
                variable_value = variable.values[i];
            }

            final_name = var_icon + variable_name;
            final_value = CSSModeling.processAtomString(
                    variable_value,
                    variable.base, "",
                    var_icon
                );

            if ( !is_style ) {
                if ( final_name != final_value ) { // avoid circular references
                    variable_output = final_name + ": " +  final_value + ";\n";
                    css_values.push( variable_output );
                }
            }
        }
        if ( !is_style ) {
            css_values.push( "\n" );
        }

        variable.css_string = css_values.join("");
        variable.css_array = css_values;

        // same for vars...
        variable.mixins_string = css_values.join("");
        variable.mixins_array = css_values;

        if ( variable.atoms ) {
            var atom;
            for ( var a=0; a<variable.atoms.length; a++ ) {
                atom = variable.atoms[a];
                atom.variable = variable.name;
                data.atoms.push( atom );
            }

            // don't pass them into final file...
            delete variable.atoms;
        }

        if ( data.variable_lookup[ variable.name ] ) {
            console.warn( "Dup variable names: " + variable.name );
        }else{
            data.variable_lookup[ variable.name ] = variable;
        }

    }

    // unpack atoms
    var atom,atom_selector,atom_declaration,atom_rule,atom_description;
    var variable_names;
    for ( var a=0; a<data.atoms.length; a++ ) {
        atom = data.atoms[a];

        if ( wrapper_info ) {
            atom.wrapper = wrapper_info.wrapper;
            atom.selector = "." + wrapper_info.name + "-" + atom.selector.substring( 1 );
            atom.wrapper_prefix = wrapper_info.name + "-"; // comes in w/o dash
        }

        CSSModeling.processRuleWithVariable(
                        data, atom,
                        "atoms", var_icon, important
                    );
    }

    // unpack bases
    /*if ( !is_style ) {
        var base,dline,base_rule;
        for ( var base_name in data.bases ) {
            base = data.bases[base_name];
            base.name = base_name;

            // wrappers don't make sense with bases
            CSSModeling.processRuleWithVariable(
                            data, base,
                            "bases", var_icon, important
                        );
        }
    }*/


    // unpack utilities
    var util,dline,util_rule,variable,scheme;
    for ( var u=0; u<data.utilities.length; u++ ) {
        util = data.utilities[u];

        if ( wrapper_info ) {
            util.wrapper = wrapper_info.wrapper;
            util.selector = "." + wrapper_info.name + "-" + util.selector.substring( 1 );
            util.wrapper_prefix = wrapper_info.name + "-"; // comes in w/o dash
        }

        CSSModeling.processRuleWithVariable(
                        data, util,
                        "utilities", var_icon, important
                    );
    }

    // don't need it for final file.
    delete data.variable_lookup;
    return data;
}

CSSModeling.processAtomString = function (
    str , name , value , var_icon , rule_base, wrapper_prefix
) {
    if ( !str )
        return "";

    if ( !wrapper_prefix )
        wrapper_prefix = "";

    var str_out = str.replace( /@base/g , name );
    if ( rule_base && str.indexOf("@var_name_no_base") != -1 ) {
        var rule_name_addition = name.replace( rule_base , "" );
        str_out = str_out.replace( /@var_name_no_base/g , rule_name_addition );
    }

    str_out = str_out.replace( /@var_name/g , name );
    str_out = str_out.replace( /@var_value/g , value );
    str_out = str_out.replace( /_@_/g , var_icon );

    var include_icon = "." + wrapper_prefix;
    var is_less = ( var_icon == "@" );
    if ( !is_less ) {// is SCSS
        include_icon = "@include " + wrapper_prefix;
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

CSSModeling.processGroupForArray = function ( groups , array_name ) {
    var output = [],group;
    for ( var group_name in groups ) {
        group = groups[group_name];
        if ( group[array_name] && group[array_name].length > 0 ) {
            output.push( "\n/*\n===================\n"
                        + group.title
                        + "\n===================\n*/\n");

            output = output.concat( group[array_name] );
        }
    }
    return output;
}

CSSModeling.processTypeForArray = function ( type_objs ) {
    var output = [],type_obj;
    var css_output = [],mixins_output = [];
    for ( var type_name in type_objs ) {
        type_obj = type_objs[type_name];

        css_output.push( type_obj.css_string );
        mixins_output.push( type_obj.mixins_string );
    }
    return {css:css_output,mixins:mixins_output};
}

CSSModeling.checkForGroup = function ( group_name ) {

    var groups = CSSModeling.data.groups;

    if ( !group_name ) {
        console.warn( "No group name sent.");
    }

    if ( !groups[ group_name ] ) {
        console.warn( "No group found for: " + group_name );
    }

    /*
    if ( !group_name ) {
        group_name = "global";
    }

    if ( !groups[ group_name ] ) {
        groups[ group_name ] = {
            variables:[],atoms:[],
            title:group_name
        };
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

    return groups[ group_name ];*/
}


CSSModeling.schemeToArray = function ( scheme , base , prefix , depth ) {
    if ( scheme.scheme ) {
        return CSSModeling._schemeToArray( scheme.scheme , base , prefix , depth );
    }else{
        console.log( "ERROR: misformatted scheme " , scheme );
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
            if ( scheme.indexOf( "scheme:" ) == 0 ) {
                var sub_scheme_id = scheme.split(":")[1];
                var sub_scheme = CSSModeling.data.schemes[ sub_scheme_id ];
                if ( sub_scheme ) {
                    var prefix_replaced = prefix.replace( /@base/g , base );
                    arr_out = arr_out.concat(
                            CSSModeling._schemeToArray(
                                sub_scheme.scheme , prefix_replaced ,
                                "" , depth++
                            )
                        );
                    return arr_out;
                }else{
                    console.warn( "no sub scheme found: " + sub_scheme_id );
                }
            }else{
                var value = prefix + scheme;
                value = value.replace( /@base/g , base );
                if ( depth == 0 ) {
                    return [value];
                }else{
                    return value;
                }
            }

        }else if ( Object.prototype.toString.call( scheme ) === '[object Array]' ) {
            for ( var a=0; a<scheme.length; a++ ) {
                arr_out = arr_out.concat(
                        CSSModeling._schemeToArray(
                            scheme[a] , base ,
                            prefix , depth++
                        )
                    );
            }
            return arr_out;
        }else{
            for ( var name in scheme ) {
                arr_out = arr_out.concat(
                        CSSModeling._schemeToArray(
                            scheme[name] , base ,
                            prefix + name , depth++
                        )
                    );
            }
            return arr_out;
        }
    }


CSSModeling.processRuleWithVariable = function (
    data, rule,
    type, var_icon, important
) {
    var is_less = var_icon == "@";
    var selectors = [];
    var variable;

    // just look for warnings...
    CSSModeling.checkForGroup( rule.group );

    rule_description  = "";//"\n";
    if ( rule.description ) {
        rule_description  = "\n/*  " + rule.description + "*/\n";
    }

    // some exceptions...
    if ( rule.scheme && data.schemes[rule.scheme] ) {

        variable = {names:[],values:[]};
        scheme = data.schemes[ rule.scheme ];
        variable.names = CSSModeling.schemeToArray(
                            scheme , rule.base
                        );

    }else if ( rule.variable && data.variable_lookup[rule.variable] ) {

        variable = data.variable_lookup[rule.variable];

    }

    // catch if there isn't a variable
    if ( !variable ) {
        variable = {names:[""],values:[""],base:""};
    }


    if ( variable ) {
        var all_rule_css_strs = [],rule_css_str;
        var all_rule_mixins_strs = [],rule_mixins_str;

        var rotation_total = variable.names.length / variable.values.length;

        if ( rotation_total % 1 != 0 ) {
            console.warn(
                "Var vals not multiples of names: "
                + variable.name + " (" + rule.name + ") names: " +
                variable.names.length + " values: " +
                variable.values.length
            );
        }
        rotation_total = Math.floor( rotation_total );


        for ( var i=0; i<variable.names.length; i++ ) {

            variable_name = variable.names[i];
            // repeat if there is not enough values....
            // TODO: throw warning if isn't evenly divisible
            if ( rotation_total > 1 ) {
                variable_value = variable.values[ i % rotation_total ];
            }else{
                variable_value = variable.values[i];
            }

            rule_selector = CSSModeling.processAtomString(
                            rule.selector,
                            variable_name, variable_value,
                            var_icon, variable.base
                        );

            selectors.push( rule_selector );

            rule_declaration = "";

            if ( rule.declaration_lines ) {

                var dline;
                for ( var d=0; d<rule.declaration_lines.length; d++ ) {
                    dline = rule.declaration_lines[d];
                    dline = CSSModeling.processAtomString(
                                    dline,
                                    variable_name, variable_value,
                                    var_icon, variable.base
                                );
                    rule_declaration += " " + dline + " ";
                }

            }else if ( rule.declaration_values ) {

                rule_declaration += " " + CSSModeling.processAtomString(
                                rule.declaration_values[i],
                                variable_name, variable_value,
                                var_icon, variable.base
                            );

            }else if ( rule.declaration_iteration_values ) {

                var iteration_index = Math.floor(
                            variable.names.length
                            / rule.declaration_iteration_values.length
                        );

                rule_declaration += " " + CSSModeling.processAtomString(
                                rule.declaration_iteration_values[ Math.floor( i / iteration_index ) ],
                                variable_name, variable_value,
                                var_icon, variable.base
                            );

            }else{// declaration_value

                rule_declaration += " " + CSSModeling.processAtomString(
                                rule.declaration_value,
                                variable_name, variable_value,
                                var_icon, variable.base
                            );

            }


            if ( important ) {
                rule_declaration = rule_declaration.replace(/;/g , " !important;" );
            }

            var rule_css_declaration = rule_declaration;
            var rule_mixin_declaration = rule_declaration;

            //if ( !is_less ) {
            //    rule_mixin_declaration = rule_declaration.replace(/;/g , " $important;" );
            //}

            if ( rule.declaration_includes ) {

                var dline,css_dline,mixin_dline;
                for ( var d=0; d<rule.declaration_includes.length; d++ ) {
                    dline = rule.declaration_includes[d];
                    dline = CSSModeling.processAtomString(
                                    dline,
                                    variable_name, variable_value,
                                    var_icon, variable.base,
                                    rule.wrapper_prefix
                                );

                    // CSS
                    /*if ( !is_less ) {
                        if ( important ) {
                            css_dline = dline.replace(/_endinc_/g , " ( !important )" );
                        }else{
                            css_dline = dline.replace(/_endinc_/g , "" );
                        }
                    }else{
                        if ( important ) {
                            css_dline = dline.replace(/_endinc_/g , " !important" );
                        }else{
                            css_dline = dline.replace(/_endinc_/g , "" );
                        }
                    }*/
                    rule_css_declaration += " " + dline + " ";

                    // MIXINS
                    /*if ( !is_less ) {
                        if ( important ) {
                            mixin_dline = dline.replace(/_endinc_/g , " ( !important )" );
                        }else{
                            mixin_dline = dline.replace(/_endinc_/g , " ( $important )" );
                        }
                    }else{
                        if ( important ) {
                            mixin_dline = dline.replace(/_endinc_/g , " !important" );
                        }else{
                            mixin_dline = dline.replace(/_endinc_/g , "" );
                        }
                    }*/
                    rule_mixin_declaration += " " + dline + " ";
                }
            }

            // if it is a state context (@media for example)
            if ( rule.wrapper ) {

                // CSS str
                rule_css_str = rule_selector + " { ";
                rule_css_str += CSSModeling.processAtomString(
                                rule.wrapper[0],
                                variable_name, variable_value,
                                var_icon, variable.base
                            ) + " ";

                rule_css_str += rule_css_declaration

                rule_css_str += CSSModeling.processAtomString(
                                rule.wrapper[1],
                                variable_name, variable_value,
                                var_icon, variable.base
                            );// + "\n";
                rule_css_str +=  " } ";

                // Mixin str
                if ( is_less ) {
                    var var_val = "";// "$val:null";
                    if ( variable_value ) {
                        var_val = "@" + variable_name + " : " + variable_value.replace( /_@_/g , "@" );
                    }
                    rule_mixins_str = rule_selector + " ( "+var_val+" ) {";
                }else{
                    var var_val = "";// "$val:null";
                    if ( variable_value ) {
                        var_val = "$" + variable_name + " : " + variable_value.replace( /_@_/g , "$" );
                    }
                    rule_mixins_str = "@mixin "
                        + rule_selector.replace(/\./g , "" )
                        + " ( " + var_val + " ) {";
                }

                rule_mixins_str += CSSModeling.renderCTags( rule , "atom" );
                rule_mixins_str += " " + CSSModeling.processAtomString(
                                rule.wrapper[0],
                                variable_name, variable_value,
                                var_icon, variable.base
                            ) + " ";

                rule_mixins_str += rule_mixin_declaration;

                rule_mixins_str += CSSModeling.processAtomString(
                                rule.wrapper[1],
                                variable_name, variable_value,
                                var_icon, variable.base
                            );
                rule_mixins_str += "}";

            }else{

                // CSS str
                rule_css_str = rule_selector + " { ";
                rule_css_str += CSSModeling.renderCTags( rule , "atom" );
                rule_css_str += rule_css_declaration;
                rule_css_str += " }";

                // Mixin str
                rule_mixins_str = "";

                if ( is_less ) {
                    rule_mixins_str += rule_selector + " () { ";
                }else{

                    var var_val = "$val:null";
                    if ( variable_value ) {
                        var_val = "$" + variable_name + " : " + variable_value.replace( /_@_/g , "$" );
                    }
                    rule_mixins_str += "@mixin "
                        + rule_selector.replace(/\./g , "" )
                        + " ( " + var_val + "  ) {\n";
                }

                rule_mixins_str += CSSModeling.renderCTags( rule , "atom" );
                rule_mixins_str += rule_mixin_declaration;
                rule_mixins_str += " }";

            }

            all_rule_css_strs.push( rule_css_str );
            all_rule_mixins_strs.push( rule_mixins_str );
        }

        rule.css_string = all_rule_css_strs.join("\n");
        rule.css_array = all_rule_css_strs;

        rule.mixins_string = all_rule_mixins_strs.join("\n");
        rule.mixins_array = all_rule_mixins_strs;

        rule.selectors = selectors;
    }
}




var module = module || {};
module.exports = CSSModeling;
