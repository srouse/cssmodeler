
function _ruleAndChildToCSSString ( rule , pretty ) {
    var css = [];
    var new_line = "\n";
    if ( !pretty ) {
        new_line = " ";
    }

    css.push(
        new_line,
        this._ruleAndPseudosToCSSString( rule , pretty ),
        new_line
    );

    var child;
    for ( var c=0; c<rule.children.length; c++ ) {
        child = rule.children[c];
        css.push(
            _ruleAndChildToCSSString( child , pretty ),
            new_line
        );
    }

    return css.join("");
}

function _ruleAndPseudosToCSSString ( rule , pretty ) {
    var new_line = "\n";
    if ( !pretty ) {
        new_line = " ";
    }

    var css_str = ruleToCSSString( rule , pretty );

    // pseudos now...(recursive)
    if ( rule.pseudos ) {
        $.each( rule.pseudos , function ( i , pseudo ) {
            css_str += new_line + ruleToCSSString( pseudo , pretty );
        });
    }

    // states now...(recursive)
    if ( rule.states ) {
        $.each( rule.states , function ( i , state ) {
            css_str += new_line + ruleToCSSString( state , pretty );
        });
    }

    return css_str;
}




function ruleToCSSString ( rule , pretty ) {
    var source;
    var css_str = [];

    if ( !rule || !rule.source || rule.source.length == 0 )
        return "";

    for ( var s=0; s<rule.source.length; s++ ) {
        source = rule.source[s];
        css_str.push( _ruleToCSSString( source , pretty ) );
    }

    var new_line = "\n";
    if ( !pretty ) {
        new_line = " ";
    }
    return css_str.join(new_line+new_line);
}

    function _ruleToCSSString ( rule , pretty ) {
        var tab = "\t";
        var new_line = "\n";
        if ( !pretty ) {
            tab = "";
            new_line = " ";
        }

        var all_selectors = rule.selectors.join( "," + new_line );

        // Writting all the selectors makes cascade issues...
        // "rule.selector" was commented out however, so there
        // may be a reason not to go with just selector...not sure.
        // var selector = all_selectors;//rule.selector;
        var selector = rule.selector;
        // cons ole.log( all_selectors );
        // cons ole.log( rule.selector );
        // cons ole.log( "=====" );

        if ( !selector ) {
            return "";
        }

        if ( pretty ) {
            //selector = selector.replace(/ /g, new_line );
        }

        var css = [];
        Array.prototype.push.apply(
            css,
            [selector , new_line , "{", new_line]
        );

        var dec_length = rule.declarations.length;
        var dec;
        for ( var i=0; i<dec_length; i++ ) {
            dec = rule.declarations[i];
            if ( dec.type == "declaration" ) {
                Array.prototype.push.apply(
                    css,
                    [
                        tab ,
                        dec.property, ": ", dec.value,";",
                        new_line
                    ]
                );
            }else if ( dec.type == "comment" && pretty ) {
                Array.prototype.push.apply(
                    css,
                    [
                        tab ,
                        "/*" + dec.comment + "*/",
                        new_line
                    ]
                );
            }
        }
        css.push( "}" );

        var css_str = css.join("");
        /*if ( img_prefix ) {
            css_str =   css_str.replace(
                            /url\(\"/g, "url(\"" + img_prefix
                        );
            css_str =   css_str.replace(
                            /url\(\'/g, "url(\'" + img_prefix
                        );
        }*/

        return css_str;
    }



function ruleLocalToCSSString ( rule ) {

    var css_str = [];
    if ( rule.metadata && rule.metadata.local ) {
        var local = rule.metadata.local;
        for ( var name in local ) {
            css_str.push( name + ": " + local[name] + ";" );
        }
    }

    if ( rule.metadata && rule.metadata.pointers ) {
        var pointers = rule.metadata.pointers;
        for ( var p=0; p<pointers.length; p++ ) {
            css_str.push( pointers[p] + "();" );
        }
    }
    console.log( rule );

    return css_str.join("\n");

}
