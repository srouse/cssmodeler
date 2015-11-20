
// TODO
// - depth...
// - (v2) figure out (only) element type selector clusters
// - (v2) add media...they are being ignored now.

// ISSUES
// - body.state is creating a bunch of root comps
// - combo selectors are perceived as unique ( .dog.brown )
//      "pure" parent lookup could solve this (filter out last parts...":" too)
// - unique feel too restrictive? ...probably not, it will avoid muddy selection

var install_base;

function processRules ( css_dom ) {
    // time to make sure things are not time bloating
    var start = new Date().getTime();

    var rules = css_dom.stylesheet.rules;

    if ( !install_base )
        install_base = "../";

    // initialize needed data...
    var returnObj = {
        install_base:install_base,

        totals:{
            overall:0,
            rules:0,
            rules_extended:0,
            rules_extendee:0,
            name_duplicates:0,
            tagged_rules:0,
            tagged_completed:0,

            extendable:0,
            depths:[],
            depths_rules:[],
            depths_tagged:[],
            selectorStringLengthTotal:0,
            time_to_process:0,

            example_errors:0,

            errors:0
        },
        scores:{
            total_tagged_rules:0,
            tagged_completed:0,
            tagged_connected:0,
            unique_names:0,
            overall:0
        },

        selectors:[],
        names:[],
        rules:[],
        tagged_rules:[],
        incomplete_tagged_rules:[],
        example_error_names:[],
        states:[],
        pseudos:[],
        depths_all:[],

        extended_rules_hash:{},
        extended_rules:[],
        extendee_rules_hash:{},
        extendee_rules:[],

        css_dom:[],

        duplicates:[],

        // lookups
        selector_hash:{},
        name_hash:{},
        uuid_hash:{},
        tags_hash:{},
        tags:[],
        base_tags_hash:{},
        base_tags:[],
        design_tags_hash:{},
        design_tags:[],

        //global rules...
        global_rules:[],
        url_prefix:"",//pulled from the global rules...last one wins
        ignore:[],
        fonts:[]
    }

    // internal hashes
    var comp_hash = {};
    var rule_hash = {};

    // need 1:1 relationship selector to rule
    var selectors = flattenSelectors( rules , returnObj );

    // spliting out into rules, states, pseudo
    var rules_states = flattenStates( selectors , returnObj );
    returnObj.states_hash = rules_states.states_hash;
    returnObj.pseudos_hash = rules_states.pseudos_hash;

    // <RULES>
    var selector_rule;
    var selectors = rules_states.selectors;
    for ( var r=0; r<selectors.length; r++ ) {
        selector_rule = selectors[r];
        processSelectorRule( selector_rule , returnObj );
        processRule( selector_rule , returnObj );
    }
    // </RULES>

    var states = rules_states.states;
    var state;
    for ( var r=0; r<states.length; r++ ) {
        state = states[r];
        processState( state , returnObj );
    }

    var pseudos = rules_states.pseudos;
    var pseudo;
    for ( var r=0; r<pseudos.length; r++ ) {
        pseudo = pseudos[r];
        processPseudo( pseudo , returnObj );
    }

    // <CONTEXTUALIZE>
    var selector_rule;
    for ( var r=0; r<returnObj.selectors.length; r++ ) {
        selector_rule = returnObj.selectors[r];
        contextualizeRule( selector_rule , returnObj );
    }
    // </CONTEXTUALIZE>

    // <NAMES>
    var rules_name = processRuleNames ( returnObj.selectors );
    returnObj.names = rules_name.rules_by_name;
    returnObj.name_hash = rules_name.rule_name_hash;
    // </NAMES>

    /*
    // <BASED ON PARENTS>
    var tagged_rule,based_on_name,based_on_rule;
    for ( var r=0; r<returnObj.tagged_rules.length; r++ ) {
        findBasedOnRelationship( returnObj.tagged_rules[r] , returnObj );
    }
    // </BASED ON PARENTS>
    */

    // <DIRECT_CHILDS>
    this.processRuleDirectChild( returnObj.selectors );
    // </DIRECT_CHILDS>

    // <DUPS>
    var name_rule;
    for ( var r=0; r<returnObj.names.length; r++ ) {
        name_rule = returnObj.names[r];
        checkNameRuleForDuplication( name_rule , returnObj );
    }
    // </DUPS>

    // <ERRORS>
    var tagged_rule;
    for ( var r=0; r<returnObj.tagged_rules.length; r++ ) {
        tagged_rule = returnObj.tagged_rules[r];

        // now do replacements....
        tagged_rule.metadata.example_info
            = __replaceComps( tagged_rule.metadata.example , returnObj );

        // tally errors
        if ( tagged_rule.metadata.example_info.errors.length > 0 ) {
            tagged_rule.has_error = true;
            returnObj.totals.example_errors++;
            returnObj.example_error_names.push( tagged_rule.name );

            if ( !tagged_rule.is_duplicate )
                returnObj.totals.errors++;
        }
    }
    // </ERRORS>

    // <VARIABLES>
    returnObj.variables = [];
    // </VARIABLES>

    scoreDOM( returnObj );

    returnObj.totals.selectorStringLengthTotal =
        returnObj.totals.selectorStringLengthTotal/returnObj.totals.overall;

    returnObj.tags.sort();

    console.log( returnObj );

    var end = new Date().getTime();
    var time = end - start;
    returnObj.totals.time_to_process = time;
    return returnObj;
}

    function isDirectChild ( rule , selector ) {
        child_arr = selector.split(">");
        if ( child_arr.length > 1 ) {
            child_space_arr =   child_arr[
                                    child_arr.length-1
                                ].split(" ");
            if ( child_space_arr.length == 2 ) {
                return true;
            }
        }
        return false;
    }

    function shouldBeIgnored ( selector , ignore_filters ) {
        var ignore_filter;
        for ( var i=0; i<ignore_filters.length; i++ ) {
            ignore_filter = ignore_filters[i];
            if ( selector.indexOf( ignore_filter ) !== -1 ) {
                return true;
            }
        }
        return false;
    }

    /*
    function findBasedOnRelationship ( tagged_rule , returnObj ) {
        if ( tagged_rule.metadata.extends ) {
            for ( var b=0; b<tagged_rule.metadata.extends.length; b++ ) {
                based_on_selector = tagged_rule.metadata.extends[b];
                based_on_rule = returnObj.selector_hash[ based_on_selector ];
                if ( based_on_rule ) {
                    based_on_rule.is_extended = true;
                    if ( !returnObj.extended_rules_hash[based_on_rule.name] ) {
                        returnObj.extended_rules_hash[based_on_rule.name]
                            = based_on_rule;
                        returnObj.extended_rules.push( based_on_rule );
                        returnObj.totals.rules_extended++;
                    }
                    if ( !returnObj.extendee_rules_hash[tagged_rule.name] ) {
                        returnObj.extendee_rules_hash[tagged_rule.name]
                            = based_on_rule;
                        returnObj.extendee_rules.push( tagged_rule );
                        returnObj.totals.rules_extendee++;
                    }
                }
            }
        }
    }
    */

    function flattenSelectors ( rules , returnObj ) {
        var selector;
        var new_rules = [];
        var child_arr,child_space_arr,raw_selector;

        var rule,cloned_rule,selector_arr;
        for ( var r=0; r<rules.length; r++ ) {
            rule = rules[r];

            if ( rule.type == "rule" ) {
                if ( rule.selectors.length > 1 ) {
                    for ( var s=0; s<rule.selectors.length; s++ ) {
                        raw_selector = rule.selectors[s];
                        selector = raw_selector.replace( /> /g , "" );

                        // make sure it's unique...
                        cloned_rule = JSON.parse(JSON.stringify(rule));
                        cloned_rule.selector = selector;
                        cloned_rule.raw_selector = raw_selector;

                        new_rules.push( cloned_rule );
                    }
                }else{
                    raw_selector = rule.selectors[0];
                    selector = raw_selector.replace( /> /g , "" );

                    rule.selector = selector;
                    rule.raw_selector = raw_selector;
                    new_rules.push( rule );
                }
            }else if ( rule.type == "comment" ) {
                var comment = rule.comment.trim();

                if ( comment.indexOf( "-ctag-metadata:") == 0 ) {
                    comment = comment.slice( 15 );
                    returnObj.definitions = JSON.parse( comment );
                }
            }
        }

        // flip them back to rules and process again...
        rules = new_rules;

        // they are split out, now consolidate repeats
        var rule_hash = {};
        var new_rules = [];
        for ( var r=0; r<rules.length; r++ ) {
            rule = rules[r];
            if ( !rule_hash[rule.selector] ) {
                rule_hash[rule.selector] = rule;
                new_rules.push( rule );
                var cloned_rule = JSON.parse(JSON.stringify(rule));
                rule.source = [cloned_rule];
            }else{
                hashed_rule = rule_hash[ rule.selector ];
                hashed_rule.source.push( rule );
            }
        }

        return new_rules;
    }

    function processRuleNames ( rules ) {
        var rule_name_hash = {};
        var rules_by_name = [];
        for ( var r=0; r<rules.length; r++ ) {
            rule = rules[r];
            rule.name = getSelectorName( rule.selector );
            rule.uuid = getRuleUUID( rule );

            if ( !rule_name_hash[rule.name] ) {
                rule_name_hash[rule.name] = rule;
                rules_by_name.push( rule );
            }else{
                var hashed_rule = rule_name_hash[ rule.name ];
                hashed_rule.source.push( rule );
            }
        }

        return {
            rules_by_name:rules_by_name,
            rule_name_hash:rule_name_hash
        };
    }

    function processSelectorRule ( selector_rule , returnObj ) {
        selector_rule.name = getSelectorName( selector_rule.selector );

        // first look to see if there is a root rule
        // a root rule will have this rule's selector first...
        var source_rule;
        var has_root_selector = false;
        for ( var d=0; d<selector_rule.source.length; d++ ) {
            source_rule = selector_rule.source[d];
            if ( source_rule.selectors[0] == selector_rule.selector ) {
                has_root_selector = true;
                break;
            }
        }


        // see if it is tagged...
        var tagged_comment = getTaggedCommentInfo ( selector_rule );
        if ( tagged_comment ) {
            selector_rule.type = "tagged_rule";
        }


        // give all the source the same name...
        var source_rule;
        for ( var d=0; d<selector_rule.source.length; d++ ) {
            source_rule = selector_rule.source[d];
            source_rule.name = selector_rule.name;
        }
    }

    function processRuleDirectChild ( rules ) {
        for ( var r=0; r<rules.length; r++ ) {
            rule = rules[r];
            rule.direct_child_selector
                = isDirectChild( rule , rule.raw_selector );
        }
    }

    function checkNameRuleForDuplication ( name_rule , returnObj ) {
        // original selectors are not processed....
        // this may bite me later...
        var core_selector = name_rule.raw_selector;

        for ( var d=0; d<name_rule.source.length; d++ ) {
            source_rule = name_rule.source[d];

            if (
                core_selector != source_rule.selector &&
                !source_rule.direct_child_selector
            ) {
                var first_selector = source_rule.selectors[0];

                // need one entry that is the same...
                if ( source_rule.selectors.indexOf( core_selector ) == -1 ) {
                    name_rule.is_duplicate = true;
                    name_rule.has_error = true;

                    returnObj.totals.name_duplicates++;
                    returnObj.duplicates.push( name_rule.name );
                    returnObj.totals.errors++;
                    break;
                }
            }
        }

        for ( var d=0; d<name_rule.source.length; d++ ) {
            source_rule = name_rule.source[d];
            source_rule.is_duplicate = name_rule.is_duplicate;
        }

    }

    function bemContextualization ( rule , returnObj ) {

    }

    function contextualizeRule ( rule , returnObj ) {
        // look up if it is a child of another comp
        var selector_lookup = rule.selector.split(" ");
        if ( selector_lookup.length == 1 ) {
            var BEM_selector = rule.selector.replace( /__/g , "||BEM||" );
            BEM_selector = BEM_selector.replace( /--/g , "||BEM||" );

            selector_lookup = BEM_selector.split("||BEM||");// BEM children
        }

        //take out first child selectors
        var new_selector_lookup = [];
        var sel_str;
        for ( var i=0; i<selector_lookup.length; i++ ) {
            sel_str = selector_lookup[i];
            if (
                sel_str != ">" //&&
                //sel_str != "~" &&
                //sel_str != "+"
            ) {
                new_selector_lookup.push( sel_str );
            }
        }
        selector_lookup = new_selector_lookup;

        var selector_lookup_str;
        var parent_rule;
        var index = 0;
        var has_parent = false;

        while ( selector_lookup.length > 0 ) {
            selector_lookup.pop();
            selector_lookup_str = selector_lookup.join(" ");

            if ( selector_lookup_str ) {
                parent_rule = returnObj.selector_hash[selector_lookup_str];
                if ( !parent_rule ) {
                    createNewRule ( selector_lookup_str , returnObj );
                }
                parent_rule = returnObj.selector_hash[selector_lookup_str];
                if ( index == 0 ) {// only add to parent...
                    parent_rule.children.push( rule );
                    if ( rule.type == "rule" ) {
                        parent_rule.total_child_rules++;
                    }else if ( rule.type == "tagged_rule" ) {
                        parent_rule.total_child_comps++;
                    }
                    rule.parent_rule_uuid = parent_rule.uuid;
                    has_parent = true;
                }
            }
            index++;
        }

        // now if it is a root (single selector), add it to root of DOM
        if ( !has_parent ) {//rule.selector.indexOf(" ") == -1 ) {
            returnObj.css_dom.push( rule );
        }
    }
