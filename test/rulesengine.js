/*
 * 


describe("Rules Engine", function () { 
	
	afterEach(function () {
		if( HBS.Doc.Model.NodeTemplate.clearTemplateNames )
			HBS.Doc.Model.NodeTemplate.clearTemplateNames();
	});
	
	it("should have the engine installed", function () { 
		expect(HBS.Doc.Model).toBeDefined();
	});
	
	it("should contain a node template", function () { 
		expect(HBS.Doc.Model.NodeTemplate).toBeDefined();
	});
	
	it("should set node name with the constructor", function () {
		var en = new HBS.Doc.Model.NodeTemplate("line");
		expect(en.getName()).toEqual("line");
	});
	
	it("should accept child nodes", function () {
		var en = new HBS.Doc.Model.NodeTemplate("document");
		en.allowDescendant(new HBS.Doc.Model.NodeTemplate("line"));
		expect(en.canParent("line")).toBeTruthy();
		expect(en.canParent("Line")).toBeFalsy();
	});
	
	it("should not allow two node templates with the same names",function(){
		var en = new HBS.Doc.Model.NodeTemplate("document");
		expect(function () {
			var a = new HBS.Doc.Model.NodeTemplate("document");
		} ).toThrow(HBS.Doc.Model.NodeTemplate.ExistingNameError);
	});
	
	it("should allow to change the name", function(){
		var en = new HBS.Doc.Model.NodeTemplate("document");
		en.setName("a1");
		expect(en.getName()).toEqual("a1");
	});
	
	it("should not allow a node name to be changed to an already existing one", function(){
		var en = new HBS.Doc.Model.NodeTemplate("document");
		var tw = new HBS.Doc.Model.NodeTemplate();
		expect(function(){tw.setName("document");}).toThrow(HBS.Doc.Model.NodeTemplate.ExistingNameError);
	});
	
	it("createdTemplates should not contain the changed name of a template", function(){
		var en = new HBS.Doc.Model.NodeTemplate("a2");
		en.setName("a4");
		expect(HBS.Doc.Model.NodeTemplate.getCreatedTemplateNames().indexOf("a2")).toEqual(-1);
	});
	
	it("should not accept multiple node templates of the same type as descendants", function(){
		var en = new HBS.Doc.Model.NodeTemplate("a4");
		var ch1 = new HBS.Doc.Model.NodeTemplate("b4");
		var ret1 = en.allowDescendant(ch1);
		var ret2 = en.allowDescendant(ch1);
		
		expect(ret1).toBeTruthy();
		expect(ret2).toBeFalsy();
	});
	
	

	describe("Node Registrar", function() {
		var registrar;
		var model = HBS.Doc.Model;
		beforeEach(function(){
			registrar = new model.NodeRegistrar();
		});
		
		afterEach(function(){
			delete registrar;
		});
		
		it("should be able to set a root rule", function(){
			expect(registrar.setRootRule).toBeDefined();
		});
		
		it("should only accept NodeTemplate objects as root rules", function(){
			expect(function(){registrar.setRootRule("oops");}).toThrow(new TypeError("parameter has to be a NodeTemplate"));
		});
		
		it("should not have a root rule by default", function() {
			expect(registrar.hasRootRule).toBeFalsy();
		});
		
		it("should be able to correctly setup a root rule", function(){
			var rule = new model.NodeTemplate("document");
			registrar.setRootRule(rule);
			expect(registrar.rootRule).toEqual(rule);
		});
		
	});
	
	
	
}); */