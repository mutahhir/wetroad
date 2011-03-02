describe("squirrel performance", function() {
        var sqrl = null;

        beforeEach(function(){
            sqrl = new Squirrel("doc");
        });
   
        it("should accept all of shakespears work (118406 lines) in timely manner", function(){
            var big = "";
            for (var i = 0; i < 118406; i++) {
                big += "Had made his course to illume that part of heaven\n";
            }
            sqrl.under("doc").createDefaultChild("block");
            sqrl.under("block").createDefaultChild("line");
            sqrl.under("line").acceptLineEnd(false).toAscend(false);
            sqrl.under("block").acceptLineEnd().as("line", false, false);
            sqrl.under("line").accept(/\t/).toBecome("block");
            var d1 = new Date();
            sqrl.appendBuffer(big);
            while(sqrl.canNibble()){
                sqrl.nibble();
            }
            var d2 = new Date();
            console.log("Time taken for bulk loading: "+ (d2.getTime() - d1.getTime())+ " ms");
        });
        
        it("should accept all of shakespears work (118406 lines) in timely manner", function(){
            sqrl.under("doc").createDefaultChild("block");
            sqrl.under("block").createDefaultChild("line");
            sqrl.under("line").acceptLineEnd(false).toAscend(false);
            sqrl.under("block").acceptLineEnd().as("line", false, false);
            sqrl.under("line").accept(/\t/).toBecome("block");
            var d1 = new Date();
            for (var i = 0; i < 118406; i++) {
            	sqrl.appendBuffer("Had made his course to illume that part of heaven\n");
            	while(sqrl.canNibble()){
            		sqrl.nibble();
            	}
            }
            var d2 = new Date();
            console.log("Time taken for line based loading: "+ (d2.getTime() - d1.getTime())+ " ms");
        });
        
        
});
