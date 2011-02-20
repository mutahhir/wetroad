/**
 * 
 */

var __ROOT_NAMESPACE__ = "HBS";
var HBS = HBS || {};

(function(root) {
	
	/**
	 * Borrowed heavily from: 
	 * Javascript patterns O'rielly by Stoyan Stefanov
	 */
	function namespace(/*string*/name) {
		var parts = name.split("."),
			parent=root;
		
		if(parts[0] === __ROOT_NAMESPACE__) {
			parts = parts.slice(1);
		}
		
		for( var i = 0; i<parts.length; i++ ) {
			var nm = parts[i];
			if( typeof parent[nm] === "undefined" ) {
				parent[nm] = {};
			}
			parent = parent[nm];
		}
		
		return parent;
	}
	
	/**
	 * A simple hack to test whether the object is an array
	 * 
	 * @param obj {Object} to be tested if its an array or not
	 * @returns true if obj refers to an array, false otherwise
	 */
	function isArray(/*Array?*/obj) { 
		return Object.prototype.toString.call(obj) === "[object Array]";
	}
	
	
	
	
	root.namespace = namespace;
	root.isArray = Array.isArray || isArray;
	
})(HBS);