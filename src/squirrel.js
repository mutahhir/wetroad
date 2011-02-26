/**
 * 
 * Squirrel parser is basically a PEG-like parser but it does a few things
 * differently
 * 
 * Usually parsers take in a text source, and create AST (Abstract Syntax Trees)
 * from them using predefined rules. However, with squirrel, we're going to do
 * something a little different. We're going to create the rules as JavaScript
 * code, give squirrel an XML Document to play around with, and pass messages to
 * squirrel to update the document
 * 
 */

/**
 * ------------------------------------------------------------------------ A
 * Match description is returned whenever a SquirrelRule is asked to match a
 * string.
 * 
 * @param does
 *            {bool} Whether or not the rule matches
 * @param startsWhere
 *            {Number} If the rule matches, where does it start
 * @param string
 *            {String} the matched string
 * @returns MatchDescription object
 */
function MatchDescription(does, startsWhere, string, using) {
	this.isMatch = does;
	this.startsAt = startsWhere;
	this.matchedString = string;
	this.matchingRule = using;
}

MatchDescription.nullMatch = function nullMatch() {
	return new MatchDescription(false, 0, null, null);
};

MatchDescription.firstMatch = function firstMatch(arr) {
	var min = null, minI = -1 >>> 1, // the largest possible integer
	// supported
	m;
	for ( var i = 0; i < arr.length; i++) {
		m = arr[i];
		if (m.startsAt < minI) {
			min = m;
			minI = m.startsAt;
		}
		// TODO: If more than one match starts at the same index,
		// prioritize the smaller one? or larger? Need more examples
	}
	return min;
};

/**
 * --------------------------------------------------------------------------
 * Squirrel Rule is the basic unit that describes the rules that match text and
 * convert them into events.
 * 
 * Each squirrel rule can have one matching syntax and one event
 * 
 * @param rgx
 *            {RegExp} Regular expression to test for
 * @param node
 *            {SquirrelNode} SquirrelNode that owns this rule
 * @returns {SquirrelRule} a new instance of SquirrelRule
 */
function SquirrelRule(rgx, node) {
	this.parentNode = node;
	if(typeof rgx === "string") {
		this.match = new RegExp(rgx);
	} else if (rgx instanceof RegExp) {
		this.match = rgx;
	} else
		throw new TypeError("expected a regular expression literal or string as first argument");
	this.onMatch = null;
	this.isMarker = false;
}

SquirrelRule.prototype = {
	/**
	 * defines what to do when rule is encountered
	 * 
	 * @param str
	 *            {string} name of rule to be created
	 * @optional keepAtParent {bool} hand over control to the newly created node
	 *           or keep it with the parent
	 * @optional keepText {bool} keep the matched text within the element, or
	 *           discard
	 */
	as : function as(str /* , bool, bool */) {
		var returnOnCreate = arguments.length > 1 ? arguments[1] : false;
		var keepText = arguments.length > 2 ? arguments[2] : true;

		// register with main squirrel
		this.parentNode.parent.under(str);

		this.onMatch = function(matchStr) {
			if (returnOnCreate) {
				this.parentNode.appendToSelf(str, matchStr, keepText);
			} else {
				this.parentNode.handOverTo(str, matchStr, keepText);
			}
		};
	},
	
	asEndMarker: function asEndMarker() {
		this.isMarker = true;
		this.onMatch = function(matchStr) {
			this.parentNode.endEncountered();
		};
	},
	
	toBecome: function toBecome(str /* , bool */){
		var keepText = arguments.length > 1 ? arguments[1] : true;

		// register with main squirrel
		this.parentNode.parent.under(str);
		
		this.onMatch = function(matchStr) {
			this.parentNode.become(str, matchStr, keepText);
		};
	},

	/**
	 * Sees whether it can find a match within the current string
	 * 
	 * @param str
	 *            {String}
	 * @returns {MatchDescription} returns a match description
	 */
	canMatch : function canMatch(str) {
		if (str === null || str.length === 0) {
			return MatchDescription.nullMatch();
		}

		var arr = this.match.exec(str);
		if (arr == null) {
			return MatchDescription.nullMatch();
		}

		// we have a potential match
		return new MatchDescription(true, arr.index, arr[0], this);
	}
};

/**
 * --------------------------------------------------------------------------- A
 * SquirrelNode is a template that defines the behaviour and characteristics for
 * the same named XML nodes.
 * 
 * @param name
 *            {string} Represents the XML elements that will be created and
 *            managed by it
 * @param par
 *            {string} A Squirrel instance that owns it
 * @returns {SquirrelNode} a new instance of SquirrelNode
 */
function SquirrelNode(name, par) {
	this.parent = par;
	this.name = name;
	this.rules = [];
	this.defaultChildName = null;
}

