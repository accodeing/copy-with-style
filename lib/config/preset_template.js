'use babel';

export default {
  title: 'Preset 1',
  description: '...',
  type: 'object',
  properties: {
    name: {
      title: 'Name',
      description: 'Friendly name for your preset, like; "Copy for Google docs" or "Copy for Powerpoint".',
      type: 'string',
      default: 'preset 1',
      order: 1,
    },
    background_color: {
      title: 'Code block background color',
      description: 'Used as the background color style for code blocks as well as for converting rgba color values to rgb by factoring in the opacity and background colors effect.',
      type: 'color',
      default: '#3e3e3e',
      order: 3,
    },
    font_family: {
      title: 'Font name',
      description: 'Used as the font-family css attribute on the top level code block.',
      type: 'string',
      default: 'Source Code Pro',
      order: 4,
    },
    font_size: {
      title: 'Font size',
      description: 'Used as the font-size css attribute on the top level code block.',
      type: 'integer',
      default: 10,
      order: 5,
    },
    format: {
      title: 'Output format',
      type: 'string',
      default: 'HTML',
      enum: ['HTML', 'RTF'],
      order: 6,
    },
    external_command: {
      title: 'External command',
      description: 'Optional external command to execute and send the result, HTML or RTF, to. The default is nothing in which case the result will be copied to the clipboard.',
      type: 'string',
      default: '',
      order: 7,
    }
  }
}
