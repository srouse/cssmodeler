module.exports = function(grunt) {
  grunt.initConfig({
    cssmodeling: {
      prototype: {
        files: {
          "dist/cssmodel": [
            "cssmodel/models/cols/col12vex_cssmodel.json",
            "cssmodel/models/cols/col12r_cssmodel.json",
            "cssmodel/models/flex/flx_cssmodel.json",
            "cssmodel/models/simple/smpl_cssmodel.json",
            "cssmodel/models/spacing/sqr24_cssmodel.json",
            "cssmodel/cssmodeling_skin.json"
          ]
        },
        options: {
          resets: [],
          var_prefix: "",
          type: "scss",
          imports: {
            "scss": "$test: 5px;",
            'less': "@test: 5px;",
            "css": "--test: 5px;"
          }
        }
      }
    },
    watch: {
      cssmodeling: {
        files: ["cssmodeling/**/*.json"],
        tasks: ["cssmodeling", "sass"]
      },
    }
  });

  grunt.loadNpmTasks("cssmodeling");

  grunt.registerTask("default", ["cssmodeling"]);
};
