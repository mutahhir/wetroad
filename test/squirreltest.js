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
		expect(fc.childNodes.length).toEqual(3);
		expect(fc.childNodes[1].nodeName).toEqual("world");
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
		sqrl.under("doc").createDefaultChild("line");
		sqrl.under("line").accept(/\t/).as("tab", true, false);
		sqrl.under("line").acceptDefault().as("content");
		sqrl.under("content").acceptLineEnd(false).toAscend(false);
		sqrl.under("line").acceptLineEnd().asSibling("line", false, false);
		sqrl.appendBuffer("Welcome\n\tOne Tab\n\t\tTwo Tabs\n\t\t\tThree\tTabs");
		while(sqrl.canNibble()) {
			sqrl.nibble();
		}
		console.log(sqrl.document);
		var fc = sqrl.document.firstChild;
		expect(fc.childNodes.length).toEqual(4);
		expect(sqrl.document.getElementsByTagName("line").length).toEqual(4);
		expect(fc.lastChild.childNodes.length).toEqual(4);
		expect(fc.lastChild.childNodes[0].nodeName).toEqual("tab");
		expect(fc.lastChild.childNodes[1].nodeName).toEqual("tab");
		expect(fc.lastChild.childNodes[2].nodeName).toEqual("tab");
		expect(fc.lastChild.childNodes[3].nodeName).toEqual("content");
		expect(fc.lastChild.lastChild.firstChild.data).toEqual("Three\tTabs");
	});
	
	it("should accept Jesse's strong test case 1", function(){
		/*
		 * this line has **strong** text
		 * ->
		 * <doc> 
		 *    <line>this line has <strong>strong</strong> text</line>
		 * </doc>
		 */ 
		sqrl.under("doc").createDefaultChild("line");
		sqrl.under("line").accept(/\*\*/).as("strong", false, false);
		sqrl.under("strong").accept(/\*\*/).toAscend(false);
		sqrl.appendBuffer("this line has **strong** text");
		while(sqrl.canNibble()){
			sqrl.nibble();
		}
		expect(sqrl.document.getElementsByTagName("line")[0].childNodes.length).toEqual(3);
		expect(sqrl.document.firstChild.firstChild.childNodes[1].nodeName).toEqual("strong");
		expect(sqrl.document.firstChild.firstChild.childNodes[1].firstChild.data).toEqual("strong");
		expect(sqrl.document.firstChild.firstChild.lastChild.nodeType).toEqual(sqrl.document.TEXT_NODE);
	});
	
	it("should accept Jesse's strong test case 2", function(){
		/*
		 * this line has **strong** text
		 * ->
		 * <doc>
		 *     <line>this line has <strong>**strong**</strong> text</line>
		 * </doc>
		 */
		sqrl.under("doc").createDefaultChild("line");
		sqrl.under("line").accept(/\*\*/).as("strong", false, true);
		sqrl.under("strong").accept(/\*\*/).toAscend(true);
		sqrl.appendBuffer("this line has **strong** text");
		while(sqrl.canNibble()){
			sqrl.nibble();
		}
		expect(sqrl.document.getElementsByTagName("line")[0].childNodes.length).toEqual(3);
		expect(sqrl.document.firstChild.firstChild.childNodes[1].nodeName).toEqual("strong");
		expect(sqrl.document.firstChild.firstChild.childNodes[1].firstChild.data).toEqual("**strong**");
		expect(sqrl.document.firstChild.firstChild.lastChild.nodeType).toEqual(sqrl.document.TEXT_NODE);
	});
	
	it("should accept Jesse's block test case", function(){
		/*
		 * Welcome
		 *     One tab
		 * ->
		 * <doc>
		 *     <block>
		 *             <line>Welcome</line>
		 *             <block>
		 *                    <line>One tab</line>
		 *             </block>
		 *     </block>
		 * </doc>
		 */
		sqrl.under("doc").createDefaultChild("block");
		sqrl.under("block").createDefaultChild("line");
		sqrl.under("line").acceptLineEnd(false).toAscend(false);
		sqrl.under("block").acceptLineEnd().as("line", false, false);
		sqrl.under("line").accept(/\t/).toBecome("block");
		sqrl.appendBuffer("Welcome\n\tOne Tab");
		while(sqrl.canNibble()){
			sqrl.nibble();
		}
		var fc = sqrl.document.firstChild;
		expect(fc.firstChild.nodeName).toEqual("block");
		expect(fc.firstChild.firstChild.nodeName).toEqual("line");
		expect(fc.firstChild.firstChild.firstChild.nodeType).
			toEqual(sqrl.document.TEXT_NODE);
		expect(fc.firstChild.childNodes[1].nodeName).toEqual("block");
		expect(fc.firstChild.childNodes[1].firstChild.nodeName).toEqual("line");
		
	});
	
	it("should be able to write asInline", function () {
		sqrl.under("doc").createDefaultChild("line");
		sqrl.under("line").accept(/\t/).asInline("tab", false);
		sqrl.under("line").acceptDefault().as("content");
		sqrl.under("content").acceptLineEnd(false).toAscend(false);
		sqrl.under("line").acceptLineEnd().asSibling("line", false);
		sqrl.appendBuffer("Welcome\n\tOne Tab\n\t\tTwo Tabs\n\t\t\tThree\tTabs");
		while(sqrl.canNibble()) {
			sqrl.nibble();
		}
		console.log(sqrl.document);
		var fc = sqrl.document.firstChild;
		expect(fc.childNodes.length).toEqual(4);
		expect(sqrl.document.getElementsByTagName("line").length).toEqual(4);
		expect(fc.lastChild.childNodes.length).toEqual(4);
		expect(fc.lastChild.childNodes[0].nodeName).toEqual("tab");
		expect(fc.lastChild.childNodes[1].nodeName).toEqual("tab");
		expect(fc.lastChild.childNodes[2].nodeName).toEqual("tab");
		expect(fc.lastChild.childNodes[3].nodeName).toEqual("content");
		expect(fc.lastChild.lastChild.firstChild.data).toEqual("Three\tTabs");
	});
	
	it("should invoke consumption observers", function(){
		function TempObject() {
			this.I = 0;
		};
		var obj = new TempObject();
		var obj2 = new TempObject();
		
		sqrl.onAfterConsume(obj, function(sqrl,amnt) {
			this.I+= amnt;
		});
		
		sqrl.onAfterConsume(obj2, function(sqrl,amnt) {
			this.I += amnt*2;
		});
		
		sqrl.appendBuffer("1234567");
		while(sqrl.canNibble()) {
			sqrl.nibble();
		}
		expect(obj.I).toEqual(7);
		expect(obj2.I).toEqual(14);
	});
	
	it("should be able to handle forward assertions", function(){ 
		/*
		 * **one**
		 * **two
		 * three
		 * ->
		 * <doc>
		 * 	<p><strong>**one**</strong></p>
		 * 	<p>**two</p>
		 * 	<p>three</p>
		 * </doc>
		 */
		sqrl.under("doc").createDefaultChild("p");
		sqrl.under("p").accept(/\*\*(?=[^*]*\*\*)/).as("strong");
		sqrl.under("strong").accept(/\*\*/).toAscend();
		sqrl.under("p").acceptLineEnd().asSibling("p", false);
		
		sqrl.appendBuffer("**one**\n**two\nthree");
		
		while(sqrl.canNibble()) sqrl.nibble();
		
		var fc = sqrl.document.firstChild;
		expect(fc.childNodes.length).toEqual(3);
		expect(fc.childNodes[0].nodeName).toEqual("p");
		expect(fc.childNodes[1].nodeName).toEqual("p");
		expect(fc.childNodes[2].nodeName).toEqual("p");
		expect(fc.childNodes[0].firstChild.nodeName).toEqual("strong");
		expect(fc.childNodes[1].firstChild.nodeType).toEqual(sqrl.document.TEXT_NODE);
		expect(fc.childNodes[1].firstChild.data).toEqual("**two");
	});
	
	it("should be at reset state when created", function() {
		// expect the start of the document to be reset
		expect(sqrl.currentNode).toEqual(sqrl.document.firstChild);
		expect(sqrl.offset).toEqual(0);
	});
	
	it("should move the offset when text is added", function() {
		sqrl.appendBuffer("welcome");
		while(sqrl.canNibble()) sqrl.nibble();
		
		expect(sqrl.currentNode).toEqual(sqrl.document.firstChild);
		expect(sqrl.offset).toEqual("welcome".length);
	});
	
});
