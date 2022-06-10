const productName = "xmlViewer", version = "0.6.0"; 


var theEditor;  //ace-editor object


function setText (s) {
	if (s === undefined) {
		s = "";
		}
	theEditor.setValue (s);
	}
function startEditor (textToDisplay) {
	theEditor = ace.edit ("idEditor");
	var session = theEditor.getSession ();
	theEditor.setTheme ("ace/theme/chrome");
	theEditor.setShowPrintMargin (false);
	session.setMode ("ace/mode/html");
	
	theEditor.setOptions ({ //6/9/22 by DW
		readOnly: true,
		maxLines: Infinity,
		autoScrollEditorIntoView: true,
		wrap: false
		});
	
	theEditor.$blockScrolling = Infinity;
	theEditor.container.style.lineHeight = 1.6;
	theEditor.setFontSize ("12px");
	
	setText (textToDisplay); //6/9/22 by DW
	theEditor.clearSelection (); //6/9/22 by DW
	
	}
function showEditor () {
	$("#idUrl").css ("visibility", "visible");
	$("#idEditorContainer").css ("display", "table-cell");
	}
function readHttp (url, callback) {
	readHttpFileThruProxy (url, undefined, function (feedtext) {
		if (feedtext !== undefined) {
			startEditor (feedtext);
			showEditor ();
			callback (feedtext)
			}
		});
	}
function everyMinute () {
	}
function everySecond () {
	}
function startup () {
	const whenstart = new Date ();
	function getUrlParam (name) { 
		var val = getURLParameter (name);
		if (val == "null") {
			return (undefined);
			}
		else {
			return (decodeURIComponent (val));
			}
		}
	console.log ("startup");
	var feedUrl = "http://scripting.com/rss.xml";
	var urlparam = getUrlParam ("url");
	if (urlparam !== undefined) {
		feedUrl = urlparam;
		}
	$("#idUrl").text (feedUrl);
	readHttp (feedUrl, function (feedtext) {
		console.log ("startup: readHttp took " + secondsSince (whenstart) + " secs.");
		if (feedtext !== undefined) {
			startEditor (feedtext);
			showEditor ();
			}
		});
	hitCounter ();
	runEveryMinute (everyMinute);
	}
