/**
 * 
 */

var re = HBS.namespace("Doc.Model");

(function(ns){
	
	re.NodeTemplate = function() {
		if( arguments.length > 0 && typeof arguments[0] === "string" ) {
			this.Name = arguments[0]
		}
				
	};
	
	(function(proto){
		
		proto.Name = "";
		proto.AllowedDescendants = [];
		
	})(re.NodeTemplate.prototype);
	
	
})(re);