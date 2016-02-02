


var CModProcessor = function () {
    this.config = {
        "groups":{},
        "schemes":{},
        "variables":[],
        "utilities":[],
        "atoms":[]
    }
};

CModProcessor.prototype = {
    process:function ( src ) {

        var src_obj = require( src );
        src_obj.run( this );

        return this.config;
    },

    clone: function (obj ) {
        return JSON.parse( JSON.stringify( obj ) );
    },

    createScheme:function ( scheme_obj ) {
        scheme_obj = this.clone( scheme_obj );

        if (
            !scheme_obj.name ||
            !scheme_obj.shortcut ||
            !scheme_obj.scheme
        ) {
            console.warn('Scheme is not complete:' );
            console.warn( scheme_obj );
        }else{
            this.config.schemes[scheme_obj.name] = scheme_obj;
        }

        var me = this;
        scheme_obj.createVariable = function ( variable_obj ) {
            return me.createVariable( variable_obj , this );
        }

        return scheme_obj;
    },

    createVariable:function ( variable_obj , scheme_obj ) {
        variable_obj = this.clone( variable_obj );

        if ( scheme_obj ) {
            variable_obj.scheme = scheme_obj.name;
        }

        if (
            !variable_obj.name ||
            !variable_obj.scheme ||
            !variable_obj.values
        ) {
            console.warn('Variable is not complete:' );
            console.warn( variable_obj );
        }else{
            this.config.variables.push( variable_obj );
        }

        var me = this;
        variable_obj.createAtom = function ( atom_obj ) {
            return me.createAtom( atom_obj , this );
        }
        variable_obj.createAtoms = function ( atom_objs ) {
            return me.createAtoms( atom_objs , this );
        }

        return variable_obj;
    },

    createAtoms:function ( atom_objs , variable_obj ) {
        var atom;
        for ( var a=0; a<atom_objs.length; a++ ) {
            this.createAtom( atom_objs[a] , variable_obj );
        }
    },

    createAtom:function ( atom_obj , variable_obj ) {
        atom_obj = this.clone( atom_obj );

        if ( variable_obj ) {
            atom_obj.variable = variable_obj.name;
        }

        if (
            !atom_obj.group ||
            !atom_obj.sub_group ||
            !atom_obj.example ||
            !atom_obj.selector //||
            //!atom_obj.declaration_value
        ) {
            console.warn('Atom is not complete:' );
            console.warn( atom_obj );
        }else{
            this.config.atoms.push( atom_obj );
        }

        var me = this;
        atom_obj.createAtom = function ( atom_obj ) {
            return me.createAtom( atom_obj , variable_obj );
        }
        atom_obj.cloneAtomWithValue = function ( declaration_value ) {
            var new_atom = me.clone( this );
            new_atom.declaration_value = declaration_value;
            return me.createAtom( new_atom , variable_obj );
        }

        return atom_obj;
    }
}

var module = module || {};
module.exports = CModProcessor;
