'use babel';

import Editor from './atom_editor';

import { RTF } from './rtf';
import { getTextNodesIn } from './node_manipulation';
import { Color } from './color';


export default class RTFgenerator {
  constructor( config, callback ){
    this.config = config;
    this.callback = callback;

    this.rtf = RTF( this.config );
  }

  style_node( node ){
    var style, color;

    if( !node.data ){ return; }

    style = window.getComputedStyle( node.parentElement );
    color = new Color( style.color ).rgba2rgb( this.config.background_color );

    this.rtf.append(
      node.data,
      color.rgb().string(),
      {
        bold: style.fontWeight === 'bold',
        underline: style.textDecoration === 'underline',
        italic: style.fontStyle === 'italic',
      }
    );
  }

  generate_line( line ){
    getTextNodesIn( line ).map( this.style_node.bind( this )).join('');
    this.rtf.append('\n');
  }

  finalize(){
    this.callback( this.rtf.finalize());
  }

  generate(){
    new Editor( this.finalize.bind( this )).process_lines( this.generate_line.bind( this ));
  }
}
