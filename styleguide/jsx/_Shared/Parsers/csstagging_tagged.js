


function processComponent ( tagged_rule , returnObj ) {

    tagged_rule.metadata = {
        global:false,
        complete:false
    };

    var metadata_info = getTaggedCommentInfo( tagged_rule );
    $.extend( tagged_rule.metadata , metadata_info );

    if ( tagged_rule.metadata.tags ) {
        var tag;
        var is_base = false;
        for ( var t=0; t<tagged_rule.metadata.tags.length; t++ ) {
            tag = tagged_rule.metadata.tags[t];
            if ( !returnObj.tags_hash[tag] ) {
                returnObj.tags_hash[tag] = [];
                returnObj.tags.push( tag );
            }
            returnObj.tags_hash[tag].push( tagged_rule );

            if ( tag == "base" ) {
                is_base = true;
            }
        }

        // now sort into base and design level tags...
        for ( var t=0; t<tagged_rule.metadata.tags.length; t++ ) {
            tag = tagged_rule.metadata.tags[t];

            if ( is_base ) {
                // don't hide elements that accidentally don't have second tag
                //if ( tag != "base" ) {
                    if ( !returnObj.base_tags_hash[tag] ) {
                        returnObj.base_tags_hash[tag] = [];
                        returnObj.base_tags.push( tag );
                    }
                    returnObj.base_tags_hash[tag].push( tagged_rule.uuid );
                //}
            }else{
                if ( !returnObj.design_tags_hash[tag] ) {
                    returnObj.design_tags_hash[tag] = [];
                    returnObj.design_tags.push( tag );
                }
                returnObj.design_tags_hash[tag].push( tagged_rule.uuid );
            }
        }
    }

    __processExample( tagged_rule );

    if (
        tagged_rule.metadata.tags &&
        tagged_rule.metadata.example
    ) {
        returnObj.totals.tagged_completed++;
        tagged_rule.metadata.complete = true;
    }else{
        returnObj.incomplete_tagged_rules.push( tagged_rule.uuid );
    }

    returnObj.totals.tagged_rules++;
    returnObj.tagged_rules.push( tagged_rule );
    if ( !returnObj.totals.depths_tagged[ tagged_rule.depth ] )
        returnObj.totals.depths_tagged[ tagged_rule.depth ] = 0;
    returnObj.totals.depths_tagged[ tagged_rule.depth ]++;
}

function __processExample ( tagged_rule ) {
    var template = tagged_rule.metadata.example;

    if ( template && template != "" ) {
        var clean_name = tagged_rule.name.replace(/\./,"");

        if ( template.indexOf("'") == 0 ) {
            template = template.slice(1);
        }
        if ( template.lastIndexOf("'") == template.length-1 ) {
            template = template.slice(0,-1);
        }

        // complete_tally++;
        if ( template.trim().indexOf("...") == 0 ) {
            var html_content = template.slice(3);
            template = "<div class='"+clean_name+"'>"
                                    + html_content +
                                "</div>";
        }else{
            template =  template.replace(
                    "...","class='" + clean_name + "'"
                );
        }

        var html_rebuilt = [];
        var tag_arr = template.split("{");
        var tag_section;
        for ( var t=0; t<tag_arr.length; t++ ) {
            tag_section = tag_arr[t];
            tag_section_arr = tag_section.split("}");
            if ( tag_section_arr.length == 1 ) {
                html_rebuilt.push( tag_section );
            }else{
                html_rebuilt.push(
                    "<div comp='"
                    + $.trim( tag_section_arr[0] )
                    +"'></div>"
                    + $.trim( tag_section_arr[1] )
                );
            }
        }
        tagged_rule.metadata.example = html_rebuilt.join("");

    }
    return false;
}


function __replaceComps (
    html_str , css_info, rule_names, errors, times_called
) {
    if ( !rule_names )
        rule_names = [];

    if ( !errors )
        errors = [];

    if ( !times_called )
        times_called = 1;

    if ( times_called > 100 ) {
        return {
            html:"<div>Error, too many cycles</div>",
            rule_names:rule_names
        };
    }

    if ( html_str ) {
        html_str = $.trim( html_str );
    }

    var example_html = $("<div>" +  html_str  + "</div>");
    var sub_rules = example_html.find("div[comp]");
    var sub_rule_html,sub_rule,sub_rule_name;
    var sub_rule_results;

    if ( sub_rules.length > 0 ) {
        var sub_rule_name_arr = [];
        for ( var sr=0; sr<sub_rules.length; sr++ ) {
            sub_rule_html = sub_rules[sr];
            sub_rule_name = $(sub_rule_html).attr("comp");

            // TODO Look for names..if not found, then look for selectors
            if ( css_info.name_hash[sub_rule_name] ) {
                sub_rule = css_info.name_hash[sub_rule_name];

                if (    sub_rule.metadata
                        && sub_rule.metadata.example )
                {
                    sub_rule_name_arr.push( sub_rule_name );

                    $(sub_rule_html).replaceWith(
                        $( sub_rule.metadata.example )
                    );
                    break;
                }else{
                    if ( css_info.selector_hash[sub_rule_name] ) {
                        sub_rule = css_info.selector_hash[sub_rule_name];

                        if (    sub_rule.metadata
                                && sub_rule.metadata.example )
                        {
                            sub_rule_name_arr.push( sub_rule_name );
                            $(sub_rule_html).replaceWith(
                                $( sub_rule.metadata.example )
                            );
                            break;
                        }else{
                            $( sub_rule_html ).replaceWith(
                                "<div>error '"
                                + sub_rule_name
                                + "' [3] not found</div>"
                            );

                            errors.push( sub_rule_name );
                        }
                    }else{
                        $( sub_rule_html ).replaceWith(
                            "<div>error '"
                            + sub_rule_name
                            + "' [1] not found</div>"
                        );

                        errors.push( sub_rule_name );
                    }
                }
            }else{
                if ( css_info.selector_hash[sub_rule_name] ) {
                    sub_rule = css_info.selector_hash[sub_rule_name];
                    if (    sub_rule.metadata
                            && sub_rule.metadata.example )
                    {
                        sub_rule_name_arr.push( sub_rule_name );

                        $(sub_rule_html).replaceWith(
                            $( sub_rule.metadata.example )
                        );
                        break;
                    }else{
                        $( sub_rule_html ).replaceWith(
                            "<div>error '"
                            + sub_rule_name
                            + "' [4] not found</div>"
                        );

                        errors.push( sub_rule_name );
                    }
                }else{
                    $(sub_rule_html).replaceWith(
                        "<div>error template '"
                        + sub_rule_name
                        + "' [2] not found</div>"
                    );

                    errors.push( sub_rule_name );
                }
            }
        }

        return  __replaceComps(
                    example_html.html(),
                    css_info,
                    rule_names.concat( sub_rule_name_arr ),
                    errors,
                    times_called + 1
                );
    }else{
        return {
            html:html_str,
            rule_names:rule_names,
            errors:errors
        };
    }
};
