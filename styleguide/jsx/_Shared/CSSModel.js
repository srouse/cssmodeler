


var _CSSModel = function () {};

_CSSModel.prototype.process = function ( css_data ) {
    $.extend( this , css_data );

    // put everything into the groups...
    this.pushIntoGroup( "variables" );
    this.pushIntoGroup( "atoms" );
    this.pushIntoGroup( "utilities" );
}

_CSSModel.prototype.processComps = function ( comps_data ) {
    this.component_data = processRules( comps_data );
}

_CSSModel.prototype.pushIntoGroup = function ( type ) {
    var obj_arr = this[type];
    var type_obj,group;
    for ( var type_name in obj_arr ) {
        type_obj = obj_arr[ type_name ];
        var group = this.getGroup( type_obj.group );
        group[ type ][ type_name ] = type_obj;
    }
}

_CSSModel.prototype.getGroup = function ( group_name ) {

    var groups = this.groups;

    if ( !group_name ) {
        group_name = "global";
    }

    if ( !groups[ group_name ] ) {
        groups[ group_name ] = {title:group_name};
    }
    if ( !groups[ group_name ].variables ) {
        groups[ group_name ].variables = {};
    }
    if ( !groups[ group_name ].atoms ) {
        groups[ group_name ].atoms = {};
    }
    /*if ( !groups[ group_name ].bases ) {
        groups[ group_name ].bases = {};
    }*/
    if ( !groups[ group_name ].utilities ) {
        groups[ group_name ].utilities = {};
    }
    /*if ( !groups[ group_name ].components ) {
        groups[ group_name ].components = {};
    }*/

    return groups[ group_name ];
}


var CSSModel = new _CSSModel();
