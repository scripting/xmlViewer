var appConsts = {
	version: "0.4.0" 
	}

var theEditor;  //ace-editor object
var editorSerialnum = 0;
var idCurrentEditor = undefined;
var whenLastUserAction = new Date ();
var savedEditorStatus = {
	};
var flEditorChanged = false;

function editorChanged () {
	flEditorChanged = true;
	whenLastUserAction = new Date ();
	}
function getText () {
	var s = theEditor.getValue ();
	s = replaceAll (s, "\r", "\n"); //so source listings are readable in Chrome
	return (s);
	}
function setText (s) {
	if (s === undefined) {
		s = "";
		}
	theEditor.setValue (s);
	}
function saveEditorStatus () {
	savedEditorStatus.text = getText ();
	savedEditorStatus.selectionRange = theEditor.getSelectionRange ();
	savedEditorStatus.folds = theEditor.session.getAllFolds ().map (function (fold) {
		return {
			start       : fold.start,
			end         : fold.end,
			placeholder : fold.placeholder
			};
		});
	localStorage.savedEditorStatus = jsonStringify (savedEditorStatus);
	
	if (savedEditorStatus.ctUpdates === undefined) {
		savedEditorStatus.ctUpdates = 1;
		}
	else {
		savedEditorStatus.ctUpdates++
		}
	
	console.log ("saveEditorStatus: localStorage.savedEditorStatus == " + localStorage.savedEditorStatus);
	}
function restoreEditorStatus () {
	if (savedEditorStatus.selectionRange !== undefined) {
		theEditor.getSelection ().setSelectionRange (savedEditorStatus.selectionRange);
		}
	if (savedEditorStatus.folds !== undefined) {
		var Range = ace.require ("ace/range").Range;
		try {
			savedEditorStatus.folds.forEach (function (fold) {
				theEditor.session.addFold (fold.placeholder, Range.fromPoints (fold.start, fold.end));
				});
			} 
		catch (err) {
			}
		}
	if (savedEditorStatus.urlMockupPage !== undefined) {
		updateMockupPageDisplay (savedEditorStatus.urlMockupPage);
		}
	if (savedEditorStatus.text !== undefined) {
		setText (savedEditorStatus.text);
		}
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
	
	session.on ("changeFold", function (e) {
		editorChanged ();
		});
	session.selection.on ("changeSelection", function (e) {
		editorChanged ();
		});
	session.on ("changeAnnotation", function () {
		var annotations = session.getAnnotations()||[], i = len = annotations.length;
		while (i--) {
			if(/doctype first\. Expected/.test(annotations[i].text)) {
				annotations.splice(i, 1);
				}
			}
		if(len>annotations.length) {
			session.setAnnotations(annotations);
			}
		});
	theEditor.on ("change", function () {
		editorChanged ();
		});
	}
function showEditor (flDisplay) {
	var val;
	if (flDisplay) {
		val = "table-cell";
		}
	else {
		val = "none";
		}
	$("#idEditorContainer").css ("display", val);
	}
function everySecond () {
	}
function startup () {
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
	readHttpFileThruProxy (feedUrl, undefined, function (feedtext) {
		if (feedtext !== undefined) {
			startEditor (feedtext);
			showEditor (true);
			}
		});
	hitCounter ();
	}
