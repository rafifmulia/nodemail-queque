const path = require('path'); 
require('dotenv').config({ path: path.join(__dirname, '.env') });

module.exports = {
    dbConfig: {
        connectionLimit: process.env.CONNECTIONLIMIT,
        host: process.env.DBHOST,
        user: process.env.DBUSER,
        password: process.env.DBPASSWORD,
        database: process.env.DATABASE,
    },
}