describe("squirrel syntax creation", function(){
	var sqrl;
	
	beforeEach(function () {
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
		sqrl.appendBuffer("\t");
		sqrl.nibble();
		expect(sqrl.currentNode).toEqual(sqrl.document.firstChild);
	});
	
	it("should be able to consume text when no rules match", function(){
		sqrl.under("doc").accept(/\t/).as("tab", true);
		var wel = "welcome";
		sqrl.appendBuffer(wel);
		sqrl.nibble();
		expect(sqrl.document.firstChild.firstChild.nodeType).toEqual(sqrl.document.TEXT_NODE);
		expect(sqrl.document.firstChild.firstChild.length).toEqual(wel.length);
		expect(sqrl.buffer.length).toEqual(0);
	});
	
	it("should append to text when no rules match and text is already present", function(){
		sqrl.under("doc").accept(/\t/).as("tab", true);
		var wel = "Welcome", come=" Home";
		sqrl.appendBuffer(wel);
		sqrl.nibble();
		sqrl.appendBuffer(come);
		sqrl.nibble();
		expect(sqrl.document.firstChild.childNodes.length).toEqual(1);
	});
	
	it("should match text until first rule matches", function(){
		sqrl.under("doc").accept(/wor/).as("World", true);
		sqrl.appendBuffer("hello world");
		sqrl.nibble();
		var fc = sqrl.document.firstChild;
		expect(fc.firstChild.nodeType).toEqual(sqrl.document.TEXT_NODE);
		expect(fc.firstChild.data).toEqual("hello ");
	});
	
	it("should be able to create nodes amongst text", function(){
		sqrl.under("doc").accept(/wor/).as("world", true);
		sqrl.appendBuffer("hello world");
		sqrl.nibble();
		var fc = sqrl.document.firstChild;
		expect(fc.firstChild.nodeType).toEqual(sqrl.document.TEXT_NODE);
		sqrl.nibble();
		expect(fc.childNodes.length).toEqual(2);
		expect(fc.childNodes[1].nodeName).toEqual("world");
		sqrl.nibble();
		expect(fc.lastChild.data).toEqual("ld");
		expect(sqrl.buffer.length).toEqual(0);
	});
	
	it("should not keep text when told not to", function(){
		sqrl.under("doc").accept(/wor/).as("world", true, false);
		sqrl.appendBuffer("hello world");
		while(sqrl.buffer.length > 0 ) {
			sqrl.nibble();
		}
		expect(sqrl.document.getElementsByTagName("world")[0].childNodes.length).toEqual(0);
	});
	
	it("should automatically keep text", function(){
		sqrl.under("doc").accept(/wor/).as("world", true);
		sqrl.appendBuffer("hello world");
		while(sqrl.buffer.length > 0 ){
			sqrl.nibble();
		}
		var ex =sqrl.document.getElementsByTagName("world")[0]; 
		expect(ex.childNodes.length).toEqual(1);
		expect(ex.firstChild.data).toEqual("wor");
	});
	
	it("should automatically hand over currentTemplate", function(){
		sqrl.under("doc").accept(/-/).as("todo",false,false);
		sqrl.under("todo").accept(/:/).asEndMarker();
		sqrl.under("doc").accept(/:/).as("project",false,false);
		sqrl.appendBuffer("-tasky:projecty");
		while(sqrl.buffer.length > 0) {
			sqrl.nibble();
		}
		var fc = sqrl.document.firstChild;
		expect(fc.childNodes.length).toEqual(2);
		expect(fc.firstChild.nodeName).toEqual("todo");
		expect(fc.lastChild.nodeName).toEqual("project");
		expect(fc.firstChild.firstChild.data).toEqual("tasky");
		expect(fc.lastChild.firstChild.data).toEqual("projecty");
	});
	
	describe("Eol Regex", function(){
		it("should recognize Windows EOL", function(){
			expect(Squirrel.EOL_REGEX.test("welcome\r\n")).toBeTruthy();
		});
		
		it("should recognize Unix EOL",function(){
			expect(Squirrel.EOL_REGEX.test("welcome\n")).toBeTruthy();
		});
		
		it("should recognize Mac EOL", function(){
			expect(Squirrel.EOL_REGEX.test("welcome\r")).toBeTruthy();
		});
		
		it("should recognize Unicode standard EOLs", function(){
			expect(Squirrel.EOL_REGEX.test("welcome\f")).toBeTruthy();
			expect(Squirrel.EOL_REGEX.test("welcome\u2028")).toBeTruthy();
			expect(Squirrel.EOL_REGEX.test("welcome\u2029")).toBeTruthy();
			expect(Squirrel.EOL_REGEX.test("welcome\u0085")).toBeTruthy();
		});
	});
	
	it("should receive endofline events", function(){
		sqrl.under("doc").acceptLineEnd().as("line",true,false);
		sqrl.appendBuffer("1\n2\r\n3\r4\f");
		while(sqrl.buffer.length > 0)
			sqrl.nibble();
		expect(sqrl.document.getElementsByTagName("line").length).toEqual(4);
	});
	
	
	
});