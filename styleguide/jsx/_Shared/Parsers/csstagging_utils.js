


function findTopMostParent ( uuid , css_info ) {
    var rule = css_info.uuid_hash[ uuid ];
    var parent = rule;
    var count = 0;

    while ( parent.parent_rule_uuid ) {
        parent = css_info.uuid_hash[ parent.parent_rule_uuid ];
    }
    return parent;
}

function _getCleanedSelector ( selector ) {
    var selector_arr = selector.split(" ");
    var selector_ele,selector_ele_arr,first_letter;
    var first_colon,first_dot,selector_base;
    var base_end,new_selector=[];
    for ( var i=0; i<selector_arr.length; i++ ) {
        selector_ele = selector_arr[i];
        //selector_ele_arr = selector_ele.split(".");
        //body.dog .dog.cat .dot.cat.mouse div.dog #dog.cat .dog:hover
        first_letter = selector_ele.slice(0,1);
        first_colon = selector_ele.indexOf( ":" );
        if ( first_colon == -1 )
            first_colon = selector_ele.length;
        first_dot = selector_ele.indexOf( "." , 1 );
        if ( first_dot == -1 )
            first_dot = selector_ele.length;

        base_end = Math.min( first_colon , first_dot );
        selector_base = selector_ele.slice( 0 , base_end );
        new_selector.push( selector_base );
    }
    return new_selector.join(" ");
}

function getSelectorName ( selector ) {
    var selector_arr = selector.split(" ");
    var selector_name = selector_arr.pop();
    return selector_name;
}

function getRuleUUID ( rule ) {
    if ( !rule || !rule.selector ) {
        console.log("ERROR: getRuleUUID");
        return "-1";
    }
    return ( rule.selector.hashCode() + "" ).replace("-","n");
}

    function __cleanUpCTagArg ( value ) {
        if ( value ) {
            return value.replace( /\[escaped_quote\]/g , "\"");
        }else{
            return "";
        }
    }

function getCommentInfo ( rule ) {
    var ctag_count = 0;
    var ctag_info = {};
    var prop;

    var declarations = [];//rule.declarations;//[];

    if ( rule.source ) {
        var source;
        var first_selector;
        for ( var s=0; s<rule.source.length; s++ ) {
            source = rule.source[s];
            first_selector = source.selectors[0];
            // want to determine the rule's status via their own
            // declarations versus extensions.
            if ( rule.selector == first_selector ) {
                declarations = source.declarations;
                break;
            }
        }
    }else{
        declarations = rule.declarations;
    }

    /*if ( rule.selector == ".EXP-advisor" ) {
        console.log( declarations );
        console.log( rule );
        console.log( "HERE" );
    }*/

    for ( var i=0; i<declarations.length; i++ ) {
        declaration = declarations[i];

        if ( declaration.type == "comment" ) {
            var trimmed_comment = $.trim( declaration.comment );

            if (
                trimmed_comment.indexOf("-ctag-example ") == 0 ||
                trimmed_comment.indexOf("-ctag-example:") == 0
            ) {
                var prop_arr = trimmed_comment.split(":");
                if ( prop_arr.length > 1 ) {
                    prop_arr.shift();
                    var prop_str = prop_arr.join(":").trim().replace( /;/g , "" );
                    ctag_info = {example:prop_str,example_raw:trimmed_comment};
                    break;
                }
            }

            // add others here...
        }
    }

    return ctag_info;
}
function getTaggedCommentInfo ( rule ) {
    var ctag_info = getCommentInfo( rule );

    if (
        ctag_info.example
    ) {
        return ctag_info;
    }else{
        return false;
    }
}
