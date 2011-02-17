/**
 * 
 */

(function(){
	var model = HBS.namespace("Doc.Model");

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
		this.getText() { return _text; }
		this.setText(/*string*/txt){ 
			if( txt !== _text ) { 
				_text = txt;
			}
		}
		
	};
	
	(function(self){
		
		
		
	})(model.Document.prototype);
	
	
	
	
	
})();



