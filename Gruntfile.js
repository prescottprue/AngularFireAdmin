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
            files: ['<%= config.devFolder %>/*.js'],
            // tasks:[ 'connect:docs'],
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
        // copy: {
        //   dist: {
        //     files: [
        //       {expand: true, cwd: './<%= config.devFolder %>', src:'*.js', dest: '<%= config.distFolder %>'}
        //     ],
        //   },
        // },
            // merge files from src/ into angularfire.js
        concat: {
          app: {
            // options: { banner: '<%= meta.banner %>' },
            src: [
              '<%= config.devFolder %>/module.js',
              '<%= config.devFolder %>/session/service.js',
              '<%= config.devFolder %>/session/Group.js',
              '<%= config.devFolder %>/session/User.js',
              '<%= config.devFolder %>/fa.js'

            ],
            dest: '<%= config.distFolder %>/angular-fireadmin.js'
          },
          bundle: {
            // options: { banner: '<%= meta.banner %>' },
            src: [
              'bower_components/angular/angular.min.js',
              'bower_components/firebase/firebase.js',
              'bower_components/angularfire/dist/angularfire.min.js',
              '<%= config.devFolder %>/lib/*.js',
              '<%= config.distFolder %>/angular-fireadmin.min.js'
              
            ],
            dest: '<%= config.distFolder %>/angular-fireadmin-bundle.js'
          }
        },
        uglify:{
          options:{
            compress:{
              drop_console:true
            }
          },
          dist:{
            files:{
              '<%= config.distFolder %>/angular-fireadmin.min.js': ['<%= config.distFolder %>/angular-fireadmin.js']
            }
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
        shell:{
          compile:{
            command:'java -jar <%= env.CLOSURE_PATH %>/build/compiler.jar ' +
            '--js_output_file=dist/fireadmin.min.js <%= config.devFolder %>/fa.js  --define="DEBUG=false" '+
            '--only_closure_dependencies --closure_entry_point=faModule <%= config.devFolder %>/closure-library/** ' +
            '--warning_level=VERBOSE --compilation_level=SIMPLE_OPTIMIZATIONS '+
            ' --angular_pass --externs <%= env.CLOSURE_PATH %>/externs/angular.js --generate_exports ' //Angular
          },
        }
    });

    // Default task(s).
    grunt.registerTask('default', [ 'connect:dev', 'watch']);
    //Documentation, minify js, minify html
    // grunt.registerTask('build', ['jsdoc', 'closure-compiler']);
    grunt.registerTask('build', ['jsdoc', 'uglify','concat']);

    grunt.registerTask('docs', ['jsdoc', 'connect:docs']);

    grunt.registerTask('test', ['build', 'connect:stage', 'watch']);

    grunt.registerTask('stage', ['build', 'aws_s3:stage']);

    grunt.registerTask('release', ['stage','aws_s3:production']);

    grunt.registerTask('releaseVersion', ['stage','bump-only:prerelease', 'bump-commit', 'aws_s3:production']);

};
