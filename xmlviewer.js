var myVersion = "0.40c", myProductName = "viewXmlServerApp", myPort = 5374;  
const utils = require ("daveutils");
const request = require ("request");
const http = require ("http"); 
const urlpack = require ("url");

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
			try {
				var parsedUrl = urlpack.parse (httpRequest.url, true), now = new Date ();
				var lowerpath = parsedUrl.pathname.toLowerCase ();
				
				console.log ("httpServer: " + lowerpath);
				
				switch (httpRequest.method) {
					case "GET":
						switch (lowerpath) {
							case "/":
								var xmlUrl = decodeURI (parsedUrl.query.url);
								console.log ("httpServer: xmlUrl == " + xmlUrl);
								
								var options = { //6/26/17 by DW
									url: xmlUrl,
									jar: true,
									gzip: true, //6/25/17 by DW
									maxRedirects: 5,
									headers: {
										"User-Agent": myProductName + " v" + myVersion
										}
									};
								
								request (options, function (error, response, data) {
									if (!error && (response.statusCode == 200)) {
										doHttpReturn (200, "text/html", xmlNeuter (data));
										}
									else {
										doHttpReturn (response.statusCode, "text/plain", error.message);
										}
									});
								break;
							case "/version":
								doHttpReturn (200, "text/plain", myVersion);
								break;
							case "/now":
								doHttpReturn (200, "text/plain", new Date ().toString ());
								break;
							case "/build":
								try {
									var blogName = parsedUrl.query.blog, blogConfig = config.blogs [blogName];
									getBlogJsontext (blogConfig, function (jsontext) {
										try {
											var jstruct = JSON.parse (jsontext);
											blogConfig.lastSocketJsontext = undefined; //consume it
											blogConfig.jstruct = jstruct; //5/15/17 by DW
											publishBlog (jstruct, blogConfig, function () {
												doHttpReturn (200, "text/plain", blogConfig.baseUrl);
												});
											}
										catch (err) {
											blogConfig.lastSocketJsontext = undefined;
											doHttpReturn (503, "text/plain", err.message);
											}
										});
									}
								catch (err) {
									doHttpReturn (503, "text/plain", err.message);
									}
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
