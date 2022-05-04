'use babel';

import { CompositeDisposable } from 'atom';
import configuration from './config';

import HTMLgenerator from './html_generator';
import RTFgenerator from './rtf_generator';
import copy from 'copy-paste';


export default {

  config: configuration,

  activate(state) {
    atom.commands.add('atom-text-editor', {
      'copy-with-style:html': this.copy_html_to_clipboard,
      'copy-with-style:rtf': this.copy_rtf_to_clipboard
    })
  },

  copy_html_to_clipboard(){
    new HTMLgenerator(
      atom.config.get( 'copy-with-style.html' ),
      (content) => {
        const listener = function(ev) {
          ev.preventDefault();
          ev.clipboardData.setData('text/html', content);
          ev.clipboardData.setData('text/plain', content);
        };
        document.addEventListener('copy', listener);
        document.execCommand('copy');
        document.removeEventListener('copy', listener);
      }
    )
    .generate();
  },

  copy_rtf_to_clipboard(){
    new RTFgenerator(
      atom.config.get( 'copy-with-style.rtf' ),
      (content) => {
        copy.copy( content )
      }
    )
    .generate();
  }

};
