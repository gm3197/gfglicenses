// Spreadsheet ID
let file_id = "17r9yI8vUyQkCEtSSjjgjy3IJWEd71ZYiSgKATQFPm30"
// Don't edit below

let GoogleSpreadsheet = require("google-spreadsheet")
let creds = require("./credentials.json")
let doc = new GoogleSpreadsheet(file_id)
doc.useServiceAccountAuth(creds, function(err) {
  if (err) console.error(err)
})

var http = require('http')
var url = require('url')
var auth = require('basic-auth')
var compare = require('tsscmp')

var server = http.createServer(function (req, res) {
  var credentials = auth(req)
  if (!credentials || !check(credentials.name, credentials.pass)) {
    res.statusCode = 401
    res.setHeader('WWW-Authenticate', 'Basic realm="GFG Activation"')
    res.end('Access denied')
  } else {
    var uri = url.parse(req.url)
    res.statusCode = 200
    if (uri.pathname == "/") {
      res.end(`<html><h1>GFG Activation</h1><br><label>Barcode: </label><input id="id"><script>document.getElementById("id").focus();document.getElementById("id").addEventListener("keydown",function(e) {if (e.keyCode === 13) {submit()}});function submit() {window.open("/code/" + document.getElementById("id").value,"_self")}</script></html>`)
    } else if (uri.pathname.startsWith("/code/")) {
      if (uri.query == null) {
        let id = uri.pathname.replace("/code/","")
        getCode(id, function(code) {
          if (code) {
            res.end(`<html><h1>GFG Activation</h1><br><label>Barcode: </label><input id="id"><br><p>Activation Code: <b>${code.activationcode}</b></p><p>Destination: <b>${code.destination}</b> <a href="javascript:changeDestination()">Change</a></p><script>document.getElementById("id").focus();document.getElementById("id").addEventListener("keydown",function(e) {if (e.keyCode === 13) {submit()}});function submit() {window.open("/code/" + document.getElementById("id").value,"_self")};function changeDestination() {window.open("/code/${id}?changeDestination=" + prompt("Enter the new destination value:"),"_self")}</script></html>`)
          } else {
            res.end(`<html><h1>GFG Activation</h1><br><label>Barcode: </label><input id="id"><br><p>Not found</p><script>document.getElementById("id").focus();document.getElementById("id").addEventListener("keydown",function(e) {if (e.keyCode === 13) {submit()}});function submit() {window.open("/code/" + document.getElementById("id").value,"_self")};function changeDestination() {window.open("/code/${id}?changeDestination=" + prompt("Enter the new destination value:"),"_self")}</script></html>`)
          }
        })
      } else if (uri.query.startsWith("changeDestination=")) {
        let id = uri.pathname.replace("/code/","")
        let newDestination = decodeURI(uri.query.replace("changeDestination=",""))
        updateDestination(id, newDestination, function(code) {
          if (code) {
            res.end(`<html><h1>GFG Activation</h1><br><label>Barcode: </label><input id="id"><br><p>Activation Code: <b>${code.activationcode}</b></p><p>Destination: <b>${code.destination}</b> <a href="javascript:changeDestination()">Change</a></p><script>document.getElementById("id").focus();document.getElementById("id").addEventListener("keydown",function(e) {if (e.keyCode === 13) {submit()}});function submit() {window.open("/code/" + document.getElementById("id").value,"_self")};function changeDestination() {window.open("/code/${id}?changeDestination=" + prompt("Enter the new destination value:"),"_self")}</script></html>`)
          } else {
            res.end(`<html><h1>GFG Activation</h1><br><label>Barcode: </label><input id="id"><br><p>Not found</p><script>document.getElementById("id").focus();document.getElementById("id").addEventListener("keydown",function(e) {if (e.keyCode === 13) {submit()}});function submit() {window.open("/code/" + document.getElementById("id").value,"_self")};function changeDestination() {window.open("/code/${id}?changeDestination=" + prompt("Enter the new destination value:"),"_self")}</script></html>`)
          }
        })
      }
    } else {
      res.statusCode = 301
      res.setHeader('Location','/')
      res.end()
    }
  }
})

function check (name, pass) {
  var valid = true
  valid = compare(name, 'admin') && valid
  valid = compare(pass, 'password') && valid
  return valid
}

function updateDestination(id,newDestination,cb) {
  doc.getRows(1, {}, function(err, rows) {
    if (err) console.error(err)
    var found = false
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].refurbishedcoaid == id) {
        found = true
        rows[i].destination = newDestination
        cb(rows[i])
        doc.getCells(1,{
          "min-row": (i+2),
          "max-row": (i+2),
          "min-col": 1,
          "max-col": 1,
          "return-empty": true
        }, function(err, cells) {
          if (err) console.error(err)
          cells[0].setValue(newDestination)
        })
      }
    }
    if (found == false) {
      cb(false)
    }
  })
}

function getCode(id,cb) {
  doc.getRows(1, {}, function(err, rows) {
    if (err) console.error(err)
    var found = false
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].refurbishedcoaid == id) {
        found = true
        cb(rows[i])
        break
      }
    }
    if (found == false) {
      cb(false)
    }
  })
}

server.listen(3000)
