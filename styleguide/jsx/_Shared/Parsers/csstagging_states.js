

function flattenStates ( rules , returnObj ) {
    var selector;
    var new_rules = [];
    var states = [];
    var states_hash = {};
    var pseudos = [];
    var pseudos_hash = {};
    var rule,is_state;
    for ( var r=0; r<rules.length; r++ ) {
        rule = rules[r];
        is_state = _checkIfStateOrPseudo( rule );

        if ( is_state == "state" ) {
            states.push( rule );
            states_hash[ rule.selector ] = rule;
        }else if ( is_state == "pseudo" ) {
            pseudos.push( rule );
            pseudos_hash[ rule.selector ] = rule;
        }else{
            new_rules.push( rule );
        }
    }
    return {
        selectors:new_rules,
        states:states,
        states_hash:states_hash,
        pseudos:pseudos,
        pseudos_hash:pseudos_hash
    };
}

function _checkIfStateOrPseudo ( rule ) {
    // States are...anything with joined selectors:
    // .dog.cat
    // .dog.cat .figure
    // p.active li
    // #me.soiled .frog
    // .dog:hover
    // .dog:hover .cat
    // They get added to the rule that they are a variation of...
    // (both of them)
    var selector_arr = rule.selector.split(" ");
    var selector;
    var hash_count,colon_count,dot_count;
    var first_dot,first_hash;
    //for ( var i=0; i<selector_arr.length; i++ ){
    // need to go backwards to give precedence to pseudos
    // TODO: loop through entirely to look for pseudos first...


    for ( var i=selector_arr.length-1; i>=0; i-- ){
        selector = selector_arr[i];

        hash_count = selector.split("#").length - 1;
        colon_count = selector.split(":").length - 1;
        dot_count = selector.split(".").length - 1;

        first_dot = selector.indexOf(".");
        first_hash = selector.indexOf("#");

        if ( colon_count > 0 ) // .dot:hover
        {
            // con sole.log( "pseudo" );
            return "pseudo";
            break;
        }

        if ( dot_count > 1 ) { // .dot.cat
            // con sole.log( "state" );
            return "state";
            break;
        }
        if ( hash_count == 1 // #dog.cat
            && dot_count > 0
        ) {
            // con sole.log( "state" );
            return "state";
            break;
        }
        if ( first_dot > 0 ) { // p.dog
            // con sole.log( "state" );
            return "state";
            break;
        }
        if ( first_hash > 0 ) { // p#dog
            // con sole.log( "state" );
            return "state";
            break;
        }
    }
    // con sole.log( "rule" );
    return "rule";
}

function processState ( state , returnObj ) {
    state.type = "state";
    state.state_info = {};
    state.state_info = _getRuleAndStateInfo( state );
    returnObj.states.push( state );

    var metadata_info = getCommentInfo( state );
    state.metadata = metadata_info;

    // now add the state to the right rule...
    var rule_cumulative = [],rule_cumulative_str;
    var focused_state, rule;

    //states only apply to things that are affected...
    var selector = state.state_info.rule_processed_selector;
    var rule = returnObj.selector_hash[ selector ];
    if ( !rule ) {
        rule = createNewRule ( selector , returnObj );
    }
    rule.states.push( state );
}



function processPseudo ( pseudo , returnObj ) {
    pseudo.type = "pseudo";
    pseudo.pseudo_info = {};
    pseudo.pseudo_info = _getRuleAndStateInfo( pseudo );
    returnObj.pseudos.push( pseudo );

    var metadata_info = getCommentInfo( pseudo );
    pseudo.metadata = metadata_info;

    var selector = pseudo.pseudo_info.rule_processed_selector;
    var rule = returnObj.selector_hash[ selector ];
    if ( !rule ) {
        rule = createNewRule ( selector , returnObj );
    }
    rule.pseudos.push( pseudo );
}

    function _getRuleAndStateInfo ( state )
    {
        var sel_arr = state.selector.split(" ");
        var sel;
        var states_by_index = [];
        var rules_by_index = [];
        for ( var i=0; i<sel_arr.length; i++ ) {
            sel = sel_arr[i];
            sel = sel.replace(/\./g, "|." );
            sel = sel.replace(/:/g, "|:" );
            sel = sel.replace(/#/g, "|#" );
            sel_sub_arr = sel.split("|");

            if ( sel_sub_arr[0].length == 0 ) {
                sel_sub_arr.shift();
            }
            sel_arr.splice( i , 1 , sel_sub_arr[0] );
            rules_by_index.push( sel_sub_arr[0] );

            if ( sel_sub_arr.length > 1 ) {
                sel_sub_arr.shift();
                states_by_index[i] = sel_sub_arr.join("");
            }else{
                states_by_index[i] = "";
            }
        }

        var sel_clean_arr = sel_arr.slice(0);
        var rules_by_index_processed = rules_by_index.slice(0);
        if (
            sel_clean_arr[0] == "body" ||
            sel_clean_arr[0] == "html"
        ) {
            sel_clean_arr.shift();
            rules_by_index_processed.shift();

            if (
                sel_clean_arr[0] == "body"
            ) {
                sel_clean_arr.shift();
                rules_by_index_processed.shift();
            }
        }

        return {
            rule_processed_selector:sel_clean_arr.join(" "),
            rule_selector:sel_arr.join(" "),
            states_by_index:states_by_index,
            rules_by_index:rules_by_index,
            rules_processed_by_index:rules_by_index_processed
        }
    }

/*
    function _allPossibleRules ( selector ) {
        var sel_arr = selector.split(" ");
        var sel;
        for ( var i=0; i<sel_arr.length; i++ ) {
            sel = sel_arr[i];
            sel = sel.replace(/\./g, "|." );
            sel = sel.replace(/:/g, "|:" );
            sel = sel.replace(/#/g, "|#" );
            sel_sub_arr = sel.split("|");
            sel_arr.splice( i , 1 , sel_sub_arr );
        }

        // now traverse all all the possibles.
        var all_rules = [""];
        for ( var i=0; i<sel_arr.length; i++ ) {
            name_arr = sel_arr[i];
            all_rules = _arrayOfPossibleRules(name_arr , all_rules );
        }

        return all_rules;
    }
        function _arrayOfPossibleRules ( name_arr , all_rules ) {
            //var all_selectors = [];
            var name,all_rules,new_rules;
            var new_all_rules = [];
            for ( var i=0; i<name_arr.length; i++ ) {
                name = name_arr[i];
                if (
                    name.length > 0
                    && name.indexOf(":") != 0
                ) {
                    new_rules = all_rules.slice(0);
                    for ( var n=0; n<new_rules.length; n++ ) {
                        var new_rule_value = new_rules[n];
                        if ( new_rule_value.length > 0 ) {
                            new_rules[n] = new_rules[n] + " " + name;
                        }else{
                            new_rules[n] = name;
                        }
                    }
                    new_all_rules = new_all_rules.concat( new_rules );
                }
            }
            return new_all_rules;
        }
*/
