/**
 * 
 */

var re = HBS.namespace("Doc.Model");

(function(ns){
	
	/**
	 * Node Template class
	 */
	
	re.NodeTemplate = (function(){
		// Private Static vars
		var createdTemplates = [];
		
		return function(/*name*/) {
			// Private Vars
			var name = "";
			
			// accessor functions
			this.getName = function() { return name; };
			this.setName = function(n){ 
				if( createdTemplates.indexOf(n) >= 0 )
					throw "cannot set name to an already existing template name";
				if(name != n && (n != null && n.length > 0) ) {
					if( name != null && name.length > 0 ) {
						var ind = createdTemplates.indexOf(name);
						createdTemplates.splice(ind, 1);
					}
					name = n;
					createdTemplates.push(name);
				}
			};
			
			re.NodeTemplate.getCreatedTemplateNames = function(){ return createdTemplates.slice(); };
			re.NodeTemplate.clearAllCreatedTemplateNames = function() { createdTemplates = []; };
			
			if( arguments.length > 0 && typeof arguments[0] === "string" ) {
				name = arguments[0];
				if( createdTemplates.indexOf(name) >= 0 ) {
					throw "a template with the same name already exists"; 
				}
				else{
					createdTemplates.push(name);
				}
			}
		};
	})();
	
	(function(){
		
		var _allows = [];
		
		/**
		 * 
		 */
		this.allowDescendant = function(/*string*/str){
			_allows.push(str);
		};
		
		
		this.canParent = function(/*string*/str) {
			if( _allows.indexOf(str) >= 0 ){
				return true;
			}
			return false;
		};

	}).call(re.NodeTemplate.prototype);
	
	
	
	

	/**
	 * Node Registrar Class
	 */
	re.NodeRegistrar = function() { 
		
	};
	
	(function(){
		
		this.rootRule = null;
		
		this.setRootRule= function(/*NodeTemplate*/ rule ) {
			if( !(rule instanceof re.NodeTemplate) )
				throw new TypeError("parameter has to be a NodeTemplate");
			
			this.rootRule = rule;
		};
		
		
	}).call(re.NodeRegistrar.prototype);
	
	
})(re);