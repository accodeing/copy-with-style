'use babel';

import template from './preset_template';

var preset1, preset2, preset3;

preset1 = template;
preset2 = JSON.parse(JSON.stringify( template ));
preset3 = JSON.parse(JSON.stringify( template ));

preset2.title = 'Preset 2';
preset3.title = 'Preset 3';

export default {
  preset1: preset1,
  preset2: preset2,
  preset3: preset3
}
