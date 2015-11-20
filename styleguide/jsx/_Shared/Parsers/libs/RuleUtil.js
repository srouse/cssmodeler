

RuleUtil = function(){};

RuleUtil.findRuleRelativeToRule = function (
    target_rule_name, rule_source, css_info
) {
    var target_rule;

    var found_rule = false;
    // first children...(inheritance causes valid name dups)


    if ( css_info.name_hash[target_rule_name] ) {
        target_rule = css_info.name_hash[target_rule_name];
        if (    target_rule.metadata
                && target_rule.metadata.example )
        {
            found_rule = true;
        }
    }

    if ( css_info.selector_hash[target_rule_name] ) {
        target_rule = css_info.selector_hash[target_rule_name];
        if (    target_rule.metadata
                && target_rule.metadata.example )
        {
            found_rule = true;
        }
    }

    console.log( found_rule );
}


RuleUtil.replaceComps = function (
    rule, html_str , rule_names , css_info , times_called
) {

    if ( !times_called )
        times_called = 1;

    if ( times_called > 100 ) {
        return {
            html:"<div>Error, too many cycles</div>",
            rule_names:rule_names
        };
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

            RuleUtil.findRuleRelativeToRule(
                sub_rule_name, rule , css_info
            );


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
                        }
                    }else{
                        $( sub_rule_html ).replaceWith(
                            "<div>error '"
                            + sub_rule_name
                            + "' [1] not found</div>"
                        );
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
                    }
                }else{
                    $(sub_rule_html).replaceWith(
                        "<div>error template '"
                        + sub_rule_name
                        + "' [2] not found</div>"
                    );
                }
            }
        }

        return  RuleUtil.replaceComps(
                    rule,
                    example_html.html(),
                    rule_names.concat( sub_rule_name_arr ),
                    css_info,
                    times_called + 1
                );
    }else{
        return {
            html:html_str.trim(),
            rule_names:rule_names
        };
    }
};



RuleUtil.findRuleExample = function ( rule , css_info , html_only ) {
    var html = ["<div>no example</div>"];
    var css = [];

    if (
        rule.metadata
        && rule.metadata.example
    ) {
        if ( !html_only ) {
            var global_rules = css_info.global_rules;
            var global_rule;
            for ( var g=0; g<global_rules.length; g++ ) {
                global_rule = global_rules[g];
                css.push(
                    _ruleAndChildToCSSString(
                        global_rule , true
                    )
                );
            }

            css.push(
                _ruleAndPseudosToCSSString( rule , true  )
            );
        }

        // create container classes
        var selector_arr = rule.selector.split(" ");
        var selector_item;
        var html = [];
        for ( var s=0; s<selector_arr.length; s++ ) {
            selector_item = selector_arr[s];
            if ( selector_item != rule.name ) {
                if ( selector_item.indexOf(".") == 0 ) {
                    html.push(
                        "<div class='" +
                            selector_item.replace("."," ").trim()
                        + "'>"
                    );
                }
            }
        }

        var sub_comp_info = RuleUtil.replaceComps(
            rule , rule.metadata.example, [] , css_info
        );

        html.push( sub_comp_info.html );

        if ( !html_only) {
            // get the relavent sub component css in there...
            for ( var i=0; i<sub_comp_info.rule_names.length; i++ ) {
                var sub_comp_name = sub_comp_info.rule_names[i];
                var sub_comp_rule = css_info.name_hash[
                                        sub_comp_name
                                    ];
                if ( !sub_comp_rule ) {
                    sub_comp_rule = css_info.selector_hash[
                                            sub_comp_name
                                        ];
                }

                css.push(
                    _ruleAndPseudosToCSSString(
                        sub_comp_rule , true
                    )
                );
            };
        }

        for ( var s=0; s<selector_arr.length; s++ ) {
            selector_item = selector_arr[s];
            if ( selector_item != rule.name ) {
                if ( selector_item.indexOf(".") == 0 ) {
                    html.push( "</div>" );
                }
            }
        }

        if ( !html_only ) {
            //html.push( "<style>" + css.join("") + "</style>" );
        }
    }

    var html_str = html.join("");
    return {
        html:html_str,
        css:css,
        all:html_str + "<style>" + css.join("") + "</style>"
    }
    //return html.join("");
};
