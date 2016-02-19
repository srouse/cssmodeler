

module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-react');

    var configObj = {
        pkg: '<json:package.json>'
    };

    var project_id = "Cmod-StyleGuide";

    /*==========================
    Prototype REACT
    ==========================*/
    configObj.react = configObj.react || {};
    configObj.react[project_id] = {files:{}}
    configObj.react[project_id].files[
        'styleguide/dist/_temp/cmod_styleguide_jsx.js']
        = 'styleguide/jsx/**/*.jsx';

    configObj.concat = configObj.concat || {};
    configObj.concat[project_id + "_js"] = {
        files: {
            'styleguide/dist/cmod_styleguide.js':
            [
                'node_modules/jquery/dist/jquery.min.js',
        		'node_modules/react/dist/react.js',
        		'node_modules/routestate/RouteState.js',
        		'node_modules/nanoscroller/bin/javascripts/jquery.nanoscroller.js',
                'node_modules/gemini-scrollbar/index.js',
                'styleguide/dist/_temp/cmod_styleguide_jsx.js',
                'styleguide/jsx/**/*.js'
            ]
        }
    };
    configObj.concat[project_id + "_less"] = {
        files: {
            'styleguide/dist/_temp/cmod_styleguide.less':
            [
                'styleguide/jsx/_Shared/Font.less',//fonts there
                'styleguide/jsx/**/*.less',
                'node_modules/gemini-scrollbar/gemini-scrollbar.css'
            ]
        }
    };
    configObj.less = configObj.less || {};
    configObj.less[project_id] = {
        files: {
            'styleguide/dist/cmod_styleguide.css':
            [
                'styleguide/dist/_temp/cmod_styleguide.less'
            ]
        }
    };


    configObj.copy = configObj.copy || {};
    configObj.copy[project_id] = {
        files: [
            {expand: true, flatten:true,
                src: ['styleguide/index.html'],
                dest: 'styleguide/dist/',
                filter: 'isFile'},
        ]
    }

    configObj.watch = configObj.watch || {};
    configObj.watch[project_id] = {
        files:[
            'styleguide/jsx/**/*.jsx',
            'styleguide/jsx/**/*.less',
            'styleguide/jsx/**/*.js'
        ],
        tasks: ["default"]
    };

    /*==========================
    FINAL INIT
    ==========================*/
    grunt.initConfig( configObj );
    grunt.registerTask( 'default' , [
        'react',
        'concat',
        'less',
        'copy'
    ] );

}
