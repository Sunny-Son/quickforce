var express = require('express');
//var bodyParser = require('body-parser')
var path = require('path');
var nforce = require('nforce');
var hbs = require('hbs');

var app = express();

app.set('view engine', 'hbs');
app.enable('trust proxy');


function isSetup() {
  return (process.env.CONSUMER_KEY != null) && (process.env.CONSUMER_SECRET != null);
}

function oauthCallbackUrl(req) {
  return req.protocol + '://' + req.get('host');
}

hbs.registerHelper('get', function(field) {
  return this.get(field);
});

app.get('/', function(req, res) {
  if (isSetup()) {
    var org = nforce.createConnection({
      clientId: process.env.CONSUMER_KEY,
      clientSecret: process.env.CONSUMER_SECRET,
      redirectUri: oauthCallbackUrl(req),
      mode: 'single'
    });

    if (req.query.code !== undefined) {
      // authenticated
      org.authenticate(req.query, function(err) {
        if (!err) {
//          org.query({ query: 'SELECT id, name, type, industry, rating FROM Account' }, function(err, results) {
          org.query({ query: 'SELECT id, name, productcode, description, family FROM product2' }, function(err, results) {
            if (!err) {
              res.render('index', {records: results.records});
            }
            else {
              res.send(err.message);
            }
          });
        }
        else {
          if (err.message.indexOf('invalid_grant') >= 0) {
            res.redirect('/');
          }
          else {
            res.send(err.message);
          }
        }
      });
    }
    else {
      res.redirect(org.getAuthUri());
    }
  }
  else {
    res.redirect('/setup');
  }
});

app.get('/setup', function(req, res) {
  if (isSetup()) {
    res.redirect('/');
  }
  else {
    var isLocal = (req.hostname.indexOf('localhost') == 0);
    var herokuApp = null;
    if (req.hostname.indexOf('.herokuapp.com') > 0) {
      herokuApp = req.hostname.replace(".herokuapp.com", "");
    }
    res.render('setup', { isLocal: isLocal, oauthCallbackUrl: oauthCallbackUrl(req), herokuApp: herokuApp});
  }
});

app.get('/update', function(req, res) {
  if (isSetup()) {
    var org = nforce.createConnection({
      clientId: process.env.CONSUMER_KEY,
      clientSecret: process.env.CONSUMER_SECRET,
      redirectUri: oauthCallbackUrl(req),
      mode: 'single'
    });

    const product_name="SUNNY";
    const product_id="01t0o0000090m7SAAQ";

    if (req.query.code !== undefined) {
      // authenticated
      org.authenticate(req.query, function(err) {
        if (!err) {
//          org.query({ query: 'SELECT id, name, type, industry, rating FROM Account' }, function(err, results) {
//          org.query({ query: 'SELECT id, name, productcode, description, family FROM product2' }, function(err, results) {
          org.query({ query: 'UPDATE product2 SET NAME = \'SUNNY\' WHERE id=\'01t0o0000090m7SAAQ\' ' },function(err, results) {
//          org.query({ query: 'UPDATE product2 SET NAME = ${product_name} WHERE id=${product_id}' },function(err, results) {
            if (!err) {
//              res.render('index', {records: results.records});
              res.send('updated');
            }
            else {
              res.send(err.message);
            }
          });
        }
        else {
          if (err.message.indexOf('invalid_grant') >= 0) {
            res.redirect('/update');
          }
          else {
            res.send(err.message);
          }
        }
      });
    }
    else {
      res.redirect(org.getAuthUri());
    }
  }
  else {
    res.redirect('/setup');
  }
});

app.listen(process.env.PORT || 5000);
