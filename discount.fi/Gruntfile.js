module.exports = function (grunt) {
    grunt.initConfig({
        concat: {
            options: {
                separator: '\n',
            },
            basic_and_extras: {
                files: {
                    'dist/bundle.css':['stylesheets/**/*.css','!dist/**/*.css'],
                    'dist/bundle.js':['javascripts/**/*.js','!dist/**/*.js']
                },

            }
        },
        watch: {
            cssfiles:{
                files: ['stylesheets/**/*.css','!dist/**/*.css'],
                tasks : ['concat']
            },
            jsfiles:{
                files: ['javascripts/**/*.js','!dist/**/*.js'],
                tasks: ['concat']
            },
            sassfiles:{
                files: ['stylesheets/**/*.scss'],
                tasks: ['sass']
            }

        },
        sass:{
            dist:{
                files:{
                    'stylesheets/main.css':'stylesheets/main.scss'
                }
            }
        }
    });


    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-sass');

    grunt.registerTask('default', ['sass','concat','watch']);
};