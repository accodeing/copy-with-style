/**
This file was lifted from Alexander Kotliarskyi's Atom package copy-with-syntax
and lightly modified for use in this project.
*/

'use babel';

function rgbaToRTF(color) {
  var match = color.match(/rgba?\((\d+), (\d+), (\d+).*/);
  var red = match ? match[1] : 0;
  var green = match ? match[2] : 0;
  var blue = match ? match[3] : 0;
  return `\\red${red}\\green${green}\\blue${blue}`;
}

function RTF( config ) {
  var colors = [];
  var lastColor = null;
  var content;
  var font = config.font_family.replace(/[' ]/g, '');

  function colorIndexFromTable(color) {
    var index = colors.indexOf(color);
    if (index === -1) {
      index = colors.push(color) - 1;
    }
    return index + 1; // 1-based index
  }

  var r, g, b;

  r = config.background_color.red;
  g = config.background_color.green;
  b = config.background_color.blue;

  console.log( 'rgb('+r+', '+g+', '+b+')' );

  content = '\\cb' + colorIndexFromTable( 'rgb('+r+', '+g+', '+b+')' );

  return {
    append(text, color, style) {
      if (color && color !== lastColor) {
        content += '\\cf' + colorIndexFromTable(color) + ' ';
        lastColor = color;
      }
      text = text
        .replace(/[\\{\}\~]/g, '\\$&')
        .replace(/\n\r/g,' \\line ')
        .replace(/\n/g,' \\line ')
        .replace(/\r/g,' \\line ');

      //TODO(Jonas): Nice this Unicode encoding up a bit ...
      var chr, translation = ''; i = text.length;
      while(i--){
        code = text.charCodeAt(i);
        if( code > 127){
          translation = '\\u'+code+' ?' + translation;
        } else {
          translation = text[i] + translation;
        }
      }
      text = translation

      style = style || {};
      if (style.bold) {
        text = `\\b ${text}\\b0 `;
      }
      if (style.underline) {
        text = `\\ul ${text}\\ul0 `;
      }
      if (style.italic) {
        text = `\\i ${text}\\i0 `;
      }
      content += text;
    },

    finalize() {
      var colortbl = colors.map(rgbaToRTF).join(';');
      var fonttbl = ['Regular', 'Bold', 'Italic'].map(
        (flavor, ii) => `\\f${ii}\\fnil\\fcharset0 ${font}-${flavor};`
      ).join('');

      return [
        '{\\rtf1\\ansi\\ansicpg1252',
        `{\\fonttbl${fonttbl}}`,
        `{\\colortbl;${colortbl};}`,
        `\\f0\\fs` + parseInt( config.font_size ) * 2,
        content,
        '}',
      ].join('\n');
    }
  };
}

export { RTF };
