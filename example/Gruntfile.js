

module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('@srouse/cssmodeling');

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
                'cssmodeling/css_components.json'
            ]
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
