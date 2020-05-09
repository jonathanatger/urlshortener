'use strict';

var express = require('express');
var bodyParser = require('body-parser')
var mongo = require('mongodb');
var mongoose = require('mongoose');
var dns = require('dns')

var cors = require('cors');

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.DB_URI);
process.env.MONGODB_URI="mongodb+srv://jonathanatger:jonathanatger@cluster0-ogdqs.gcp.mongodb.net/test?retryWrites=true&w=majority"
mongoose.connect(process.env.MONGODB_URI)

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});




//Mongoose
var Schema = mongoose.Schema;

var urlSchema = new Schema({
  //identifier : Number,
  originalUrl : String
})


var UrlModel = mongoose.model('URL', urlSchema);

var doneFunc = (Obj) => {
  try{console.log("done !" + Obj.toString())}
  catch{}
}

var checkExistingUrls = function(url, done){
  return UrlModel.find({originalUrl : url}, function(err, data) {
    if (err) return console.error(err);
    done(createNewUrl(data, doneFunc));
  })
}


var checkFunctioningUrl = function(url, done){
  let result = dns.lookup(url, function(err, data){
    if (err && err.code)  {
      console.error(err.code)
    }
    done(data)
  })
  console.log(result)
  
  if(result != "error"){
    return true
  }
  return false
}


var createNewUrl = function(url){  
  let newUrl = new UrlModel({originalUrl : url})
  newUrl.save(function(err, data) {
    if (err) return console.error(err);
    doneFunc(data)    
  })
  return newUrl
}




  
// POST

app.post("/api/shorturl/new", function (req, res){
  let input = req.body.url
  let output = "error"
      //Object.keys(req)
  let check = checkFunctioningUrl(input, doneFunc)
  
  /*
  if(check == true){
    let newModel = createNewUrl(input, doneFunc)
    output = newModel._id
  }
  */
  
  res.json({"original_url" : input, "short_url" : check})
})







//listen to port
app.listen(port, function () {
  console.log('Node.js listening ...');
});