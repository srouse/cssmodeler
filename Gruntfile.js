

module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-react');
    grunt.loadNpmTasks('cssmodeling');

    var configObj = {
        pkg: '<json:package.json>'
    };

    var project_id = "Cmod-StyleGuide";

    /*==========================
    Prototype REACT
    ==========================*/
    configObj.react = configObj.react || {};
    configObj.react[project_id] = {files:{}}
    configObj.react[project_id].files['dist/cmod_jsx.js']
                                        = 'styleguide/jsx/**/*.jsx';

    configObj.concat = configObj.concat || {};
    configObj.concat[project_id + "_js"] = {
        files: {
            'dist/cmod.js':
            [
                'node_modules/jquery/dist/jquery.min.js',
        		'node_modules/react/dist/react.js',
        		'node_modules/routestate/RouteState.js',
        		'node_modules/nanoscroller/bin/javascripts/jquery.nanoscroller.js',
                'node_modules/gemini-scrollbar/index.js',

                'dist/cmod_jsx.js',
                'styleguide/jsx/**/*.js'
            ]
        }
    };
    configObj.concat[project_id + "_less"] = {
        files: {
            'dist/cmod.less':
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
            'dist/cmod.css':
            [
                'dist/cmod.less'
            ]
        }
    };


    configObj.copy = configObj.copy || {};
    configObj.copy[project_id] = {
        files: [
            {expand: true, flatten:true, src: ['styleguide/index.html'], dest: 'dist/', filter: 'isFile'},
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