SquirrelNode.prototype = {
	accept : function accept(rx) {
		var rl = new SquirrelRule(rx, this);
		this.rules.push(rl);
		return rl;
	},
	
	acceptLineEnd: function acceptLineEnd() {
		return this.accept(Squirrel.EOL_REGEX);		
	},

	appendToSelf : function appendToSelf(str, match, keepText) {
		var doc = this.parent.document, node = doc.createElement(str),
			txt = null, descendant = null;
		
		descendant = this.getDefaultChild(str, node, true);
		
		if (match && match.length > 0 && keepText) {
			txt = doc.createTextNode(match);
			node.appendChild(txt);
		}
		this.parent.appendToCurrent(node);
	},
	
	getDefaultChild: function getDefaultChild(ownerName, node, addToNode){
		var sqrl = this.parent,
			doc = sqrl.document, child = null,
			templ = sqrl.under(ownerName),
			defChild = templ.defaultChildName;
		
		if(defChild !== null ){
			child = doc.createElement(defChild);
			if( addToNode )
				node.appendChild(child);
			return this.getDefaultChild(defChild, child, true);
		}
		
		return node;
	},
	
	synchronizeDefaultChildrenFor: function synchronizeDefaultChildrenFor(name){
		var sqrl = this.parent,
		    doc = sqrl.document,
		    templ = sqrl.under(name), 
		    i = 0,
		    currNode = sqrl.currentNode;
		
		if( templ.defaultChildName === null ) return;
		
		var instances = doc.getElementsByTagName(name),
			len = instances.length;
		
		if( len == 0 ) return;
		
		for( ; i < len; i++ ){
			// check if default node is present
			var node = instances[i];
			if( node.firstChild !== null && 
					node.firstChild.nodeName === templ.defaultChildName )
				continue; // condition already satisfied
			
			var lowest = this.getDefaultChild(name, node, false);
			var highest = Utils.highestAncestor(lowest);
			
			if( node.hasChildNodes() )
				Utils.moveChildrenTo(lowest, node);
			
			node.appendChild(highest);
			
			if( currNode === node ){
				// modify the rules
				sqrl.setCurrent(lowest);
			}
		}
		
	},
	
	createDefaultChild: function createDefaultChild(name){
		var sqrl = this.parent;
		
		sqrl.under(name);	// register with parent, incase this is the
		// only instance
		this.defaultChildName = name;
		
		this.synchronizeDefaultChildrenFor(this.name);
	},
	
	removeDefaultChildren: function removeDefaultChildren(node){
		if( !Utils.isNode(node) ) return;
		
		var templ = this.parent.under(node.nodeName);
		var n = node, p = null;
		var depth = 0;
		
		while( templ.defaultChildName !== null && n.firstChild.nodeName === templ.defaultChildName ) {
				n = n.firstChild;
				templ = this.parent.under(n.nodeName);
				depth += 1;
		}
		
		if( n === node ) return;
		
		// now n holds the last default child in the chain
		var def = node.firstChild;
		Utils.moveChildrenTo(node, n);
		node.removeChild(def);		
	},
	
	handOverTo: function handOverTo(str, match, keepText){
		var doc = this.parent.document,
		    node = doc.createElement(str),
		    txt = null;
		
		node = this.getDefaultChild(str,node,true);
		
		if( match && match.length > 0 && keepText ) {
			txt = doc.createTextNode(match);
			node.appendChild(txt);
		}
		
		this.parent.moveOnTo(node);
		
	},
	
	become: function become(str, match, keepText) {
		var sqrl = this.parent,
			doc = sqrl.document,
		    node = doc.createElement(str),
		    txt = null,
		    curr = sqrl.currentNode,	// should be us
		    par = curr.parentNode,
		    newTempl = sqrl.under(str);
		
		if( par === null ) {
			// we're the topmost root, handle this
			return;
		}
		
		this.removeDefaultChildren(curr);
		
		Utils.moveChildrenTo(node,curr);
		this.parent.changeCurrentTo(node);
	},
	
	endEncountered: function endEncountered(){
		this.parent.popState();
	},

	/**
	 * 
	 * @param str
	 * @returns {String} return null if no match, matched string otherwise
	 */
	firstMatch : function firstMatch(str) {
		var rl = this.rules, len = rl.length, matches = [], ri, m;
		if (len === 0)
			return null;

		for ( var i = 0; i < len; i++) {
			ri = rl[i];
			m = ri.canMatch(str);
			if (m.isMatch === true) {
				matches.push(m);
			}
		}
		if (matches.length == 0) {
			return null;
		}

		return MatchDescription.firstMatch(matches);
	},

	execute : function execute(matcher) {
		if (matcher == null)
			return -1;

		var rl = matcher.matchingRule;
		rl.onMatch(matcher.matchedString);
		
		return rl.isMarker? 0 : matcher.matchedString.length;
	}
};

/**
 * -------------------------------------------------------------------
 * 
 * @param rootName
 * @returns {Squirrel}
 */
