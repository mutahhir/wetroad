/**
 * 
 */

var __ROOT_NAMESPACE__ = "HBS";
var HBS = HBS || {};

(function (root) {
	
	/**
	 * Borrowed heavily from: 
	 * Javascript patterns O'rielly by Stoyan Stefanov
	 */
	function namespace(/*string*/name) {
		var parts = name.split("."),
			parent = root;
		
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
	 * 
	 * From Mozilla MDN
	 */
	function isArray(/*Array?*/obj) { 
		return Object.prototype.toString.call(obj) === "[object Array]";
	}
	
	
	/** 
	 * Array indexOf Extension
	 * 
	 * Courtesy: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
	 */
	function indexOf(searchElement /*, fromIndex */) {
		"use strict";
		
		if( this == void 0 || this == null )
			throw new TypeError();
		
		var len = t.length >>> 0;
		if( len === 0 )
			return -1;
		
		var n = 0;
		if( arguments.length > 0 ) { 
			n = Number(arguments[1]);
			if( n !== n ) // shortcut for NaN verification
				n = 0;
			else if ( n !== 0 && n !== (1/0) && n !== -(1/0)) {
				n = (n > 0 || -1) * Math.floor(Math.abs(n));
			}
		}
		
		if( n >= len )
			return -1;
		
		var k = n >= 0? n : Math.max(len-Math.abs(n),0);
		
		for(; k < len; k++ ) {
			if( k in t && t[k] === searchElement )
				return k;
		}
		return -1;
	}
	
	root.namespace = namespace;
	root.isArray = Array.isArray || isArray;
	
	
	/*
	 * Register Extensions
	 */
	if( !Array.prototype.indexOf ) {
		Array.prototype.indexOf = indexOf;
	}
	
})(HBS);