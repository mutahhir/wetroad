/**
 * 
 */

describe("Rules Engine", function() { 
	
	it("should have the engine installed", function() { 
		expect(HBS.Doc.Model).toBeDefined();
	});
	
	it("should contain a node template", function() { 
		expect(HBS.Doc.Model.NodeTemplate).toBeDefined();
	});
	
	it("should contain a node name", function() { 
		var en = new HBS.Doc.Model.NodeTemplate();
		expect(en.Name).toBeDefined();
	});
	
	it("should set node name with the constructor", function(){
		var en = new HBS.Doc.Model.NodeTemplate("line");
		expect(en.Name).toEqual("line");
	});
	
	it("should have a children container", function(){
		var en = new HBS.Doc.Model.NodeTemplate();
		expect(en.AllowedDescendants).toBeDefined();
		expect(HBS.isArray(en.AllowedDescendants)).toEqual(true);
	});
	
	
	
	
	
});