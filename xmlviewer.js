var myVersion = "0.5.0", myProductName = "viewXmlServerApp", myPort = 5374;  
const utils = require ("daveutils");
const request = require ("request");
const http = require ("http"); 
const urlpack = require ("url");
const fs = require ("fs");

const fnameTemplate = "template.html";

function startup () {
	function xmlNeuter (xmltext) {
		return ("<html><body><h4 style=\"display: none\">Thanks Google for making this necessary just to view the source of an RSS feed.</h4><pre>" + utils.encodeXml (xmltext) + "</pre></body></html>");
		}
	function startHttpServer () {
		function httpServer (httpRequest, httpResponse) {
			function doHttpReturn (code, type, s) { 
				httpResponse.writeHead (code, {"Content-Type": type});
				httpResponse.end (s);    
				}
			function doRequest (xmlUrl) {
				var options = { 
					url: xmlUrl,
					jar: true,
					gzip: true, //6/25/17 by DW
					maxRedirects: 5,
					headers: {
						"User-Agent": myProductName + " v" + myVersion
						}
					};
				console.log ("doRequest: xmlUrl == " + xmlUrl);
				request (options, function (error, response, data) {
					if (!error && (response.statusCode == 200)) {
						fs.readFile (fnameTemplate, function (err, templateText) {
							if (err) {
								console.log ("doRequest: err.message == " + err.message);
								}
							else {
								console.log ("doRequest: templateText.length == " + templateText.length);
								var pagetable = {
									url: xmlUrl,
									bodytext: xmlNeuter (data.toString ())
									};
								var pagetext = utils.multipleReplaceAll (templateText.toString (), pagetable, false, "[%", "%]");
								doHttpReturn (200, "text/html", pagetext);
								}
							});
						}
					else {
						doHttpReturn (response.statusCode, "text/plain", error.message);
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
