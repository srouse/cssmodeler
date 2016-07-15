

module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('cssmodeling');

    var configObj = {
        pkg: '<json:package.json>'
    };

    configObj.cssmodeling = configObj.cssmodeling || {};
    configObj.cssmodeling["example"] = {
        files: {
            'dist/csssystem':
            [
                'cssmodeling/css_col_12_quartered_viewport.json',
                'cssmodeling/css_rows_quartered.json',
                'cssmodeling/css_simple.json',
                'cssmodeling/css_flex_layouts.json'
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

    configObj.watch = configObj.watch || {};
    configObj.watch["cssmodeling"] = {
        files:[
            'cssmodeling/*.json'
        ],
        tasks: ["cssmodeling:example"]
    };

    grunt.initConfig( configObj );
    // 'build' was put together in processProjects
    grunt.registerTask( 'default' , [
        'cssmodeling:example'
    ] );


}
