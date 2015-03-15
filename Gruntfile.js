module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        config: grunt.file.readJSON('config.json'),
        env: grunt.file.readJSON('env.json'),
        connect: {
          dev: {
            options: {
              port: '<%= config.Port %>',
              //keepalive: true, keeping grunt running
              livereload:true,
              base: '<%= config.devFolder %>/',
              open: {
                target: 'http://localhost:<%= config.Port %>',
                appName: 'Google Chrome',
              }
            }
          },
          stage:{
            options: {
              port: '<%= config.Port %>',
              //keepalive: true, keeping grunt running
              livereload:true,
              base: '<%= config.distFolder %>/',
              open: {
                target: 'http://localhost:<%= config.Port %>',
                appName: 'Google Chrome',
              }
            }
          },
          docs:{
            options: {
              port: '<%= config.docsPort %>',
              // keepalive: true,
              livereload:true,
              base: '<%= config.distFolder %>/docs/',
              open: {
                target: 'http://localhost:<%= config.docsPort %>',
                appName: 'Google Chrome',
              }
            }
          }
        },
        watch: {
          js: {
            files: ['<%= config.devFolder %>/fa.js'],
            tasks:['jsdoc'],
            options:{
              livereload:{
                port:35729
              },
            }
          },
          html: {
            files: ['<%= config.devFolder %>/index.html'],
            // tasks:[],
            options:{
              livereload:{
                port:35729
              },
            }
          }
        },
        aws_s3:{
          production:{
            options: {
              accessKeyId: '<%= env.AWSAccessKeyId %>',
              secretAccessKey: '<%= env.AWSSecretKey %>',
              bucket:'<%= env.Bucket %>',
              uploadConcurrency: 30
            },
            files:[
              {'action': 'upload', expand: true, cwd: '<%= config.distFolder %>', src: ['**'], dest: '<%= env.BucketFolder %>/<%= pkg.version %>', differential:true},
              {'action': 'upload', expand: true, cwd: '<%= config.distFolder %>', src: ['**'], dest: '<%= env.BucketFolder %>/current', differential:true}
            ]
          },
          stage:{
            options: {
              accessKeyId: '<%= env.AWSAccessKeyId %>',
              secretAccessKey: '<%= env.AWSSecretKey %>',
              bucket:'<%= env.Bucket %>',
              uploadConcurrency: 30
            },
            files:[
              {'action': 'upload', expand: true, cwd: '<%= config.distFolder %>', src: ['**'], dest: '<%= env.BucketFolder %>/staging', differential:true}
            ]
          }
        },
        jsdoc: {
          dev:{
            src: ['<%= config.devFolder %>/fa.js'],
            options: {
              destination: '<%= config.distFolder %>/docs',
              template:'node_modules/grunt-jsdoc/node_modules/ink-docstrap/template',
              configure : "node_modules/grunt-jsdoc/node_modules/ink-docstrap/template/jsdoc.conf.json"
            }
          }
        },
        bump:{
          options:{
            files:['package.json'],
            updateConfigs:['pkg'],
            commit:true,
            commitMessage:'[RELEASE] Release v%VERSION%',
            commitFiles:['-a'],
            createTag:true,
            tagName:'v%VERSION%',
            push:true,
            pushTo:'origin',
            gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
            globalReplace: false
          }
        },
        // 'closure-compiler': {
        //   Fireadmin: {
        //     js: '<%= config.devFolder %>/fireadmin.js',
        //     jsOutputFile: '<%= config.distFolder %>/fireadmin.min.js',
        //     maxBuffer: 500,
        //     options: {
        //       compilation_level: 'SIMPLE_OPTIMIZATIONS',
        //       language_in: 'ECMASCRIPT5_STRICT',
        //     }
        //   },
        //   dev: {
        //     js: '<%= config.devFolder %>/fireadmin.js',
        //     jsOutputFile: '<%= config.devFolder %>/fireadmin.min.js',
        //     maxBuffer: 500,
        //     options: {
        //       compilation_level: 'SIMPLE_OPTIMIZATIONS',
        //       language_in: 'ECMASCRIPT5_STRICT',
        //     }
        //   }
        // },
        shell:{
          compile:{
            command:'java -jar <%= env.CLOSURE_PATH %>/build/compiler.jar ' +
            '--js_output_file=dist/fireadmin.min.js <%= config.devFolder %>/fa.js  --define="DEBUG=false" '+
            '--only_closure_dependencies --closure_entry_point=faModule <%= config.devFolder %>/closure-library/** ' +
            '--warning_level=VERBOSE --compilation_level=SIMPLE_OPTIMIZATIONS '+
            ' --angular_pass --externs <%= env.CLOSURE_PATH %>/externs/angular.js --generate_exports ' //Angular
          },
          // compileBundle:{
          //   command:'java -jar <%= env.CLOSURE_PATH %>/build/compiler.jar ' +
          //   '--js_output_file=dist/angular-fireadmin.min.js <%= config.devFolder %>/fa.js  --define="DEBUG=false" '+
          //   '--only_closure_dependencies --closure_entry_point=faModule <%= config.devFolder %>/closure-library/** ' +
          //   '--warning_level=VERBOSE --compilation_level=SIMPLE_OPTIMIZATIONS '+
          //   ' --angular_pass --externs <%= env.CLOSURE_PATH %>/externs/angular.js --generate_exports '+ //Angular
          //   // '--externs bower_components/angular/angular.js --externs bower_components/angular-ui-router/release/angular-ui-router.min.js'+
          //   ' --externs bower_components/firebase/firebase.js --externs bower_components/angularfire/dist/angularfire.min.js'
          // },
        }

    });

    // Default task(s).
    grunt.registerTask('default', [ 'jsdoc','connect:docs','connect:dev', 'watch']);
    //Documentation, minify js, minify html
    // grunt.registerTask('build', ['jsdoc', 'closure-compiler']);
    grunt.registerTask('build', ['jsdoc', 'shell:compile']);

    grunt.registerTask('docs', ['jsdoc', 'connect:docs']);

    grunt.registerTask('test', ['build', 'connect:stage', 'watch']);

    grunt.registerTask('stage', ['build', 'aws_s3:stage']);

    grunt.registerTask('release', ['stage','aws_s3:production']);

    grunt.registerTask('releaseVersion', ['stage','bump-only:prerelease', 'bump-commit', 'aws_s3:production']);

};
