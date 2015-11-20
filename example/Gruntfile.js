

module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('cssmodeling');
    grunt.loadNpmTasks('grunt-react');

    var configObj = {
        pkg: '<json:package.json>'
    };

    configObj.cssmodeling = configObj.cssmodeling || {};
    configObj.cssmodeling["example"] = {
        files: {
            'dist/csssystem':
            [
                'cssmodeling/css_groups.json',
                'cssmodeling/css_schemes.json',
                'cssmodeling/css_variables.json',
                'cssmodeling/css_atoms.json',
                'cssmodeling/css_bases.json',
                'cssmodeling/css_utilities.json',
                'cssmodeling/css_components.json',
                'cssmodeling/css_states.json'
            ]
        },
        options: {
            components:[
                'jsx/_Shared/**/*.less',
                'jsx/**/*.less'
            ],
            type:"less",
            rootpath:"../../../assets/"
        }
    };
    /*==========================
    Prototype REACT
    ==========================*/
    configObj.react = configObj.react || {};
    configObj.react["example"] = {files:{}}
    configObj.react["example"].files
        ['dist/example_jsx.js']
        = 'jsx/**/*.jsx';


    configObj.concat = configObj.concat || {};
    configObj.concat["example_js"] = {
        files: {
            'dist/example.js':
            [
                'node_modules/jquery/dist/jquery.min.js',
        		'node_modules/react/dist/react.js',
        		'node_modules/routestate/RouteState.js',
        		'node_modules/nanoscroller/bin/javascripts/jquery.nanoscroller.js',
                'node_modules/gemini-scrollbar/index.js',

                'dist/example_jsx.js',
                'jsx/**/*.js'
            ]
        }
    };
    configObj.concat = configObj.concat || {};
    configObj.concat["example"] = {
        files: {
            'dist/example_final.less':
            [
                'dist/csssystem/less/less_mixins.less',
                'jsx/_Shared/**/*.less',
                'jsx/**/*.less'
            ]
        }
    };

    configObj.less = configObj.less || {};
    configObj.less["example"] = {
        files: {
            'dist/example.css':
            [
                'dist/example_final.less'
            ]
        },
        options: {
            rootpath:"../../../assets/"
        }
    };

    configObj.compress = configObj.compress || {};
    configObj.compress["example"] = {
        options: {
            mode: 'gzip'
        },
        files: [
            {src: ['dist/example.css'], dest: 'dist/example.gzip'}
        ]
    };



    configObj.watch = configObj.watch || {};
    configObj.watch["react"] = {
        files:[
            'jsx/**/*.jsx',
            'jsx/**/*.less',
            'jsx/**/*.js',
        ],
        tasks: ["default"]
    };
    configObj.watch = configObj.watch || {};
    configObj.watch["cssmodeling"] = {
        files:[
            'cssmodeling/*.json'
        ],
        tasks: ["default"]
    };

    grunt.initConfig( configObj );
    grunt.registerTask( 'default' , [
        'react:example',
        'concat:example_js',
        'cssmodeling:example',
        'concat:example',
        'less:example'
    ] );


}
