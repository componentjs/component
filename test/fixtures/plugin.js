/*
  example middleware plugin for builder
*/

module.exports = function(builder) {
  console.log('middleware fired!');
  builder.on('config', function() {
    console.log('builder config fired!')
  })
}