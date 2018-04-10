var restify = require( 'restify' );
var bindIp = '0.0.0.0', bindPort = '8081';
var fs = require('fs');
var rita = require('rita');
var markovs = [];

var server = restify.createServer( {

    name: 'bebgen.theimpossibleastronaut.com',
    handleUpgrades: true,
    version: '1.0.0'

} );

var configuration = JSON.parse( fs.readFileSync( 'configuration.json' ) );
annotateModel();

server.get( {path: '/*'}, generateLyrics );

server.pre(restify.pre.userAgentConnection());

server.listen( bindPort, bindIp, function() {

    console.log( '%s listening at %s ', server.name , server.url );
    console.log( 'Ready.' );

});

function generateLyrics( req, res, next ) {

	res.setHeader("Content-Type", "text/plain; charset=utf-8");

	var config = getConfiguration( req );
	var ind = config.index;

	var str = config.text;

	var strings = markovs[ind].generateSentences(
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

var currentConfig;
function annotateModel() {

	for ( var i = 0; i < configuration.apps.length; i++ ) {
		currentConfig = i;

		configuration.apps[currentConfig].index = i;

		console.log( "Setting up " + configuration.apps[currentConfig].domain );
		markovs[i] = new rita.RiMarkov(3);

		readFiles(configuration.apps[currentConfig], function(config,filename,content){
			console.log("Loaded " + filename + " into " + config.domain);

			markovs[config.index].loadText(content);
		},
		function(err){
			throw err;
		});

	}
}

function readFiles(config, onFileContent, onError) {
	var paths = config.folder.split(",");
	paths.forEach(function(theFolder){
		fs.readdir(theFolder, function(err, filenames) {
			if (err) {
			  onError(err);
			  return;
			}
			filenames.forEach(function(filename) {
			  fs.readFile(theFolder + "/" + filename, 'utf-8', function(err, content) {
			    if (err) {
			      onError(err);
			      return;
			    }
			    onFileContent(config, filename, content);
			  });
			});
		});
	});
}

function getConfiguration( req ) {
	var domain = "";

	if ( req.headers.origin !== undefined ) {
		domain = req.headers.origin;
	} else if ( req.headers.host !== undefined ) {
		domain = req.headers.host;
	}

	domain = domain.split(":");
	domain = domain[0];

	for ( var i = 0; i < configuration.apps.length; i++ ) {
		if ( configuration.apps[i].domain.toLowerCase() == domain.toLowerCase() ) {
			return configuration.apps[i];
		}
	}

	return configuration.apps[0];
}