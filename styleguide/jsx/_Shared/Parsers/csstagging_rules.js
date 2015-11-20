

function createNewRule ( selector , returnObj ) {
    var new_rule = {
        declarations:[],
        selector:selector,
        raw_selector:selector,
        type:"rule",// it's not declared, so default to rule,
        selectors:[selector],
        source:[]
    };

    processRule( new_rule , returnObj );
    return new_rule;
}

// Rule is more of a base class, a Comp is a tagged rule...
// ...every rule/comp will go through this.
function processRule ( rule , returnObj ) {
    // some additional properties
    //var selector_arr = rule.selector.split( " " );
    rule.name = getSelectorName( rule.selector );//selector_arr.pop();
    // give a shorter unique id to it
    //var cssString = ruleToCSSString( rule );
    // "-" causes Router to get confused
    // only want something unique, so replacing with an "n"
    rule.uuid = getRuleUUID( rule );
    rule.children = [];
    rule.total_child_rules = 0;// just simple rules, not everything
    rule.total_child_comps = 0;
    rule.is_duplicate = false;

    // find depth
    rule.depth = Math.min( 6 , rule.selector.split(" ").length-1 );
    if ( !returnObj.totals.depths[ rule.depth ] )
        returnObj.totals.depths[ rule.depth ] = 0;
    returnObj.totals.depths[ rule.depth ]++;
    if ( !returnObj.depths_all[ rule.depth ] )
        returnObj.depths_all[ rule.depth ] = [];
    returnObj.depths_all[ rule.depth ].push( rule.uuid );

    rule.metadata = {};
    rule.states = [];
    rule.pseudos = [];

    if ( rule.type == "rule" ) {
        returnObj.totals.rules++;
        returnObj.rules.push( rule );
        if ( !returnObj.totals.depths_rules[ rule.depth ] )
            returnObj.totals.depths_rules[ rule.depth ] = 0;
        returnObj.totals.depths_rules[ rule.depth ]++;
    }else if ( rule.type == "tagged_rule" ){
        processComponent( rule , returnObj );
    }

    returnObj.totals.overall++;

    // selector hash
    if ( !returnObj.selector_hash[rule.selector] ) {
        returnObj.selector_hash[rule.selector] = rule;
    }else{
        console.log("ERROR, selector not unique!");
    }

    returnObj.uuid_hash[ rule.uuid ] = rule;

    //finish up...
    returnObj.selector_hash[rule.name] = rule;
    returnObj.selectors.push( rule );
}
