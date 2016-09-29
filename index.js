const transform = require('./lib/transform');

module.exports = transform;
module.exports.combine = require('./lib/combine');
module.exports.transform = transform;
module.exports.api = require('./lib/api/index');
