/**
 * 
 */

var re = HBS.namespace("Doc.Model");

(function(ns) {
	
	/**
	 * Node Template class
	 */
	
	re.NodeTemplate = (function(){
		// Private Static vars
		var createdTemplates = [],
		    ExistingNameError = "cannot set name to an already existing template name",
		    MustHaveNameError = "template names must have valid names"; 
		
		return (function(/*name*/) {
			// Private Vars
			var name = "";
			
			// accessor functions
			this.getName = function() { return name; };
			this.setName = function(n){ 
				if( createdTemplates.indexOf(n) >= 0 ) {
					throw ExistingNameError;
				}
				if(name !== n && this.isValidName(n) ) {
					if( this.isValidName(name) ) {
						var ind = createdTemplates.indexOf(name);
						createdTemplates.splice(ind, 1);
					}
					name = n;
					createdTemplates.push(name);
				}
			};
			this.isValidName = function(str) {
				return str !== null && str.length > 0;
			};
			
			re.NodeTemplate.getCreatedTemplateNames = function(){ return createdTemplates.slice(); };
			re.NodeTemplate.clearTemplateNames = function () { createdTemplates = []; };
			re.NodeTemplate.ExistingNameError = ExistingNameError;
			re.NodeTemplate.MustHaveNameError = MustHaveNameError;
			
			if( arguments.length > 0 && typeof arguments[0] === "string" ) {
				name = arguments[0];
				if( createdTemplates.indexOf(name) >= 0 ) {
					throw ExistingNameError; 
				}
				else{
					createdTemplates.push(name);
				}
			}
		});
	})();
	
	(function(){
		
		var _allows = {};
		
		/**
		 * 
		 */
		this.allowDescendant = function(/*NodeTemplate*/nt){
			var nm = nt.getName();
			
			if(this.canParent(nm)) {
				return false;
			}
			
			if( !nt.isValidName(nm) ){
				throw re.NodeTemplate.MustHaveNameError;
			}
			
			_allows[nm] = nt;
			return true;
		};
		
		
		this.canParent = function(/*string*/str) {
			for( var itm in _allows ) { 
				if( _allows[itm].getName() === str ) {
					return true;
				}
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
			if( !(rule instanceof re.NodeTemplate) ) {
				throw new TypeError("parameter has to be a NodeTemplate");
			}
			
			this.rootRule = rule;
		};
		
		
	}).call(re.NodeRegistrar.prototype);
	
	
})(re);