
function UnusedMatch( sqrl, rule, index, matchStr ) {
	this.rule = rule;
	this.index = index;
	this.matchStr = matchStr;
	sqrl.onAfterConsume(this, this.onConsumeText);
	this.isValid = true;
}

UnusedMatch.prototype = {
	onConsumeText: function(sqrl, amount) {
		if( amount > this.index ) {
			this.isValid = false;
			return false;
		}
		
		this.index -= amount;
		return true;
	},
	
	createMatchDescription: function() {
		if( !this.isValid ) return null;
		return new MatchDescription(this.isValid, this.index,
					    this.matchStr, this.rule );
	}
};

function UnMatch( sqrl, rule ) {
	this.rule = rule;
	sqrl.onBeforeAppend(this, this.onAppendText);
	this.isValid = false;
}

UnMatch.prototype = {
	onAppendText: function onAppendText(sqrl, str) {
		var arr = this.rule.match.exec(str);
		if( arr !== null ) {
			this.isValid = true;
			return false;
		}
		return true;
	},
	
	createMatchDescription: function() {
		if( !this.isValid ) return null;
		return new MatchDescription(this.isValid, this.index,
					    this.matchStr, this.rule);
	}
};

/**
 * ------------------------------------------------------------------------
 * A Match description is returned whenever a SquirrelRule is asked to match a
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

MatchDescription.nullMatch = (function(){
		var nuller = new MatchDescription(false, 0, null, null);
		return function() {
			return nuller; 
		};
})();

MatchDescription.firstMatch = function firstMatch(arr) {
	var min = null, minI = -1 >>> 1, // the largest possible integer supported
	    m;
	    
	if( arr.length === 1 ) return arr[0];
	
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
	this.consumes = arguments.length > 2? arguments[2] : true;
	this.unused = null;
	this.unmatched = null;
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
	as : function as(str /* , bool, bool */) {	// acts as asChild
		var returnOnCreate = arguments.length > 1 ? arguments[1] : false;
		var keepText = arguments.length > 2 ? arguments[2] : true;

		// register with main squirrel
		this.parentNode.sqrl.under(str);

		this.onMatch = function(matchStr) {
			if (returnOnCreate) {
				this.parentNode.appendToSelf(str, matchStr, keepText);
			} else {
				this.parentNode.handOverTo(str, matchStr, keepText);
			}
		};
		
		return this;
	},
	
	asChild: function asChild( str /*, isInline, keepText */) {
		this.as.apply(this, arguments);
	},
	
	asInline: function asInline(str /*, keepText*/){
		var ap = Array.prototype;
		ap.splice.call(arguments, 1, 0, true);
		this.asChild.apply(this, ap.slice.apply(arguments,[]));
	},
	
	asSibling: function asSibling( str /*, bool*/){
			var keepText = arguments.length > 1? arguments[1]: true;
			this.onMatch = function(matchStr) {
				this.parentNode.handOverToSibling(str, matchStr, keepText);
			};
			return this;
	},
	   
	toAscend: function toAscend(/*keepText*/){
		var keepText = arguments.length > 0? arguments[0] : true;
		this.onMatch = function( matchStr ) {
			if( keepText ) this.parentNode.appendText(matchStr);
			this.parentNode.sqrl.ascend();	
		};
	},

	
	asEndMarker: function asEndMarker() {
		this.isMarker = true;
		this.onMatch = function(matchStr) {
			this.parentNode.endEncountered();
		};
	},

	toBecome: function toBecome(str /*, keepText*/){
		var keepText = arguments.length > 1 ? arguments[1] : true;

		// register with main squirrel
		this.parentNode.sqrl.under(str);
		
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
		if( this.unmatched && !this.unmatched.isValid ) {
			return MatchDescription.nullMatch();
		}
		if( this.unused && this.unused.isValid )
			return this.unused.createMatchDescription();
		
		if (str === null || str.length === 0) {
			return MatchDescription.nullMatch();
		}
		
		var arr = this.match.exec(str);
		
		if (arr == null) {
			this.markAsUnmatched();
			return MatchDescription.nullMatch();
		}

		// we have a potential match
		return new MatchDescription(true, arr.index, arr[0], this);
	},
	
	markAsUnused: function markAsUnused(fm) {
		if( !this.hasUnused() )
			this.unused = new UnusedMatch(this.parentNode.sqrl,
					      this, fm.startsAt, fm.matchedString);
	},
	
	markAsUnmatched: function markAsUnmatched() {
		if( !this.hasUnmatched() )
			this.unmatched = new UnMatch(this.parentNode.sqrl,
						       this);
	},
	
	hasUnused: function hasUnused() {
		if( this.unused !== null ) {
			return this.unused.isValid;
		}
		return false;
	},
	
	hasUnmatched: function hasUnmatched() {
		if( this.unmatched !== null ) {
			return !this.unmatched.isValid;
		}
		return false;
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
	this.sqrl = par;
	this.name = name;
	this.rules = [];
	this.defaultRule = null;
	this.defaultChildName = null;
	this.afterEndRule = null;
}

