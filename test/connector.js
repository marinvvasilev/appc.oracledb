// jscs:disable jsDoc
var should = require('should'),
	async = require('async'),
	_ = require('lodash'),
	base = require('./_base'),
	Arrow = base.Arrow,
	server = base.server,
	connector = base.connector,
	model = require('./capabilities/model.js').model;

describe('Connector', function () {

	it('should require a minimum version of Arrow', function () {
		var mockConnector = {
			Capabilities: {},
			extend: function () {}
		};

		should(function () {
			require('../lib/index').create({
				Connector: mockConnector
			});
		}).throw();
		should(function () {
			require('../lib/index').create({
				Version: '1.2.0',
				Connector: mockConnector
			});
		}).throw();
		should(function () {
			require('../lib/index').create({
				Version: '1.7.0',
				Connector: mockConnector
			});
		}).not.throw();
	});

	it('should getTableSchema', function () {
		var results = connector.getTableSchema('TEST_POST');
		should(results).be.ok;
		should(Object.keys(results).length).be.ok;
	});

	it('should handle connection errors in query', function (next) {
		var _getConnection = connector.getConnection;
		try {
			connector.getConnection = function (cb) {
				cb(new Error('test error'));
			};
			connector._query('SELECT 1', null, function (err) {
				should(err).be.ok;
				next();
			}, null);
		}
		finally {
			connector.getConnection = _getConnection;
		}
	});

	it('should handle connection execution errors in query', function (next) {
		var _getConnection = connector.getConnection;
		try {
			connector.getConnection = function (cb) {
				cb(null, {
					execute: function (query, data, options, cb) {
						cb(new Error('test error'));
					}
				});
			};
			connector._query('SELECT 1', null, function (err) {
				should(err).be.ok;
				next();
			}, null);
		}
		finally {
			connector.getConnection = _getConnection;
		}
	});

	it('should getPrimaryKeyColumn', function () {
		should(connector.getPrimaryKeyColumn({
			getMeta: function () {
				return 'test-pk';
			}
		})).eql('test-pk');
	});

	it('should getTableName', function () {
		should(connector.getTableName({
			_parent: {
				name: 'test-name'
			},
			getMeta: function () {
				return false;
			}
		})).eql('test-name');

		should(connector.getTableName({
			getMeta: function () {
				return false;
			},
			_supermodel: 'test-name'
		})).eql('test-name');

		should(connector.getTableName({
			getMeta: function () {
				return false;
			},
			name: 'test-name'
		})).eql('test-name');

	});

	it('should translateWhereToQuery', function () {

		should(connector.translateWhereToQuery({
			foo: 'bar',
			baz: undefined
		}, {})).eql(' WHERE "FOO" = :foo');

		should(connector.translateWhereToQuery({
			foo: 'bar',
			baz: 'quz'
		}, {})).eql(' WHERE "FOO" = :foo AND "BAZ" = :baz');

		should(connector.translateWhereToQuery({
			foo: {$like: 'bar'}
		}, {})).eql(' WHERE "FOO" LIKE :foo');

	});

	it('should return the number of rows', function (done) {
		connector.create(model, {
			title: 'Nolan',
			content: 'Wright'
		}, function (err) {
			should(err).be.ok;

			connector.count(model, null, function (err, result) {
				should(err).be.ok;
				should(result).equal(1);
				done();
			});
		});
	});

});
