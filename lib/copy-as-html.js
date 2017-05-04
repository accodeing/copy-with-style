'use babel';

console.log('Loading.');

import { CompositeDisposable } from 'atom';
import configuration from './config';

function textNodesUnder( el ){
  var n, a=[], walk;

  walk = document.createTreeWalker( el, NodeFilter.SHOW_TEXT, null, false );

  while( n = walk.nextNode() ){ a.push(n); }

  return a;
};

function styleTextNode( node ){
  var style, css, html;

  if( !node || !node.data ){ return; }

  style = window.getComputedStyle(node.parentElement);
  css = 'color:'+rgba2hex(style.color)+';';
  if( style.fontWeight === 'bold' ){ css += 'font-weight:blod;'; }
  if( style.textDecoration === 'underline' ){ css += 'text-decoration:underline;'; }
  if( style.fontStyle === 'italic' ){ css += 'font-style:italic;'; }

  html = '<span style="'+css+'">'+node.data+'</span>';

  return html;
}

function findEditorDOM(root) {
  if (root.classList && root.classList.contains('lines')) {
    return root;
  }
  for (var i = 0; i < root.children.length; i++) {
    var element = findEditorDOM(root.children[i]);
    if (element) {
      return element;
    }
  }
}

function getLinesFromEditor(){
  const editor = atom.workspace.getActiveTextEditor();
  const el = atom.workspace.viewRegistry.getView( editor );
  const lines_wrapper = el.getElementsByClassName( 'lines' )[0];

  return Array.from( lines_wrapper.getElementsByClassName( 'line' ));
}

function filterLinesToSelection( lines ){
  const editor = atom.workspace.getActiveTextEditor();
  const selections = editor.getSelectionsOrderedByBufferPosition();
  const lastSelection = selections[selections.length - 1];
  const selectionRange = lastSelection.getBufferRowRange()

  if( selectionRange[0] !== selectionRange[1] ){
    lines = lines.slice(selectionRange[0],selectionRange[1] + 1 )
  }

  return lines;
}

function rgba2hex(rgb_string){

  var color_values_string = rgb_string.split(/\(|\)/)[1]
  var colors_as_text = color_values_string.split(/[^0-9.]+/)

  var r = parseInt( colors_as_text[0] );
  var g = parseInt( colors_as_text[1] );
  var b = parseInt( colors_as_text[2] );
  var a = parseFloat( colors_as_text[3] || '1.0' );

  var background = (1 - a) * 43;

  hex = "#"

  hex += Math.round( background + ( a * r )).toString(16);
  hex += Math.round( background + ( a * g )).toString(16);
  hex += Math.round( background + ( a * b )).toString(16);

  return hex;
}

export default {

  subscriptions: null,
  config: configuration,

  activate(state) {
    console.log('Activate!');
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'copy-as-html:copy': () =>{ console.log('Call!'); this.copy(); },
      'copy-as-html:checkSelection': () =>{ console.log('Call!'); this.checkSelection(); }
    }));
  },

  deactivate() {
    console.log('Deactivate!');
    this.subscriptions.dispose();
  },

  checkSelection() {
    const editor = atom.workspace.getActiveTextEditor();
    const selections = editor.getSelectionsOrderedByBufferPosition();

    const lastSelection = selections[selections.length - 1];
    const selectionRange = lastSelection.getBufferRowRange()
    const smallestLineNumber = selectionRange[0] + 1;
    const largestLineNumber = selectionRange[1] + 1;
    console.log( smallestLineNumber, largestLineNumber );
  },

  get_code_block_style() {
    var color, font_family, font_size, css;

    color = atom.config.get('copy-as-html.preset1.background_color');
    font_family = atom.config.get('copy-as-html.preset1.font_family');
    font_size = atom.config.get('copy-as-html.preset1.font_size');

    css =  'background-color:'+ color +';';
    css += 'font-family:\''+ font_family +'\';'
    css += 'font-size:'+ font_size +'pt;'

    return css;
  },

  copy() {
    var lines, style, css, html, cmd, options, exec;

    lines = getLinesFromEditor();
    lines = filterLinesToSelection( lines );

    if( !lines ){
      throw new Error( 'Cound not locate lines DOM inside editor' );
    }

    html = '<code style="'+ this.get_code_block_style() +'">';
    lines.forEach(( line ) => {
      html += textNodesUnder( line ).map( styleTextNode ).join('');
      html += '<br/>\n';
    });
    html += '</code>';

    exec = require('child_process').execSync;

    cmd = 'copy_as_html';
    options = {
      input: html,
      timeout: 1000,
    }

    return exec(cmd, options);
  }

};
