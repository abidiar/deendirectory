const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 60 * 5 }); // Default cache TTL: 5 minutes

module.exports = cache;