'use strict';
/*
 'use strict' is not required but helpful for turning syntactical errors into true errors in the program flow
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
*/

/*
 Modules make it possible to import JavaScript files into your application.  Modules are imported
 using 'require' statements that give you a reference to the module.

  It is a good idea to list the modules that your application depends on in the package.json in the project root
 */

const fetch = require("node-fetch");
const app = require('connect')();
var util = require('util');

/*
 Once you 'require' a module you can reference the things that it exports.  These are defined in module.exports.

 For a controller in a127 (which this is) you should export the functions referenced in your Swagger document by name.

 Either:
  - The HTTP Verb of the corresponding operation (get, put, post, delete, etc)
  - Or the operationId associated with the operation in your Swagger document

  In the starter/skeleton project the 'get' operation on the '/hello' path has an operationId named 'hello'.  Here,
  we specify that in the exports of this module that 'hello' maps to the function named 'hello'
 */
module.exports = {
  movie: movie
};

/*
  Functions in a127 controllers used for operations should take two parameters:

  Param 1: a handle to the request object
  Param 2: a handle to the response object
 */
function movie(req, res) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var movie = req.swagger.params.name.value;





  var apiKey = "955d944c36f82d571b377297089d150d";
  var mapsKey = "AIzaSyCIUJLG6hXNgIrGpkfowopKhUPFncNGOWI";

  //var uri = "Fight Club";
  var encodedURI = encodeURI(movie);

  var url = "https://api.themoviedb.org/3/search/movie?api_key=" + apiKey + "&language=en-US&query=" + encodedURI + "&page=1";

  // var mapsUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=" + city + "&key=" + mapsKey;


  var actors = [];
  var actorsFinal = [];
  var promises = [];
  var promises2 = [];
  var title;
  var movie = [];
  var moviePoster;

  var getIDpromise = fetch(url)
    .then(function (response) {
      return response.json()
    })
    .then(function (jsonID) {
      console.log(jsonID);

      if (jsonID.total_results != 0) {
        title = jsonID.results[0].original_title;
        moviePoster = jsonID.results[0].poster_path;
        var id = jsonID.results[0].id;
        return fetch("https://api.themoviedb.org/3/movie/" + id + "/credits?api_key=" + apiKey);
      }  
      else{
        movie = { "title": "No results found", "moviePoster": "http://thehill.com/sites/default/files/styles/thumb_small_article/public/blogs/barackobama_1.jpg", "actors": [] }
        res.json(movie);        
        return;
      }    

    })
    .then(function (cast) {
      return cast.json();
    })
    .then(function (jsonCast) {

      var lengthCast = Object.keys(jsonCast.cast).length;
      if (Object.keys(jsonCast.cast).length > 20) {
        lengthCast = 20;
      }
      for (var i = 0; i < lengthCast; i++) {
        var actor = { name: jsonCast.cast[i].name, id: jsonCast.cast[i].id };
        //actors.push(actor);
        var promise = "https://api.themoviedb.org/3/person/" + actor.id + "?api_key=" + apiKey;
        promises.push(promise);
        //return fetch("https://api.themoviedb.org/3/person/" + actor.id + "?api_key=" + apiKey);
      }
      //console.log(promises);
      return promises;
    })
    .then(function (promises) {

      Promise.all(promises.map(function (url) {
        return fetch(url).then((resp) => {
          let json = resp.json(); // there's always a body
          if (resp.status >= 200 && resp.status < 300) {
            return json;
          } else {
            return json;
          }
        })
      }
      )).then(texts => {
        for (var i = 0; i < Object.keys(texts).length; i++) {

          if (texts[i].place_of_birth != null && texts[i].place_of_birth != undefined) {
            var actor = { "name": texts[i].name, "place_of_birth": texts[i].place_of_birth, "pic": texts[i].profile_path };
            console.log(actor.name);
            actors.push(actor);
          }
        }
        //console.log(actors);
        var actors2 = { "actors": actors };
        //res.json(actors2);
        //console.log(actors2)
        return actors2;

      }).then(function (response) {

        for (var i = 0; i < Object.keys(response.actors).length; i++) {

          var place = response.actors[i].place_of_birth;
          var encodedPlace = encodeURI(place);
          var promise = "https://maps.googleapis.com/maps/api/geocode/json?address=" + encodedPlace + "&key=" + mapsKey;
          console.log(promise);
          if (promise != null) {
            promises2.push(promise);
            //console.log(promise);
          }

        }
        //console.log(promises2);
        return promises2;
      }).then(function (promises) {

        Promise.all(promises.map(function (url) {
          return fetch(url).then((resp) => {
            let json = resp.json(); // there's always a body
            if (resp.status >= 200 && resp.status < 300) {
              return json;
            } else {
              return json;
            }
          })
        }
        )).then(response => {
          console.log(response);

          for (var i = 0; i < response.length; i++) {
            //console.log(response[i].results[0].geometry.location);

            if (response[i].status == 'OK') {

              var coord = response[i].results[0].geometry.location;

              var actor = { "name": actors[i].name, "place_of_birth": actors[i].place_of_birth, "pic": actors[i].pic, "coord": coord };
              // console.log(actor);
              actorsFinal.push(actor);
              //console.log(response.results[0].geometry.location);
            }
          }
          //movie.push({ "actors": actorsFinal });

          movie = { "title": title, "moviePoster": moviePoster, "actors": actorsFinal }
          res.json(movie);

        })
      })
    })

    //var actor2 = {name: jsonCurrentActror.name, place: jsonCurrentActror.place_of_birth}

    .catch(error => {
      console.log(error);
    })
  // this sends back a JSON response which is a single string
  .catch(error => {
    console.log(error);
  })

}