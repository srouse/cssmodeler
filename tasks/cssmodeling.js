
'use strict';

var path = require("path");


var CSSModeling = require("../cssmodeling/CSSModeling");

module.exports = function (grunt) {

    grunt.registerMultiTask( 'cssmodeling', 'model CSS systems', function () {

        if ( this.files.length < 1 ) {
		    grunt.verbose.warn('Destination not written because no source files were provided.');
	    }

        var file,data_config,src,src_obj,dest,config_json;
        var src_prop,config_prop;
		for ( var f=0; f<this.files.length; f++ ) {
            file = this.files[f];

            //data_config = grunt.file.read( file.src[0] );
            dest = file.dest;

            src_obj = {
                groups:{},schemes:{},variables:{},
                atoms:{},bases:{},utilities:{},
                components:{},states:{}
            };

            // pull in configs
            for ( var s=0; s<file.src.length; s++ ) {
                src = file.src[s];
                if (!grunt.file.exists( src )) {
                    grunt.log.warn('Source file "' + src + '" not found.');
                    return false;
                }
                config_json = JSON.parse( grunt.file.read( src ) );

                for ( var prop_name in src_obj ) {
                    src_prop = src_obj[prop_name];
                    config_prop = config_json[prop_name];

                    if ( config_prop ) {
                        for ( var config_name in config_prop ) {
                            src_prop[config_name] = config_prop[config_name];
                        }
                    }
                }
            }

            var css_data = CSSModeling.process( src_obj );

            var final_less_str = saveFiles( css_data.less , "less/root" , "less" , path.resolve( dest ) );
            saveFiles( css_data.scss , "scss/root" , "scss" , path.resolve( dest ) );

            var state_data;
            for ( var s=0; s<css_data.less_states.length; s++ ) {
                state_data = css_data.less_states[s];
                final_less_str += saveFiles(
                    state_data ,
                    "less/state_"+state_data.state_name ,
                    "less" , path.resolve( dest )
                );
            }

            var state_data;
            for ( var s=0; s<css_data.scss_states.length; s++ ) {
                state_data = css_data.scss_states[s];
                saveFiles(
                    state_data ,
                    "scss/state_"+state_data.state_name ,
                    "scss" , path.resolve( dest )
                );
            }

            // concat everything now
            grunt.file.write(
                dest + "/less/less_final.less",
                final_less_str
            );

            // styleguide
            var styleguide = CSSModeling.createStyleGuide( css_data.less );
            grunt.file.write(
                dest + "/styleguide/index.html",
                styleguide
            );

            var filename = require.resolve( "../cssmodeling/styleguide/styleguide.css" );
            grunt.file.write(
                dest + "/styleguide/styleguide.css",
                grunt.file.read( filename )
            );

            var filename = require.resolve( "../cssmodeling/styleguide/styleguide.js" );
            grunt.file.write(
                dest + "/styleguide/styleguide.js",
                grunt.file.read( filename )
            );

            var filename = require.resolve( "../node_modules/jquery/dist/jquery.min.js" );
            grunt.file.write(
                dest + "/styleguide/jquery.min.js",
                grunt.file.read( filename )
            );
        }

    });

    var fs = require('fs');

    function readModuleFile(path, callback) {
        try {
            var filename = require.resolve(path);
            console.log( filename );
            fs.readFile(filename, 'utf8', callback);
        } catch (e) {
            callback(e);
        }
    }

    function saveFiles ( data , folder, extension , dest ) {

        var fileSave = require('file-save');

        var var_output =    CSSModeling.processGroupForArray(
                                data.groups , "variables", true
                            );

        var atoms_output =  CSSModeling.processGroupForArray(
                                data.groups , "atoms"
                            );

        var bases_output = CSSModeling.processGroupForArray(
                                data.groups , "bases"
                            );

        var utilities_output =  CSSModeling.processGroupForArray(
                                    data.groups , "utilities"
                                );

        var components_output =  CSSModeling.processGroupForArray(
                                    data.groups , "components"
                                );


        grunt.file.write(
            dest + "/" + folder + "/css_variables." + extension,
            var_output.join("")
        );

        grunt.file.write(
            dest + "/" + folder + "/css_atoms." + extension,
            atoms_output.join("")
        );

        grunt.file.write(
            dest + "/" + folder + "/css_bases." + extension,
            bases_output.join("")
        );

        grunt.file.write(
            dest + "/" + folder + "/css_utilities." + extension,
            utilities_output.join("")
        );

        grunt.file.write(
            dest + "/" + folder + "/css_components." + extension,
            components_output.join("")
        );

        // ORDER IS IMPORTANT TO CASCADE
        var final_output = [];

        final_output.push( "\n\n\n/*=========VARIABLES=============================================*/\n" );
        final_output.push( var_output.join("") );
        final_output.push( "\n\n\n/*=========COMPONENTS=================================================*/\n" );
        final_output.push( components_output.join("") );
        final_output.push( "\n\n\n/*=========BASES================================================*/\n" );
        final_output.push( bases_output.join("") );
        final_output.push( "\n\n\n/*=========UTILITIES=============================================*/\n" );
        final_output.push( utilities_output.join("") );
        final_output.push( "\n\n\n/*=========ATOMS=================================================*/\n" );
        final_output.push( atoms_output.join("") );

        var final_str = final_output.join("");
        grunt.file.write(
            dest + "/" + folder + "/css_final." + extension,
            final_str
        );

        return final_str;
    }

}
