

function scoreDOM ( returnObj ) {

    //80% goal
    returnObj.scores.total_tagged_rules = Math.min(
        1,
        ( returnObj.totals.tagged_rules/returnObj.totals.overall ) / .8
    );

    // Comps completed = 90%
    returnObj.scores.tagged_completed = Math.min(
        1,
        ( returnObj.totals.tagged_completed/returnObj.totals.tagged_rules ) / .9
    );

    // Comps connected = 30%
    returnObj.scores.tagged_extended = Math.min(
        1,
        Math.abs(
            ( returnObj.totals.rules_extended/returnObj.totals.tagged_rules )
            % .3
        )
        / .3
    );

    // Unique Names = 100%;
    returnObj.scores.unique_names = Math.max(
        0,
        Math.min(
            1,
            1 - (
                    returnObj.totals.name_duplicates/
                    returnObj.totals.overall
                ) / .1
        )
    );

    returnObj.scores.overall = (
        returnObj.scores.total_tagged_rules +
        returnObj.scores.tagged_completed +
        returnObj.scores.tagged_extended +
        returnObj.scores.unique_names
    ) / 4;
}
