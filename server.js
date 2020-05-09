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
var port = process.env.PORT || 5500;

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
  originalUrl : String,
  newUrl : String
})


var UrlModel = mongoose.model('URL', urlSchema);

var doneFunc = (Obj) => {
  try{console.log("done !" + Obj.toString())}
  catch{}
}

/* var checkExistingUrls = function(url, done){
  return UrlModel.find({originalUrl : url}, function(err, data) {
    if (err) return console.error(err);
    done(createNewUrl(data, doneFunc));
  })
} */







var checkFunctioningUrl = function(url, callback){
  var tempDnsUrl = url.slice(url.indexOf("//") + 2); //need to remove http(s)://
  console.log("before check")

  dns.lookup(tempDnsUrl, function(err, address, family){    
    if (err && err.code)  {
      console.error(err)
      callback(err, null);      
      } else {
      console.log("dnslookup")
      callback(null, address);
      }
    }
  ) 
 
}

var createNewUrl = function(url, data, callback){  
  let newUrl = new UrlModel({originalUrl : url, newUrl : data.toString() })
  newUrl.save(function(err, data) {
    if (err) {
      console.error(err)  
      callback(err, null)   
    }else{      
      console.log("newUrl Mongo data : " + data)
      callback(null, data)
    }
  }) 
}


// POST
app.post("/api/shorturl/new", function (req, res){
  let input = req.body.url
      
  checkFunctioningUrl(input, function(err, data){
      if(err){
        console.error(err)
        res.json({"error":"invalid URL"})
      } else {
        console.log("check")
        createNewUrl(input, data, function(err, newUrlData){
          if(err){
            console.error(err)
          }else{             
            console.log("final callback")
            res.json({"original_url": input, "data":data})
          }
        })        
      }
  })  
})


app.get("/api/shorturl/:ip", function(req, res){
  let reqUrl = req.params.ip;

  queryUrl(reqUrl, function(err, data){
    if(err) console.error(err);
    else{
      console.log(data)
      res.redirect(data[0].originalUrl);
    }
  })
})

var queryUrl = function (ip, callback){
  UrlModel.find({newUrl : ip}, function(err,data){
    if (err) {callback(err, null)}
    else {
      console.log(ip)
      callback(null, data)
    }
  })
}




//listen to port
app.listen(port, function () {
  console.log('Node.js listening ...');
});