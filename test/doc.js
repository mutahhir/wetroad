/**
 * 
 */

describe("Model Core Tests", function() {
	var model;
	
	beforeEach(function() {
		model = HBS.Doc.Model;
	});
	
	it("should have a model namespace", function() {
		expect(HBS).toBeDefined();
		expect(HBS.namespace).toBeDefined();
		expect(HBS.Doc).toBeDefined();
	});
	
	it("should have a documents object", function() { 
		expect(HBS.Doc.Model.Document).toBeDefined();
	});
	
	it("should be able to create a document", function(){
		var doc = new model.Document();
		
		expect(doc.toString()).toEqual("[object Object]");
	});
	
	it("should be able to create a NEW document", function() { 
		var doc = new model.Document();
		expect(doc.getText()).toEqual("");
	});

	it("should create a document from a string", function(){
		var doc = new model.Document("welcome");
		expect(doc.getText()).toEqual("welcome");
	});
	
	it("should have a lines array",function(){
		var doc = new model.Document("Welcome\nPeople");
		expect(doc.Lines).toBeDefined();
	});
});
