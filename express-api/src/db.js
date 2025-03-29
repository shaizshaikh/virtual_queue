const { Pool } = require('pg');

const pool = new Pool({
    user: 'myuser',
    host: 'localhost',  // If running inside Docker, use 'host.docker.internal'
    database: 'mydatabase',
    password: 'mypassword',
    port: 5431, // This should match your docker-compose port mapping
});

module.exports = pool;
