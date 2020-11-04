const app = require('./app')
//const port = process.env.PORT


// app.listen(port, () => {
//     console.log('Server is up on port ' + port)
// })

var server = app.listen(process.env.PORT, function () {
    var port = server.address().port;
    console.log("Express is working on port " + port);
  });
  