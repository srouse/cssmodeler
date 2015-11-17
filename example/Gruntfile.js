

module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('cssmodeling');

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
        }
    };
    configObj.less = configObj.less || {};
    configObj.less["cssmodeling"] = {
        files: {
            'dist/csssystem/styleguide.css':
            [
                'dist/csssystem/less/less_final.less'
            ]
        }
    };

    configObj.watch = configObj.watch || {};
    configObj.watch["cssmodeling"] = {
        files:[
            'cssmodeling/*.json'
        ],
        tasks: ["default"]
    };

    configObj.concat = configObj.concat || {};
    configObj.concat["example"] = {
        files: {
            'dist/example_final.less':
            [
                'dist/csssystem/less/less_final.less',
                //'dist/csssystem/less/root/css_final.less',
                'example.less'
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

    grunt.initConfig( configObj );
    // 'build' was put together in processProjects
    grunt.registerTask( 'default' , [
        'cssmodeling:example',
        'concat:example',
        'less:example'
    ] );


}
