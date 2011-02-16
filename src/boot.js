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
		var parts = name.split("."),parent=root;
		
		if(parts[0]==__ROOT_NAMESPACE__) {
			parts = parts.slice(1);
		}
		
		for( var i = 0; i<parts.length; i++ ) {
			var nm = parts[i];
			if( typeof parent[nm] == "undefined" ) {
				parent[nm] = {};
			}
			parent = parent[nm];
		}
		
		
	}
	
	
	root.namespace = namespace;
	
})(HBS);