'use babel';


function parseColorString( color_string ){
  var r, g, b, a, color_values_string, colors_as_text;

  if( color_string[0] == '#' ){
    colors_as_text = color_string.slice(1).match(/.{2}/g)

    r = parseInt( colors_as_text[0], 16 );
    g = parseInt( colors_as_text[1], 16 );
    b = parseInt( colors_as_text[2], 16 );
    a = parseInt( colors_as_text[3] || 'ff', 16 ) / 255;
  } else {
    color_values_string = color_string.split(/\(|\)/)[1]
    colors_as_text = color_values_string.split(/[^0-9.]+/)

    r = parseInt( colors_as_text[0] );
    g = parseInt( colors_as_text[1] );
    b = parseInt( colors_as_text[2] );
    a = parseFloat( colors_as_text[3] || '1.0' );
  }

  return { r: r, g: g, b: b, a: a };
}


function rgba2rgb( rgb_maybe_a_string, background_color ){
  var color, background, r, g, b, a;

  color = parseColorString( rgb_maybe_a_string );
  background = parseColorString( background_color );

  a = color.a || 1.0;

  background.r = (1.0 - a) * background.r;
  background.g = (1.0 - a) * background.g;
  background.b = (1.0 - a) * background.b;

  r = Math.round( background.r + ( a * color.r ));
  g = Math.round( background.g + ( a * color.g ));
  b = Math.round( background.b + ( a * color.b ));

  return { r: r, g: g, b: b };
}


function rgbaString2HexString( rgb_maybe_a_string, background_color ){
  var rgb, hex;

  rgb = rgba2rgb( rgb_maybe_a_string, background_color );
  hex = "#"

  hex += rgb.r.toString(16);
  hex += rgb.g.toString(16);
  hex += rgb.b.toString(16);

  return hex;
}


function rgbaString2RgbString( rgb_maybe_a_string, background_color ){
  var rgb, hex;

  if( rgb_maybe_a_string[3] != 'a' ){ return rgb_maybe_a_string; }

  rgb = rgba2rgb( rgb_maybe_a_string, background_color );

  return 'rgb('+rgb.r+', '+rgb.g+', '+rgb.b+')';
}


export { parseColorString, rgba2rgb, rgbaString2HexString, rgbaString2RgbString };
