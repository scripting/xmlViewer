var myVersion = "0.5.7", myProductName = "viewXmlServerApp", myPort = 5374;  
const utils = require ("daveutils");
const request = require ("request");
const http = require ("http"); 
const urlpack = require ("url");
const fs = require ("fs");

const fnameTemplate = "template.html";
const urlTemplate = "http://fargo.io/code/shared/viewxmlserverapp/template.html";

function httpReadUrl (url, callback) {
	var options = { 
		url: url,
		jar: true,
		gzip: true, //6/25/17 by DW
		maxRedirects: 5,
		headers: {
			"User-Agent": myProductName + " v" + myVersion
			}
		};
	request (options, function (err, response, data) {
		if (!err && (response.statusCode == 200)) {
			callback (undefined, data.toString ());
			}
		else {
			if (!err) {
				err = {
					message: "Can't read the file because there was an error. Code == " + response.statusCode + "."
					}
				}
			callback (err);
			}
		});
	}
function startup () {
	function xmlNeuter (xmltext) {
		return (utils.encodeXml (xmltext));
		}
	function startHttpServer () {
		function httpServer (httpRequest, httpResponse) {
			function doHttpReturn (code, type, s) { 
				httpResponse.writeHead (code, {"Content-Type": type});
				httpResponse.end (s);    
				}
			function doRequest (xmlUrl) {
				httpReadUrl (xmlUrl, function (err, data) {
					if (err) {
						doHttpReturn (500, "text/plain", err.message);
						}
					else {
						httpReadUrl (urlTemplate, function (err, templateText) {
							if (err) {
								console.log ("doRequest: err.message == " + err.message);
								}
							else {
								var pagetable = {
									url: xmlUrl,
									bodytext: xmlNeuter (data.toString ())
									};
								var pagetext = utils.multipleReplaceAll (templateText.toString (), pagetable, false, "[%", "%]");
								doHttpReturn (200, "text/html", pagetext);
								}
							});
						}
					});
				}
			try {
				var parsedUrl = urlpack.parse (httpRequest.url, true), now = new Date ();
				var lowerpath = parsedUrl.pathname.toLowerCase ();
				
				console.log ("httpServer: " + lowerpath);
				
				switch (httpRequest.method) {
					case "GET":
						switch (lowerpath) {
							case "/":
								if (parsedUrl.query.url === undefined) {
									doHttpReturn (400, "text/plain", "Can't process the request because there is no \"url\" parameter supplied.");
									}
								else {
									doRequest (decodeURI (parsedUrl.query.url));
									}
								break;
							case "/version":
								doHttpReturn (200, "text/plain", myVersion);
								break;
							case "/now":
								doHttpReturn (200, "text/plain", new Date ().toString ());
								break;
							default: 
								doHttpReturn (404, "text/plain", "Not found.");
								break;
							}
						break;
					}
				}
			catch (err) {
				doHttpReturn (503, "text/plain", err.message);
				console.log ("handleRequest: tryError.message == " + err.message);
				}
			}
		console.log ("startHttpServer: myPort == " + myPort);
		http.createServer (httpServer).listen (myPort);
		}
	startHttpServer ();
	}
startup ();
