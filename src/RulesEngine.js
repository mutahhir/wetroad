/**
 * 
 */

var re = HBS.namespace("Doc.Model");

(function(ns){
	
	re.NodeTemplate = function() {
		// Private Vars
		var name = "";
		
		// accessor functions
		this.getName = function() { return name; };
		this.setName = function(n){ if(name != n) name = n; }
		
		if( arguments.length > 0 && typeof arguments[0] === "string" ) {
			name = arguments[0]
		}
				
	};
	
	(function(proto){
		
		proto.AllowedDescendants = [];
		
		/**
		 * 
		 */
		proto.allowDescendant = function(/*string*/str){
						
		}
		
		
		proto.canParent = function(/*string*/str) {
			
		}
		
	})(re.NodeTemplate.prototype);
	
	
	
	re.NodeRegistrar = function() { 
		
	};
	
	(function(proto){
		
		
	})(re.NodeRegistrar.prototype);
	
	
})(re);