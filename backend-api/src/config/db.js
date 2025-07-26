// This file configures and exports the Knex instance for database interactions.

const knex = require("knex");
const knexConfig = require("../../knexfile");

// Use the 'development' environment configuration by default,
// or the one specified by the NODE_ENV environment variable.
const environment = process.env.NODE_ENV || "development";
const config = knexConfig[environment];

// Export the configured Knex instance.
module.exports = knex(config);
