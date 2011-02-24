/**
 * 
 * Squirrel parser is basically a PEG-like parser but it does a few things 
 * differently
 * 
 * Usually parsers take in a text source, and create AST (Abstract Syntax Trees)
 * from them using predefined rules. However, with squirrel, we're going to do 
 * something a little different. We're going to create the rules as JavaScript
 * code, give squirrel an XML Document to play around with, and pass messages
 * to squirrel to update the document
 * 
 */

function Squirrel(rootName) {
	this.rootName = rootName;
	this.currentNode = null; // maintain the current input location
	this.innerOffset = 0;    // maintain the offset within the current node
	this.offset = 0;         // overall offset within the document
	
	this.nodeTemplates = {};
	this.document = null;
	this.currentRule = null;
	
	this.onNewDocument = null;	// event for new document
	this.onNewLine = null; // event for new line encountered
	this.onTextEntry = null; // event for text insertion
	
	this.initialize();
}

Squirrel.prototype = {
		under: function under(str) {
			if(this.rules[str]) return this.rules[str];
			var nd = new SquirrelNode(str,this);
			rules[str] = nd;
			return nd;
		},
		
		initialize: function initialize() {
			this.document = document.implementation.createDocument(null,this.rootName);
			this.currentNode = document.firstChild;
			this.currentRule = this.under(this.rootName);
		},
		
		/**
		 * appendToCurrent does not change the currentNode,
		 * it merely appends the requested node to the currentNode
		 * @param node a DOM node to be appended to the current node
		 */
		appendToCurrent: function appendToCurrent(node) {
			//TODO: Calculate the text content of the node, and add that 
			//to offsets
			this.currentNode.appendChild(node);
		}
};

function SquirrelNode(name, par) {
	this.parent = p;
	this.name = name;
	this.rules = [];
}

SquirrelNode.prototype = {
		accept: function accept(rx){
			var rl = new SquirrelRule(rx,this);
			this.rules.push(rl);
			return rl;
		},
		
		appendToSelf: function appendToSelf(str,match){
			var doc = this.parent.document;
			var node = doc.createElement(str);
			if(match && match.length > 0) {
				var txt = doc.createTextNode(match);
				node.appendChild(txt);
			}
			this.parent.appendToCurrent(node);
		}
};

function SquirrelRule(rgx, node) {
	this.parentNode = node;
	this.match = rgx;
	this.onMatch = null;
}

SquirrelRule.prototype = {
		as: function(str /*,bool */){
			var returnOnCreate = arguments.length > 1? arguments[1] : false;
			
			this.onMatch = function(matchStr) {
				if( returnOnCreate ) {
					this.parentNode.appendToSelf(str, matchStr);
				} else {
					this.parentNode.handOverTo(str, matchStr);
				}
			};
		}
};


var sqrl = new Squirrel("document"); 
/*
 * Creates XML Document
 * <document></document>
 */

sqrl.onEachNewLine("line");
/*
 * Text input: "welcome\n"
 * 
 * XML Document: <document><line></line></document>
 * Current Node: <line></line> 
 * Current offset: 0
 */

sqrl.under("line").accept(/.*/).as("content");
/* 
 * Text Input: welcome\n
 * XD: <document><line>welcome</line></document> 
 * By default, we'll not allow line-endings and beginnings to 
 * be passed on to the regex engine
 */

sqrl.under("line").acceptEach(/\t/).atLineBeginning().as("tab")

