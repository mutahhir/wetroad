/**
 * 
 */

/**
 * moveChildrenTo moves any and all elements from src to dest.
 * If dest already has childnodes, this will not erase them, instead will
 * only append to dest
 */
var Utils = Utils || {};

Utils.moveChildrenTo = function moveChildrenTo(dest, src) {
	if( !src.hasChildNodes() ) return;
	
	var ch = src.childNodes,
	    len = ch.length, i = 0;
	for( ; i < len; i++ ) {
		dest.appendChild(ch[0]);
	}
};