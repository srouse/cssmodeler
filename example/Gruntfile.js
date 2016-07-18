

module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('cssmodeling');

    var configObj = {
        pkg: '<json:package.json>'
    };

    configObj.cssmodeling = configObj.cssmodeling || {};
    configObj.cssmodeling["example_scss"] = {
        files: {
            'dist/csssystem':
            [
                'cssmodeling/css_breakpoints.json',
                'cssmodeling/css_simple.json'
            ]
        },
        options: {
            resets:[
                // 'cssmodeling/_resets/**/*.css'
            ],
            type:"scss",
            var_prefix:"v-"
        }
    };

    configObj.cssmodeling["example_less"] = {
        files: {
            'dist/csssystem':
            [
                'cssmodeling/css_breakpoints.json',
                'cssmodeling/css_simple.json'
            ]
        },
        options: {
            resets:[
                // 'cssmodeling/_resets/**/*.css'
            ],
            type:"less",
            var_prefix:"v-"
        }
    };

    configObj.watch = configObj.watch || {};
    configObj.watch["cssmodeling"] = {
        files:[
            'cssmodeling/*.json'
        ],
        tasks: ["cssmodeling"]
    };

    grunt.initConfig( configObj );
    // 'build' was put together in processProjects
    grunt.registerTask( 'default' , [
        'cssmodeling'
    ] );


}
