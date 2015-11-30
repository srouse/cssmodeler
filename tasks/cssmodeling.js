
'use strict';

var path = require("path");

var CSSModeling = require("../cssmodeling/CSSModeling");

module.exports = function (grunt) {

    grunt.registerMultiTask( 'cssmodeling', 'model CSS systems', function () {

        if ( this.files.length < 1 ) {
		    grunt.verbose.warn('Destination not written because no source files were provided.');
	    }

        var options = this.options();
        var preprocessor_type = "less";
        if ( options.type == "sass" || options.type == "scss" ) {
            preprocessor_type = "scss";
        }

        var components = {};

        if ( options.components ) {
            var file,components_loc,files,file_name,file_content,file_name_arr;
            for ( var components_name in options.components ) {
                components_loc = options.components[ components_name ];
                files = grunt.file.expand( components_loc );
                for ( var f=0; f<files.length; f++ ) {
                    file = files[f];
                    file_name_arr = file.split("/");
                    file_name = file_name_arr[ file_name_arr.length-1 ];
                    file_name = file_name.replace( /\.less/g , "" );
                    file_name = file_name.replace( /\.scss/g , "" );

                    file_content = grunt.file.read( file );
                    components[file_name] = {
                        css_string:file_content,
                        file_path:file
                    };
                }
            }
        }

        var file,data_config,src,src_obj,dest,config_json;
        var src_prop,config_prop;
		for ( var f=0; f<this.files.length; f++ ) {
            file = this.files[f];
            dest = file.dest;

            // ==============CONFIGS==============
            src_obj = {
                groups:{},schemes:{},variables:{},
                atoms:{},bases:{},utilities:{},
                states:{}//,components:{}
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
                            // TODO: check for repeats and send warning....
                            src_prop[config_name] = config_prop[config_name];
                        }
                    }
                }
            }

            var css_data = CSSModeling.process( src_obj , preprocessor_type );

            // ==============LESS==============
            if ( preprocessor_type == "less" ) {
                var less_results = saveFiles(
                        css_data.less , "less/root" ,
                        "less" , path.resolve( dest )
                    );
                var final_less_str = less_results.css;
                var final_less_mixin_str = less_results.mixins;

                var state_data,state_results;
                for ( var s=0; s<css_data.less_states.length; s++ ) {
                    state_data = css_data.less_states[s];
                    state_results = saveFiles(
                        state_data ,
                        "less/state_" + state_data.state_name ,
                        "less" , path.resolve( dest )
                    );
                    final_less_str += state_results.css;
                    final_less_mixin_str += state_results.mixins;
                }

                // concat everything now
                grunt.file.write(
                    dest + "/less/less_css.less",
                    final_less_str
                );
                grunt.file.write(
                    dest + "/less/less_mixins.less",
                    final_less_mixin_str
                );
                grunt.file.write(
                    dest + "/less/less_final.less",
                    final_less_mixin_str + "\n" + final_less_str
                );
            }

            // ==============SCSS==============
            if ( preprocessor_type == "scss" ) {
                var scss_results = saveFiles(
                            css_data.scss , "scss/root" ,
                            "scss" , path.resolve( dest )
                        );
                var final_scss_str = scss_results.css;
                var final_scss_mixin_str = scss_results.mixins;

                var state_data;
                for ( var s=0; s<css_data.scss_states.length; s++ ) {
                    state_data = css_data.scss_states[s];
                    state_results = saveFiles(
                        state_data ,
                        "scss/state_"+state_data.state_name ,
                        "scss" , path.resolve( dest )
                    );
                    final_scss_str += state_results.css;
                    final_scss_mixin_str += state_results.mixins;
                }
                // concat everything now
                grunt.file.write(
                    dest + "/scss/scss_css.scss",
                    final_scss_str
                );
                grunt.file.write(
                    dest + "/scss/_scss_mixins.scss",
                    final_scss_mixin_str
                );
                grunt.file.write(
                    dest + "/scss/scss_final.scss",
                    final_scss_mixin_str + "\n" + final_scss_str
                );
            }

            // =====================STYLEGUIDE==================
            if ( preprocessor_type == "less" ) {
                createCoreCSSViaLess( grunt , dest );
                createComponentCSSViaLess( grunt , dest , options );
            }else{
                // ...
            }

            // Move files to destination
            var filename = require.resolve( "../styleguide/dist/cmod_styleguide.css" );
            grunt.file.write(
                dest + "/styleguide/cmod_styleguide.css",
                grunt.file.read( filename )
            );
            var filename = require.resolve( "../styleguide/dist/cmod_styleguide.js" );
            grunt.file.write(
                dest + "/styleguide/cmod_styleguide.js",
                grunt.file.read( filename )
            );
            var filename = require.resolve( "../styleguide/dist/index.html" );
            grunt.file.write(
                dest + "/styleguide/index.html",
                grunt.file.read( filename )
            );

            // Data
            if ( preprocessor_type == "less" ) {
                css_data.less.components = components;
                var test_json = JSON.stringify( css_data.less );
                grunt.file.write(
                    dest + "/styleguide/cssmodeling.json",
                    test_json
                );
            }else{
                css_data.scss.components = components;
                var test_json = JSON.stringify( css_data.scss );
                grunt.file.write(
                    dest + "/styleguide/cssmodeling.json",
                    test_json
                );
            }
        }
    });

    var fs = require('fs');

    function readModuleFile(path, callback) {
        try {
            var filename = require.resolve(path);
            fs.readFile(filename, 'utf8', callback);
        } catch (e) {
            callback(e);
        }
    }

    function getLessTask ( grunt ) {
        require('grunt-contrib-less/tasks/less.js')( grunt );
        var less_task = grunt.config.get( 'less' );
        less_task = less_task || {};
        return less_task;
    }

    function getConcatTask ( grunt ) {
        require('grunt-contrib-concat/tasks/concat.js')( grunt );
        var concat_task = grunt.config.get( 'concat' );
        concat_task = concat_task || {};
        return concat_task;
    }

    function getCSSParseTask ( grunt ) {
        require('grunt-css-parse/tasks/css_parse.js')( grunt );
        var css_parse_task = grunt.config.get( 'css_parse' );
        css_parse_task = css_parse_task || {};
        return css_parse_task;
    }

    function createCoreCSSViaLess ( grunt , dest ) {
        //=======LESS for Styleguide (easier grunt install)======
        var less_id = 'less.cssmodeling';
        var less_task = getLessTask( grunt );

        less_task[ less_id ] = {
            src: [dest + "/less/less_final.less"],
            dest: dest + "/core.css"
        }
        grunt.config.set( 'less' , less_task );
        grunt.task.run( 'less:' + less_id );
    }

    function createComponentCSSViaLess ( grunt , dest , options ) {
        if ( options.components ) {

            // CONCAT
            var concat_task = getConcatTask( grunt );
            options.components.unshift( dest + "/less/less_mixins.less" );
            concat_task[ "cssmodeling_components" ] = {
                src: options.components,
                dest: dest + "/less/components.less"
            }
            grunt.config.set( 'concat' , concat_task );
            grunt.task.run( "concat:cssmodeling_components" );

            // LESS
            var rootpath = options.rootpath || "";
            var less_task = getLessTask( grunt );
            less_task[ "cssmodeling_components" ] = {
                options:{rootpath:rootpath},
                files:{}
            }
            less_task[ "cssmodeling_components" ].files[
                dest + "/components.css"
            ] = dest + "/less/components.less";
            grunt.config.set( 'less' , less_task );
            grunt.task.run( "less:cssmodeling_components" );

            // CSS PARSE
            var css_parse = getCSSParseTask( grunt );
            css_parse[ "cssmodeling_components_parse" ] = {
                src: dest + "/components.css",
                dest: dest + "/styleguide/components.json"
            }
            grunt.config.set( 'css_parse' , css_parse );
            grunt.task.run( "css_parse:cssmodeling_components_parse" );
        }
    }


    function saveFiles ( data , folder, extension , dest ) {

        var var_output          = CSSModeling.processTypeForArray(
                                    data.variables
                                );

        var atoms_output        = CSSModeling.processTypeForArray(
                                    data.atoms
                                );

        var atoms_output        = CSSModeling.processTypeForArray(
                                    data.atoms
                                );

        var bases_output        = CSSModeling.processTypeForArray(
                                    data.bases
                                );

        var utilities_output    = CSSModeling.processTypeForArray(
                                    data.utilities
                                );

        /*
        grunt.file.write(
            dest + "/" + folder + "/css_variables." + extension,
            var_output.css.join("")
        );

        grunt.file.write(
            dest + "/" + folder + "/css_atoms." + extension,
            atoms_output.css.join("")
        );

        grunt.file.write(
            dest + "/" + folder + "/css_atoms_mixins." + extension,
            atoms_output.mixins.join("")
        );

        // grunt.file.write(
        //    dest + "/" + folder + "/css_bases." + extension,
        //    bases_output.css.join("")
        // );

        grunt.file.write(
            dest + "/" + folder + "/css_utilities." + extension,
            utilities_output.css.join("")
        );

        grunt.file.write(
            dest + "/" + folder + "/css_utilities_mixins." + extension,
            utilities_output.mixins.join("")
        );
        */

        // ORDER IS IMPORTANT TO CASCADE
        var final_output = [];
        var final_css_output = [];
        var final_mixins_output = [];

        // MIXINS
        final_mixins_output.push( var_output.css.join("") );
        final_mixins_output.push( atoms_output.mixins.join("") );
        final_mixins_output.push( utilities_output.mixins.join("") );
        var final_mixins_str = final_mixins_output.join("");
        grunt.file.write(
            dest + "/" + folder + "/final_mixins." + extension,
            final_mixins_str
        );

        // CSS
        final_css_output.push( bases_output.css.join("") );
        final_css_output.push( utilities_output.css.join("") );
        final_css_output.push( atoms_output.css.join("") );
        var final_css_str = final_css_output.join("");
        grunt.file.write(
            dest + "/" + folder + "/final_css." + extension,
            final_css_str
        );

        // FINAL
        final_output.push( final_mixins_str );
        final_output.push( final_css_str );
        var final_str = final_output.join("");
        grunt.file.write(
            dest + "/" + folder + "/final." + extension,
            final_str
        );

        return {css:final_css_str,mixins:final_mixins_str};
    }

}
