var async = require('async');

module.exports = function (grunt) {

	// Project configuration.
	grunt.initConfig({
		appcJs: {
			src: ['*.js', 'lib/**/*.js', 'test/**/*.js']
		},
		mocha_istanbul: {
			coverage: {
				src: 'test',
				options: {
					timeout: 30000,
					ignoreLeaks: false,
					check: {
						statements: 90,
						branches: 85,
						functions: 95,
						lines: 90
					}
				}
			}
		},
		clean: ['tmp']
	});

	// Test Setup
	grunt.registerTask('createTestData', function () {
		var cb = this.async(),
			config = require('./conf/default').connectors['appc.oracledb'],
			OracleDB = require('oracledb');
		OracleDB.getConnection(config, function (err, connection) {
			if (err) {
				cb(err);
			} else {
				async.eachSeries([
						'DROP TABLE TEST_Post PURGE',
						'CREATE TABLE TEST_Post (' +
						' id NUMBER GENERATED BY DEFAULT ON NULL AS IDENTITY,' +
						' title VARCHAR2(255),' +
						' content VARCHAR2(255),' +
						' CONSTRAINT test_post_id PRIMARY KEY (id)' +
						')'
					],
					function (sql, next) {
						connection.execute(
							sql,
							function (err, results) {
								if (results && results.rows) {
									console.log(results.rows);
								}
								next();
							});
					},
					cb);
			}
		});
	});

	// Load grunt plugins for modules.
	grunt.loadNpmTasks('grunt-appc-js');
	grunt.loadNpmTasks('grunt-mocha-istanbul');
	grunt.loadNpmTasks('grunt-contrib-clean');

	// Register tasks.
	grunt.registerTask('default', ['appcJs', 'createTestData', 'mocha_istanbul:coverage', 'clean']);

};
