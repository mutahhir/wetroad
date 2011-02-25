describe("squirrel syntax creation", function(){
	var sqrl;
	beforeEach(function(){
		sqrl = new Squirrel("doc");
	});
	
	it("should create a default document", function(){
		expect(sqrl.document.firstChild.nodeName).toEqual("doc");
	});
	
	it("should be able to create chained rules", function() {
		sqrl.under("doc").accept(/\t/).as("tab");
		expect(sqrl.nodeTemplates["tab"]).toBeDefined();
		expect(sqrl.nodeTemplates["doc"].rules.length).toEqual(1);
		
	});
	
	it("should add rules to the same node", function(){
		sqrl.under("doc").accept(/\t/).as("tab");
		sqrl.under("doc").accept(/   /).as("tab");
		expect(sqrl.nodeTemplates.doc.rules.length).toEqual(2);
	});
	
	it("should be able to hangle inline nodes", function(){
		sqrl.under("doc").accept(/\t/).as("tab", false);
		// no test for now, will add one later
	});
	
	it("should be able to position edit location to start", function(){
		sqrl.positionAtDocumentStart();
		expect(sqrl.currentNode).toEqual(sqrl.document.firstChild);
		expect(sqrl.innerOffset).toEqual(0);
		expect(sqrl.offset).toEqual(0);
	});
	
	it("should be able to handle input", function(){
		sqrl.handle("\t");
		expect(sqrl.currentNode).toEqual(sqrl.document.firstChild);
	});
	
	it("should be able to consume text when no rules match", function(){
		sqrl.under("doc").accept(/\t/).as("tab", true);
		var wel = "welcome";
		sqrl.handle(wel);
		expect(sqrl.document.firstChild.firstChild.nodeType).toEqual(sqrl.document.TEXT_NODE);
		expect(sqrl.document.firstChild.firstChild.length).toEqual(wel.length);
	});
	
	it("should append to text when no rules match and text is already present", function(){
		sqrl.under("doc").accept(/\t/).as("tab", true);
		var wel = "Welcome", come=" Home";
		sqrl.handle(wel);
		sqrl.handle(come);
		expect(sqrl.document.firstChild.childNodes.length).toEqual(1);
	});
	
	it("should match text until first rule matches", function(){
		sqrl.under("doc").accept(/wor/).as("World", true);
		sqrl.handle("hello world");
		var fc = sqrl.document.firstChild;
		expect(fc.firstChild.nodeType).toEqual(sqrl.document.TEXT_NODE);
		expect(fc.firstChild.data).toEqual("hello ");
	});
	
});