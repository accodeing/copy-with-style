'use babel';


function getTextNodesIn( element ){
  var textNode, textNodes, treeWalker;

  textNodes = [];
  treeWalker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  while( textNode = treeWalker.nextNode() ){
    textNodes.push( textNode );
  }

  return textNodes;
};


export { getTextNodesIn };
