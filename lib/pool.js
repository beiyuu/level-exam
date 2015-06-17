var mysql = require('mysql')
var config = require('../config')
var pool = mysql.createPool(config.db)

module.exports = pool
