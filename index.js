var restify = require( 'restify' );
var bindIp = '0.0.0.0', bindPort = '8081';
var fs = require('fs');
var rita = require('rita');
var markov = new rita.RiMarkov(3);

var server = restify.createServer( {

    name: 'bebgen.theimpossibleastronaut.com',
    handleUpgrades: true,
    version: '1.0.0'

} );

annotateModel();

server.get( {path: '/*'}, generateLyrics );

server.pre(restify.pre.userAgentConnection());

server.listen( bindPort, bindIp, function() {

    console.log( '%s listening at %s ', server.name , server.url );
    console.log( 'Ready.' );

});

function generateLyrics( req, res, next ) {

	var str = "Birdeatsbaby lyrics generator.\r\nEvery time you refresh this page, a new lyric is generated using computational linguistics based on previous lyrics.\r\nThis is a first version, so please forgive any problems with the generated text.\r\n-------------------\r\n\r\n";

	var strings = markov.generateSentences(
		Math.floor( Math.random() * (24 - 14 + 1) ) + 14
	);

	for ( var i = 0; i < strings.length; i++ ) {
		if ( i % 4 == 3) {
			str += "\r\n";
		}

		str += strings[i] + "\r\n";
	}

	res.end(str);

}

function annotateModel() {
	readFiles('lyrics/', function(filename,content){
		console.log("Loaded " + filename);
		markov.loadText(content);
	},
	function(err){
		throw err;
	});
}

function readFiles(dirname, onFileContent, onError) {
  fs.readdir(dirname, function(err, filenames) {
    if (err) {
      onError(err);
      return;
    }
    filenames.forEach(function(filename) {
      fs.readFile(dirname + filename, 'utf-8', function(err, content) {
        if (err) {
          onError(err);
          return;
        }
        onFileContent(filename, content);
      });
    });
  });
}