SquirrelNode.prototype = {
	accept : function accept(rx /*, andConsume*/) {
		var consumes = arguments.length > 1? arguments[1] : true;
		var rl = new SquirrelRule(rx, this, consumes);
		this.rules.push(rl);
		return rl;
	},
	
	acceptLineEnd: function acceptLineEnd(/* andConsume */) {
		if( arguments.length > 0 )
			return this.accept(Squirrel.EOL_REGEX, arguments[0]);
		return this.accept(Squirrel.EOL_REGEX);		
	},
	
	/**
	 * A very powerful clause that will match anything if all other matches 
	 * match later than it.
	 * @returns
	 */
	acceptDefault: function acceptDefault(/* andConsume */) {
		var consumes = arguments.length > 1? arguments[1] : true;
		var rl = new SquirrelRule(/./, this, consumes);
		this.defaultRule = rl;
		return rl;
	},

	appendToSelf : function appendToSelf(str, match, keepText) {
		var doc = this.sqrl.document, node = doc.createElement(str),
			txt = null, descendant = null;
		
		descendant = this.getDefaultChild(str, node, true);
		
		if (match && match.length > 0 && keepText) {
			txt = doc.createTextNode(match);
			node.appendChild(txt);
		}
		this.sqrl.appendToCurrent(node);
	},
	
	appendText: function appendText(text /* appendToCurent */) {
		var sqrl = this.sqrl, 
			doc = sqrl.document,
			node = sqrl.currentNode,
			child = node.hasChildNodes()? node.lastChild : null,
			appendToCurrent = arguments.length > 1? arguments[1] : true;
		
		if( appendToCurrent && child.nodeType == doc.TEXT_NODE) {
			child.data += text;
		} else {
			txt = doc.createTextNode(text);
			node.appendChild(txt);
		}
	},
	
	getDefaultChild: function getDefaultChild(ownerName, node, addToNode){
		var sqrl = this.sqrl,
			doc = sqrl.document, child = null,
			templ = sqrl.nodeTemplates[ownerName],
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
		var sqrl = this.sqrl,
		    doc = sqrl.document,
		    templ = sqrl.nodeTemplates[name], 
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
				sqrl.setState(lowest);
			}
		}
		
	},
	
	createDefaultChild: function createDefaultChild(name){
		var sqrl = this.sqrl;
		
		sqrl.under(name);	// register with parent, incase this is the
		// only instance
		this.defaultChildName = name;
		
		this.synchronizeDefaultChildrenFor(this.name);
	},
	
	removeDefaultChildren: function removeDefaultChildren(node){
		if( !Utils.isNode(node) ) return;
		
		var templ = this.sqrl.nodeTemplates[node.nodeName];
		var n = node, p = null;
		var depth = 0;
		
		while( templ.defaultChildName !== null && n.firstChild.nodeName === templ.defaultChildName ) {
				n = n.firstChild;
				templ = this.sqrl.nodeTemplates[n.nodeName];
				depth += 1;
		}
		
		if( n === node ) return;
		
		// now n holds the last default child in the chain
		var def = node.firstChild;
		Utils.moveChildrenTo(node, n);
		node.removeChild(def);		
	},
	
	handOverTo: function handOverTo(str, match, keepText){
		var doc = this.sqrl.document,
		    node = doc.createElement(str),
		    txt = null;
		
		node = this.getDefaultChild(str,node,true);
		
		if( match && match.length > 0 && keepText ) {
			txt = doc.createTextNode(match);
			node.appendChild(txt);
		}
		
		this.sqrl.moveToChild(node);
	},
	
	handOverToSibling: function handOverToSibling( str, match, keepText ){
		var sqrl = this.sqrl, 
			doc = sqrl.document,
			node = doc.createElement(str),
			txt = null;
		
		if( sqrl.currentNode.parentNode === null ) {
			throw "cannot have multiple root nodes";
		}
		
		node = this.getDefaultChild(str, node, true);
		
		if( match && match.length > 0 && keepText ){
			txt = doc.createTextNode(match);
			node.appendChild(txt);
		}
		
		this.sqrl.moveToSibling(node);
		
	},
	
	become: function become(str, match, keepText) {
		var sqrl = this.sqrl,
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
		this.sqrl.changeCurrentTo(node);
	},
	
	endEncountered: function endEncountered(){
		// this isn't really reliable because of default children
		// this.sqrl.popState();
		this.sqrl.ascend();
	},

	/**
	 * 
	 * @param str
	 * @returns {String} return null if no match, matched string otherwise
	 */
	firstMatch : function firstMatch(str) {
		var rl = this.rules,
		    len = rl.length, matches = [], ri, m,
		    hasDefault = this.defaultRule !== null;
		
		if (len === 0) {
			return hasDefault? this.defaultRule.canMatch(str) : null;
		}
				
		if( len === 1 && !hasDefault ) {
			return rl[0].canMatch(str);
		}
		
		

		for ( var i = 0; i < len; i++) {
			ri = rl[i];
			m = ri.canMatch(str);
			if (m.isMatch === true) {
				matches.push(m);
			}
		}
		
		if (matches.length == 0 && !hasDefault) {
			return null;
		}

		var fm = MatchDescription.firstMatch(matches);
		
		for( var k = 0; k < matches.length; k++ ) {
			var mk = matches[k];
			if(mk !== fm) {
				mk.matchingRule.markAsUnused(mk);
			}
		}
		
		var findex = fm.startsAt;

		if( hasDefault ) {
			m = this.defaultRule.canMatch(str);
			if( m.isMatch === true && m.startsAt < findex ) {
				fm.matchingRule.markAsUnused(fm);
				return m;
			}
		}
		
		return fm;
	},
	
	
	
	execute : function execute(matcher) {
		if (matcher == null)
			return -1;

		var rl = matcher.matchingRule;
		var con = rl.consumes;
		rl.onMatch(matcher.matchedString);
		
		if( !rl.consumes || rl.isMarker )
			return 0;
		return matcher.matchedString.length;
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
	
	this.buffer = null;

	this.onNewDocument = null; // event for new document
	this.onNewLine = null; // event for new line encountered
	this.onTextEntry = null; // event for text insertion
	
	this.consumptionObservers = null;
	this.appendObservers = null;

	this.initialize();
	
	// From Wikipedia and
	// http://blog.stevenlevithan.com/archives/javascript-regex-and-unicode
	Squirrel.EOL_REGEX = /\u000d(?:\u000a)?|\u000a|\u2028|\u2029|\u000c|\u0085/;
	
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
		this.consumptionObservers = [];
		this.appendObservers = [];
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
	
	setState: function setState(node /* , replaceState */){
		this.currentNode = node;
		this.currentTemplate = this.nodeTemplates[node.nodeName];
	},
	
	moveToChild: function moveToChild(node) {
		var name= node.nodeName;
		this.currentNode.appendChild(node);
		this.currentNode = node;
		this.currentTemplate = this.nodeTemplates[name];
	},
	
	moveToSibling: function moveToSibling(node) {
		var name = node.nodeName, curNode = this.currentNode;
		if( curNode.parentNode === null  ) {
			// we cant have a sibling for root
	                throw "Cannot have a sibling node for root";
		}
	        curNode.parentNode.appendChild(node);
		this.setState(node);
	},
	
	morphTo: function morphTo(node) {
		var name = node.nodeName, curNode = this.currentNode;
		if( curNode.parentNode === null ) {
			throw "Cannot morph the root node";
		}
		curNode.parentNode.replaceChild(node, curNode);
		this.setState(node);	
	},
	
	changeCurrentTo: function changeCurrentTo(node){
		var curr = this.currentNode;
		var templ = this.nodeTemplates[node.nodeName];
		curr.parentNode.replaceChild(node,curr);
		this.currentNode = node;
		this.currentTemplate = templ;
		templ.synchronizeDefaultChildrenFor(node.nodeName);
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
		var fm = this.currentTemplate.firstMatch(this.buffer),
		    txt = null, bufferConsumeCount = 0;

		if (fm === null || fm.isMatch === false ) {
			this.noRulesMatched(this.buffer);
			bufferConsumeCount = this.buffer.length;
		} else {
			if (fm.startsAt > 0) {
				txt = this.buffer.substring(0, fm.startsAt);
				this.noRulesMatched(txt);
				bufferConsumeCount = txt.length;
			}
			bufferConsumeCount += this.currentTemplate.execute(fm);
		}

		this.consumeBuffer(bufferConsumeCount);
	},

	appendBuffer : function appendBuffer(str) {
		this.invokeObserversFrom(this.appendObservers, str);
		this.buffer += str;
	},

	consumeBuffer : function consumeBuffer(cnt) {
		this.buffer = this.buffer.substring(cnt);
		this.invokeObserversFrom(this.consumptionObservers, cnt);
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
		
		this.setState(currNode);
		return true;
	},
	
	invokeObserversFrom: function invokeObserversFrom(arr, arg) {
		
		var marks = [];
		for( var i = 0; i < arr.length; i++ ){
			var j = arr[i];
			if( j["fcn"].call( j["object"], this, arg) === false ) {
				marks.push(i);
			}
		}
		marks.reverse();
		for( i = 0; i < marks.length; i++ ) {
			arr.splice(marks[i],1);
		}
	},
	
	onBeforeAppend: function onAfterAppend( obj, fcn ) {
		this.appendObservers.push({"object":obj, "fcn":fcn});
	},
	
	onAfterConsume: function onAfterConsume( obj, fcn ) {
		this.consumptionObservers.push(
			{"object": obj, "fcn": fcn}
		);
	},
	
	removeConsumptionObserver: function removeConsumptionObserver( obj, fcn ) {
		for( var i = 0; i < this.consumptionObservers.length; i++ ){
			var j = this.consumptionObservers[i]["object"].rule;
			if( j.match === obj.rule.match && j.parentNode.name === obj.rule.parentNode.name ) {
				this.consumptionObservers.splice(i,1);
				return;
			}
		}
	}
};