function Squirrel(rootName) {
	this.rootName = rootName;
	this.currentNode = null; // maintain the current input location
	this.innerOffset = 0; // maintain the offset within the current node
	this.offset = 0; // overall offset within the document

	this.nodeTemplates = {};
	this.document = null;
	this.currentTemplate = null;
	
	this.templateStack = [];

	this.buffer = null;

	this.onNewDocument = null; // event for new document
	this.onNewLine = null; // event for new line encountered
	this.onTextEntry = null; // event for text insertion

	this.initialize();
	
	// From Wikipedia and
	// http://blog.stevenlevithan.com/archives/javascript-regex-and-unicode
	Squirrel.EOL_REGEX = /\u000d\u000a|\u000d|\u000a|\u2028|\u2029|\u000c|\u0085/;
}

Squirrel.prototype = {
	under : function under(str) {
		if (this.nodeTemplates.hasOwnProperty(str)) {
			return this.nodeTemplates[str];
		}
		var nd = new SquirrelNode(str, this);
		this.nodeTemplates[str] = nd;
		return nd;
	},

	initialize : function initialize() {
		this.document = document.implementation.createDocument(null,
				this.rootName, null);
		// TODO: The above method is unavailable on IE, reference
		// http://www.webreference.com/programming/javascript/domwrapper/2.html
		// to get a cross-browser method using ActiveX
		this.currentNode = this.document.firstChild;
		this.currentTemplate = this.under(this.rootName);
		this.buffer = "";
	},

	/**
	 * appendToCurrent does not change the currentNode, it merely appends the
	 * requested node to the currentNode
	 * 
	 * @param node
	 *            a DOM node to be appended to the current node
	 */
	appendToCurrent : function appendToCurrent(node) {
		// TODO: Calculate the text content of the node, and add that
		// to offsets
		this.currentNode.appendChild(node);
	},
	
	setCurrent: function setCurrent(node /* , replaceState */){
		var replaceState = arguments.length > 1? arguments[1] : false;
		if( replaceState ) { 
			this.popState(false);
			this.pushCustomState(node, this.under(node.nodeName));
		} else {
			this.pushCurrentState();
		}
		this.currentNode = node;
		this.currentTemplate = this.under(node.nodeName);
	},
	
	moveOnTo: function moveOnTo(node) {
		var name= node.nodeName;
		this.pushCurrentState();
		this.currentNode.appendChild(node);
		this.currentNode = node;
		this.currentTemplate = this.under(name);
	},
	
	changeCurrentTo: function changeCurrentTo(node){
		var curr = this.currentNode;
		var templ = this.under(node.nodeName);
		curr.parentNode.replaceChild(node,curr);
		this.currentNode = node;
		this.currentTemplate = templ;
		templ.synchronizeDefaultChildrenFor(node.nodeName);
	},
	
	pushCurrentState: function pushCurrentState() {
		this.templateStack.push([this.currentTemplate, this.currentNode]);
	},
	
	pushCustomState: function pushCustomState(node,rule) {
		this.templateStack.push([rule, node]);
	},
	
	popState: function popState(/* setState */) {
		if( this.templateStack.length == 0 ) return;
		
		var setState = arguments.length > 0? arguments[0] : true;
		
		var popped = this.templateStack.pop();
		if( setState ) {
			this.currentTemplate = popped[0];
			this.currentNode = popped[1];
		}
	},
	
	positionAtDocumentStart : function positionAtDocumentStart() {
		this.currentNode = this.document.firstChild;
		this.innerOffset = 0;
		this.offset = 0;
	},
	
	canNibble: function canNibble(){
		return this.buffer.length > 0;
	},

	nibble : function nibble() {
		var fm = this.currentTemplate.firstMatch(this.buffer), txt = null, bufferConsumeCount = 0;

		
		
		if (fm === null) {
			this.noRulesMatched(this.buffer);
			bufferConsumeCount = this.buffer.length;
		} else if (fm.startsAt > 0) {
			txt = this.buffer.substring(0, fm.startsAt);
			this.noRulesMatched(txt);
			bufferConsumeCount = txt.length;
		} else {
			var cons = this.currentTemplate.execute(fm);
			bufferConsumeCount = cons;
		}

		this.consumeBuffer(bufferConsumeCount);
	},

	appendBuffer : function appendBuffer(str) {
		this.buffer += str;
	},

	consumeBuffer : function consumeBuffer(cnt) {
		this.buffer = this.buffer.substring(cnt);
	},

	noRulesMatched : function noRulesMatched(str) {
		if (this.currentNode.childNodes.length > 0) {
			var lst = this.currentNode.lastChild;
			if (lst.nodeType === this.document.TEXT_NODE) {
				lst.data += str;
				return;
			}
		}
		this.currentNode.appendChild(this.document.createTextNode(str));
	},
	
	ascend: function ascend(/* Number */){
		var numAscention = arguments.lenth > 0? arguments[0] : 1,
			currNode = this.currentNode,
			currentNodeDepth= Utils.getNodeDepth(currNode);
		
		if( numAscention > currentNodeDepth ) {
			return false;
		}
		
		for(var i = 0; i < numAscention; i++ ){
			currNode = currNode.parentNode;
		}
		
		this.setCurrent(currNode, false);	// we don't want to push state,
											// we'll replace it
	}
};