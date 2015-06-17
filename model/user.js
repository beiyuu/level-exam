var pool = require('../lib/pool')

function User(user) {
  this.name = user.name
  this.cid = user.cid
  this.id = user.id
}

User.prototype.getInfo = function(callback) {
  var that = this
  var info = {}
  pool.getConnection((err, conn)=> {
    if(err) {
      console.log(err)
    }
    var sql = 'select * from user where id=' + that.id
    console.log(sql)

    var query = conn.query(sql, (err, result)=> {
      if(err) {
        return callback(err)
      }
      conn.release()
      callback(null, result[0])
    })
  })
}

User.prototype.update = function (data, callback) {
  var that = this
  pool.getConnection((err, conn)=> {
    if(err) {
      return callback(err)
    }
    var sql = 'UPDATE user SET ? WHERE id=' + that.id
    console.log(sql)

    var query = conn.query(sql, data, (err, result)=> {
      if(err) {
        console.log(err)
        return callback(err)
      }
      conn.release()
      callback(null)
    })
  })
}

User.getByCid = function(cid, callback) {
  pool.getConnection(function (err, conn) {
    if(err) {
      return callback(err)
    }

    var sql = 'SELECT * FROM user where cid='+conn.escape(cid)
    console.log(sql)

    conn.query(sql, function (err, results, fields) {
      if(err) {
        return callback(err)
      }

      if(results.length == 1) {
        var newUser = new User({
          name: results[0].name,
          cid: results[0].cid,
          id: results[0].id
        })
        conn.release()
        callback(null, newUser)
      } else {
        conn.release()
        callback(null)
      }
    })
  })
}

User.get = function(id, callback) {
  pool.getConnection(function (err, conn) {
    if(err) {
      return callback(err)
    }

    var sql = 'SELECT * FROM user where id='+conn.escape(id)
    console.log(sql)

    conn.query(sql, function (err, results, fields) {
      if(err) {
        return callback(err)
      }

      if(results.length == 1) {
        var newUser = new User({
          name: results[0].name,
          cid: results[0].cid,
          id: results[0].id
        })
        conn.release()
        callback(null, newUser)
      } else {
        conn.release()
        callback(null)
      }
    })
  })
}

User.add = function(user, callback) {
  pool.getConnection(function (err, conn) {
    if(err) {
      return callback(err)
    }

    var sql = 'INSERT INTO user SET ?'
    console.log(sql)

    conn.query(sql, user, function (err, result) {
      if(err) {
        return callback(err)
      }
      console.log('new user added')
      console.log(result)
      callback(null, result.insertId)
    })
  })
}

module.exports = User
