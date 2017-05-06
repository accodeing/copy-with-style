'use babel';

/* This module augments the npm color package with a few special features */

/* Use the npm color package as base */
import _Color from 'color';

/* Add our method to mix a rgba color with the background to get the rgb color */
_Color.prototype.rgba2rgb = function( base_color ){
  var front_color, mixed_color;

   base_color = new Color( base_color );
  front_color = new Color( this );
        ratio = front_color.alpha();
  front_color = front_color.alpha( 1.0 );

  mixed_color = front_color.mix( base_color, ratio );

  return mixed_color.rgb();
}

/* Overload the Color constructor to accept Atom::Color instances */
function Color( obj, model ){
  if(( typeof obj == "object" ) && ( '_alpha' in obj )){
    var str;
    str = 'rgba('+obj._red+', '+obj._green+', '+obj._blue+', '+obj._alpha+')';
    return new _Color( str, model );
  } else {
    return new _Color( obj, model );
  }
}

/* Inherit all of Color */
Color.prototype = _Color.prototype;

export { Color };
