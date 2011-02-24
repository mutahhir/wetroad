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
	
	it("shoudl be able to handle input and create nodes", function(){
		sqrl.under("doc").accept(/\t/).as("tab",true);
		sqrl.handle("\t");
		expect(sqrl.currentNode.nodeName).toEqual("doc");
		expect(sqrl.currentNode.childNodes.length).toEqual(1);
		expect(sqrl.currentNode.lastChild.nodeName).toEqual("tab");
	});
	
	it("should convert to text whatever doesn't match", function(){
		sqrl.under("doc").accept(/\t/).as("tab",true);
		sqrl.handle("not good");
		expect(sqrl.currentNode.childNodes.length).toEqual(1);
		expect(sqrl.currentNode.childNodes.nodeType).toEqual("#Text");
	});
	
});