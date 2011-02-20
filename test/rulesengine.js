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
	
	it("should set node name with the constructor", function(){
		var en = new HBS.Doc.Model.NodeTemplate("line");
		expect(en.getName()).toEqual("line");
	});
	
	it("should accept child nodes", function() {
		var en = new HBS.Doc.Model.NodeTemplate("document");
		expect(en.allowsDescendant).toBeDefined();
		expect(en.canParent).toBeDefined();
		en.allowDescendant("line");
		expect(en.canParent("line")).toBeTruthy();
	});
	
	
	describe("Node Template Registration", function() { 
		it("should have a node registrar", function() { 
			expect(HBS.Doc.Model.NodeRegistrar).toBeDefined();
		});
	});
	
	
	
});