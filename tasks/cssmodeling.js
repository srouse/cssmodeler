
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
                components:{}
            };

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

            saveFiles( css_data.less , "less" , path.resolve( dest ) );
            saveFiles( css_data.scss , "scss" , path.resolve( dest ) );

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

    function saveFiles ( data , extension , dest ) {

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
            dest + "/" + extension + "/css_variables." + extension,
            var_output.join("")
        );

        grunt.file.write(
            dest + "/" + extension + "/css_atoms." + extension,
            atoms_output.join("")
        );

        grunt.file.write(
            dest + "/" + extension + "/css_bases." + extension,
            bases_output.join("")
        );

        grunt.file.write(
            dest + "/" + extension + "/css_utilities." + extension,
            utilities_output.join("")
        );

        grunt.file.write(
            dest + "/" + extension + "/css_components." + extension,
            components_output.join("")
        );

        // ORDER IS IMPORTANT TO CASCADE
        grunt.file.write(
            dest + "/" + extension + "/css_final." + extension,
            "\n\n\n/*=========VARIABLES=============================================*/\n" +
            var_output.join("") +
            "\n\n\n/*=========COMPONENTS=================================================*/\n" +
            components_output.join("") +
            "\n\n\n/*=========BASES================================================*/\n" +
            bases_output.join("") +
            "\n\n\n/*=========UTILITIES=============================================*/\n" +
            utilities_output.join("") +
            "\n\n\n/*=========ATOMS=================================================*/\n" +
            atoms_output.join("")

        );
    }

}
