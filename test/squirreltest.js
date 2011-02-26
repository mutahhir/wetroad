describe("squirrel", function(){
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
	
	it("should be able to handle inline nodes", function(){
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
	
	it("can create a default child and hand over control to it", function(){
		sqrl.under("doc").accept(/lc/).as("world", true);
		sqrl.under("line").createDefaultChild("innerline");
		sqrl.appendBuffer("welcome");
		while(sqrl.buffer.length > 0 ){
			sqrl.nibble();
		}
		sqrl.under("doc").createDefaultChild("line");
		expect(sqrl.document.firstChild.childNodes.length).toEqual(1);
		expect(sqrl.document.firstChild.firstChild.nodeName).toEqual("line");
		expect(sqrl.document.firstChild.firstChild.firstChild.nodeName).toEqual("innerline");
		expect(sqrl.document.firstChild.firstChild.firstChild.childNodes[0].data).toEqual("we");
		expect(sqrl.document.firstChild.firstChild.firstChild.childNodes[1].tagName).toEqual("world");
		expect(sqrl.document.firstChild.firstChild.firstChild.childNodes[2].data).toEqual("ome");
	});
	
	it("should accept strings as well as regexes in accept",function() {
		sqrl.under("doc").accept("-").as("temp");
		sqrl.appendBuffer("- wel");
		while(sqrl.buffer.length > 0){
			sqrl.nibble();
		}
		expect(sqrl.document.getElementsByTagName("temp").length).toEqual(1);
	});
	
	it("can become a different tag", function(){
		sqrl.under("doc").createDefaultChild("note");
		sqrl.under("note").accept("-").toBecome("task");
		sqrl.under("task").accept(":").toBecome("project");
		sqrl.appendBuffer("- important test:");
		while(sqrl.buffer.length > 0 )
			sqrl.nibble();
		expect(sqrl.document.firstChild.firstChild.nodeName).toEqual("project");
		expect(sqrl.document.firstChild.childNodes.length).toEqual(1);
		expect(sqrl.document.getElementsByTagName("project")[0].childNodes.length).toEqual(1);
		expect(sqrl.document.getElementsByTagName("project")[0].childNodes[0].data).toEqual(" important test");
	});
	
	it("should allow moving up a node", function(){
		sqrl.under("note").createDefaultChild("content");
		sqrl.under("doc").createDefaultChild("note");
		expect(sqrl.currentNode.nodeName).toEqual("content");
		expect(sqrl.currentTemplate.name).toEqual("content");
		sqrl.ascend();
		expect(sqrl.currentNode.nodeName).toEqual("note");
		expect(sqrl.currentTemplate.name).toEqual("note");
	});
	
	it("should deal with defaultChildren properly when becoming different tags",function(){
		sqrl.under("doc").createDefaultChild("note");
		sqrl.under("note").createDefaultChild("content");
		sqrl.ascend();
		sqrl.under("note").accept("-").toBecome("task");
		sqrl.appendBuffer("- important test");
		while(sqrl.canNibble())
			sqrl.nibble();
		expect(sqrl.document.firstChild.firstChild.nodeName).toEqual("task");
		expect(sqrl.document.firstChild.firstChild.firstChild.data).toEqual(" important test");
	});
	
	it("should work in notepad.js syntax", function(){
		
	});
	
});
