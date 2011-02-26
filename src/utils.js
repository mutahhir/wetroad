/**
 * 
 */

/**
 * moveChildrenTo moves any and all elements from src to dest. If dest already
 * has childnodes, this will not erase them, instead will only append to dest
 */
var Utils = Utils || {};

Utils.moveChildrenTo = function moveChildrenTo(dest, src) {
	if (!src.hasChildNodes())
		return;

	var ch = src.childNodes, len = ch.length, i = 0;
	for (; i < len; i++) {
		dest.appendChild(ch[0]);
	}
};

Utils.highestAncestor = function highestAncestor(node) {
	if (node === null || !Utils.isNode(node))
		return null;
	var anc = node;

	while (anc.parentNode !== null) {
		anc = anc.parentNode;
	}
	return anc;
};

// Courtesy: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
Utils.isNode = function isNode(o) {
	return (typeof Node === "object" ? o instanceof Node
			: typeof o === "object" && typeof o.nodeType === "number"
					&& typeof o.nodeName === "string");
};

Utils.getNodeDepth = function getNodeDepth(node){
	if( node === null || !Utils.isNode(node) )
		return -1;
	var anc = node, depth = 0;
	while(anc.parentNode !== null) {
		anc = anc.parentNode;
		depth += 1;
	}
	return depth;
};

Utils.removeWrappingNode = function removeWrappingNode( parent, node ){
	if( node.parentNode !== parent ) throw "Invalid Parameters";
	Utils.moveChildrenTo(parent, node);
	parent.removeChild(node);
};