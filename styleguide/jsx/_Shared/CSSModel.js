


var _CSSModel = function () {};

_CSSModel.prototype.process = function ( css_data ) {
    $.extend( this , css_data );

    // put everything into the groups...

    this.createLookups();

    this.pushIntoGroup( "variables" );
    this.pushIntoGroup( "atoms" );
    this.pushIntoGroup( "utilities" );

    console.log( this );
}

_CSSModel.prototype.processComps = function ( comps_data ) {
    this.component_data = processRules( comps_data );
}

_CSSModel.prototype.createLookups = function ( variables ) {
    var variable;
    this.variable_lookup = [];
    for ( var v=0; v<this.variables.length; v++ ) {
        variable = this.variables[v];
        this.variable_lookup[ variable.name ] = variable;
    }

    var atom;
    this.atom_lookup = [];
    for ( var a=0; a<this.atoms.length; a++ ) {
        atom = this.atoms[a];
        this.atom_lookup[ atom.name ] = atom;
    }

    var utility;
    this.utility_lookup = [];
    for ( var u=0; u<this.utilities.length; u++ ) {
        utility = this.utilities[u];
        this.utility_lookup[ utility.name ] = utility;
    }
}

_CSSModel.prototype.pushIntoGroup = function ( type ) {
    var obj_arr = this[type];
    var type_obj,group;

    //for ( var type_name in obj_arr ) {
        //type_obj = obj_arr[ type_name ];
    for ( var t=0; t<obj_arr.length; t++ ) {
        type_obj = obj_arr[t];
        var group = this.getGroup( type_obj.group );
        group[ type ][ type_obj.name ] = type_obj;
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
