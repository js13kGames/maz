module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        ts: {
            dist: {
                src: ['src/main/ts/**/*.ts', 'src/main/d.ts/**/*.d.ts'],
                out: 'build/out.js',
                //reference: 'reference.ts',
                options: {
                    module: 'amd', //or commonjs
                    target: 'es5', //or es3
                    basePath: 'src/main/ts',
                    sourceMap: true,
                    declaration: false
                }
            },
            js13k: {
                src: ['build/out.ts'],
                out: 'build/out.js',
                options: {
                    module: 'amd', //or commonjs
                    target: 'es5', //or es3
                    basePath: 'src/main/ts',
                    sourceMap: true,
                    declaration: false
                }
            }

        },
        clean: {
            all: ["build", "dist", "dist.zip", "js13k.zip"],
            dist: ["dist"]
        },
        uglify: {
            options: {
                mangle: true,
                compress: true,
                drop_console: true
            },
            dist: {
                files: {
                    //'dist/out.min.js': ['build/out.js'],
                    'dist/lib/analytics.min.js': ['lib/analytics.js']
                }
            }
        },
        'closure-compiler': {
            dist: {
                closurePath: 'libbuild/closure-compiler',
                js: 'build/out.js',
                jsOutputFile: 'dist/out.min.js',
                maxBuffer: 500,
                reportFile: 'closure.txt',
                options: {
                    compilation_level: 'ADVANCED_OPTIMIZATIONS',
                    language_in: 'ECMASCRIPT5'
                }
            }
        },
        inline: {
            dist: {
                options: {
                    cssmin: true
                },
                src: 'dist/index.html',
                dest: 'dist/index.html'
            }
        },
        htmlmin: {                                     
            options: {
                removeComments: true,
                collapseWhitespace: true,
                removeOptionalTags: true,
                removeIgnored: true,
                cssmin: true,
                jsmin: true
            },
            dist: {
                files: {                               
                    'dist/index.html': 'index.html'
                }
            }
        },
        cssmin: {
            options: {
            },
            dist: {
                files: {
                    'dist/app.css': ['app.css']
                }
            }
        },
        copy: {
            dist: {
                files: [
                    { expand: true, src: ['lib/*.min.js'], dest: 'dist/' },
                    { expand: true, src: ['app.css'], dest: 'dist/' }
                ]
            }
        },
        concat: {
            options: {
            
            },
            js13k: {
                src: ['src/main/ts/**/*.ts'],
                dest: 'build/out.ts',
            },
        },
        replace: {
            js13k_ts: {
                src: ['build/out.ts'],
                overwrite: true,
                replacements: [{
                    from: /import [^\n]*\n/g,
                    to: ""
                }, {
                    from: /export namespace [^{]+{(([^\n]*(\n[^}])*)*?)}/g,
                    to: "$1"
                }, {
                    from: /export /g,
                    to: ""
                }, {
                    from: /([\s<:])((Intro)|(I))\./g,
                    to: "$1"
                }]
            },
            js13k_html: {
                src: ['dist/*.html'],
                overwrite: true,
                replacements: [{
                    from: /<script [^>]*analytics[^>]*><\/script>/g,
                    to: ""
                }, {
                    from: /\s*\n\s*/g,
                    to: ""
                }]
            },
            dist: {
                src: ['dist/*.html'],
                overwrite: true,
                replacements: [{
                    from: /build\/out/g,
                    to: "out"
                }, {
                    from: /.js/g,
                    to: ".min.js"
                }]
            }
        },
        compress: {
            js13k: {
                options: {
                    archive: 'js13k.zip',
                },
                expand: true,
                level: 10,
                cwd: 'dist/',
                src: ['*.html'],
                dest: '.'
            },
            dist: {
                options: {
                    archive: 'dist.zip',    
                },
                expand: true,
                level: 10,
                cwd: 'dist/',
                src: ['*', 'lib/**'],
                dest: '.'
            }

        },
        devUpdate: {
            main: {
                options: {
                    //task options go here 
                    updateType: 'force'
                }
            }
        }
    });

    // clean
    grunt.loadNpmTasks('grunt-contrib-clean');
    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    // load the plugin that provides the closure compiler
    grunt.loadNpmTasks('grunt-closure-compiler');
    // load the plugin that provides the htmlmin task
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    // load the plugin that provides the cssmin task
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    // Load the plugin that provides the "TS" task.
    grunt.loadNpmTasks('grunt-ts');
    // zip
    grunt.loadNpmTasks('grunt-contrib-compress');
    // copy
    grunt.loadNpmTasks('grunt-contrib-copy');
    // replace text in file
    grunt.loadNpmTasks('grunt-text-replace');
    // inline js 
    grunt.loadNpmTasks('grunt-inline');
    // update version
    grunt.loadNpmTasks('grunt-dev-update');
    // contatenate files
    grunt.loadNpmTasks('grunt-contrib-concat');

    // Default task(s).
    grunt.registerTask('reset', ['clean:all']);
    grunt.registerTask('prod', ['closure-compiler', 'htmlmin', 'replace:dist']);
    grunt.registerTask('dist', ['ts:dist', 'copy', 'prod', 'uglify', 'compress:dist']); //, 'clean:js', 'clean:dist'
    grunt.registerTask('js13k', ['concat', 'replace:js13k_ts', 'ts:js13k', 'prod', 'inline', 'replace:js13k_html', 'compress:js13k'])
    grunt.registerTask('default', ['ts:dist']);

};