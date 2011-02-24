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
			if(this.nodeTemplates.hasOwnProperty(str)) return this.nodeTemplates[str];
			var nd = new SquirrelNode(str,this);
			this.nodeTemplates[str] = nd;
			return nd;
		},
		
		initialize: function initialize() {
			this.document = document.implementation.createDocument(null,this.rootName);
			this.currentNode = this.document.firstChild;
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
		},
		
		positionAtDocumentStart: function positionAtDocumentStart(){
			this.currentNode = this.document.firstChild;
			this.innerOffset = 0;
			this.offset = 0;
		},
		
		handle: function handle(str) {
			var res = this.currentRule.handleInput(str);
			if( res == null ) {
				// 
			}
		}
};

function SquirrelNode(name, par) {
	this.parent = par;
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
		}, 
		
		/**
		 * 
		 * @param str
		 * @returns {String} return null if no match, matched string otherwise
		 */
		handleInput: function handleInput(str) {
			var rl = this.rules;
			if( rl.length == 0 ) return null;
			
			for(var i=0; i < this.rules.length; i++ ){
				if( rl[i].match.test(str) ) {
					// rule matches
					var str = rl[i].match.exec(str); 
					rl[i].onMatch(str);
					return str;
				}
			}
			return null;
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
			
			// register with main squirrel
			this.parentNode.parent.under(str);
			
			this.onMatch = function(matchStr) {
				if( returnOnCreate ) {
					this.parentNode.appendToSelf(str, matchStr);
				} else {
					this.parentNode.handOverTo(str, matchStr);
				}
			};
		}
};
