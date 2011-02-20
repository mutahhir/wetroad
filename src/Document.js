/**
 * 
 */

HBS.namespace("Doc.Model");

(function(model){
	/**
	 * HBS.Doc.Model.Document object constructor
	 * 
	 * 
	 */
	model.Document = function() { 
		var _text = "";
		
		if( arguments.length == 1 ) {
			_text = arguments[0];
		}
		this.getText = function() { 
			return _text; 
		};
		
		this.setText = function(/*string*/txt){ 
			if( txt !== _text ) { 
				_text = txt;
			}
		};
		
	};
	
//	(function(self){
//		
//		
//		
//	}).call(model.Document.prototype);
	
	
	
	
	
})(HBS.Doc.Model);



