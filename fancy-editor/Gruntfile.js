module.exports = function (grunt) {
    require("load-grunt-tasks")(grunt);
    grunt.initConfig({
        babel: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    "client/app/dist/bundle_babel.js": "client/app/src/**/*.js"
                }
            }
        },
        browserify:{
            dist: {
                options: {
                    transform: [
                        ["babelify", {
                            loose: "all"
                        }],
                        //["babel-runtime"] ??
                    ]
                },
                files: {
                    // if the source file has an extension of es6 then
                    // we change the name of the source file accordingly.
                    // The result file's extension is always .js
                    'public/app/main/Editor/dist/fancy-editor.js': ['public/app/main/Editor/src/Editor.js']
                }
            }
        },
        concat: {
            options: {
                separator: '\n',
            },
            basic_and_extras: {
                files: {
                    'public/app/main/Editor/dist/fancy-editor.css':['public/app/main/Editor/src/**/*.css']
                },
            }
        },
        watch: {
            babelfiles:{
                files: ['public/app/main/Editor/src/**/*.js'],
                tasks : ['browserify']
            },
            cssfiles:{
                files: ['public/app/main/Editor/src/**/*.css'],
                tasks: ['concat']
            }

        },
    });

    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['browserify','concat','watch']);
};