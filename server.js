var express = require('express')
var app = express()
var expressSession = require('express-session')
var SessionStore = require('express-mysql-session')
var db_config = require('./config').db
var bodyParser = require('body-parser')
var User = require('./model/user')

function isValidCid(cid) {
  var re = /^\d{17}[x|X|\d]$/
  return re.test(cid)
}

function requireUser(req, res, next) {
  console.log('require user')
  if (!req.user) {
    res.redirect('/auth')
  } else {
    next()
  }
}

function checkIfLoggedIn(req, res, next) {
  console.log('check if logged in')
  if (req.session.uid) {
    User.get(req.session.uid, (err, user)=> {
      if(!err) {
        req.user = user
      }
      next()
    })
  } else {
    next()
  }
}

app.set('view engine', 'jade')
app.use('/public', express.static('public'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(require('cookie-parser')())
app.use(expressSession({
  resave: true,
  saveUninitialized: true,
  secret: 'brohuanlevelmusiC',
  store: new SessionStore(db_config)
}))


app.use(checkIfLoggedIn)
app.get('/', (req, res) => {
  if(req.user) {
    res.redirect('/info')
  } else {
    res.redirect('/auth')
  }
})

app.get('/auth', function(req, res) {
  console.log('GET: /auth')
  if(req.user) {
    res.redirect('/info')
  }
  res.render('auth')
})

app.post('/auth', function(req, res) {
  var name = req.body.username
  var cid = req.body.cid
  //if(!isValidCid(cid)) {
    //res.render('auth', {bad_credential: true})
    //return
  //}
  User.getByCid(cid, (err, result) => {
    if(result) {
      console.log(result)
      if(result.name === name) {
        req.session.uid = result.id
        res.redirect('info')
      } else {
        res.render('auth', {bad_credential: true})
      }
    } else {
      var user = {
        name: name,
        cid: cid
      }
      User.add(user, (err, id)=> {
        req.session.uid = id
        res.redirect('/')
      })
    }
  })
})

app.get('/info', requireUser, function(req, res) {
  console.log('GET: /info')
  var user = new User(req.user)
  user.getInfo((err, result)=> {
    if(err) {
      console.log(err)
      return
    } else {
      res.render('info', {
        user: result
      })
    }
  })
})

app.post('/info', requireUser, (req, res)=> {
  var user = new User(req.user)
  var data = {}
  data.nation = req.body.nation
  data.location = req.body.location
  data.school = req.body.school
  data.level = req.body.level
  data.song1 = req.body.song1
  data.song2 = req.body.song2
  user.update(data, (err)=> {
    res.redirect('/succ')
  })
})

app.get('/succ', function(req, res) {
  res.render('succ')
})

app.get('/logout', function(req, res) {
  delete req.session.uid
  res.redirect('/')
})

var server = app.listen('3000', ()=> {
  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)
})
