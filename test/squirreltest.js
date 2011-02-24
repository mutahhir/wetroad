describe("squirrel syntax creation", function(){
	
	it("should create a default document", function(){
		var sqrl = new Squirrel("doc");
		expect(sqrl.document.firstChild.nodeName).toEqual("doc");
	});
	
});