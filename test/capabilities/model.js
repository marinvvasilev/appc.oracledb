// jscs:disable jsDoc
var Arrow = require('arrow');

exports.model = Arrow.Model.extend('TEST_Post', {
	fields: {
		title: {type: String},
		content: {type: String}
	}
});
