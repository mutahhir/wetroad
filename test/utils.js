/**
 * 
 */

describe("basic functionality", function() { 
	
	beforeEach(function() { 
		
		if( HBS.hasOwnProperty("Documents") ) {
			delete HBS.Documents;
		}
		if( HBS.hasOwnProperty("HBS") ){
			delete HBS.HBS;
		}
	});
	
	it("should have an HBS namespace", function() { 
		expect(HBS).toBeDefined();
	});
	
	it("can create namespace", function(){ 
		expect(HBS.namespace).toBeDefined();
	});
	
	it("creates a namespace", function() { 
		HBS.namespace("Documents");
		expect(HBS.Documents).toBeDefined();
		
		var ns = HBS.namespace("Documents.Model");
		expect(HBS.Documents.Model).toBeDefined();
		expect(HBS["Documents.Model"]).toEqual(undefined);
		expect(ns).toBe(HBS.Documents.Model);
	});
	
	it("removes redundant root namespace", function() { 
		HBS.namespace("HBS.Documents.Model");
		
		expect(HBS.Documents.Model).toBeDefined();
		expect(HBS.HBS).toEqual(undefined);
	});
	
	it("does not overwrite a namespace", function() { 
		var model = HBS.namespace("HBS.Documents.Model");
		model.ToTest = "should be present";
		
		var check = HBS.namespace("Documents.Model");
		expect(check.ToTest).toBeDefined();
	});
	
	it("creates nested namespaces", function(){
		var mdl = HBS.namespace("HBS.Documents.Model");
		expect(HBS).toBeDefined();
		expect(HBS.Documents).toBeDefined();
		expect(HBS["Documents"]["Model"]).toBeDefined();
	});
	
} );