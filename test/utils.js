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
		
		HBS.namespace("Documents.Model");
		expect(HBS.Documents.Model).toBeDefined();
		expect(HBS["Documents.Model"]).toEqual(undefined);
	});
	
	it("removes redundant root namespace", function() { 
		HBS.namespace("HBS.Documents.Model");
		
		expect(HBS.Documents.Model).toBeDefined();
		expect(HBS.HBS).toEqual(undefined);
	});
	
} );