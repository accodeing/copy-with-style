>
> :warning: Given that [Github has officially decided to shut down Atom](https://github.blog/2022-06-08-sunsetting-atom/), and that the [publishing of new versions of packages hasn't worked for over 6 months](https://github.com/atom/apm/issues/572), **I'm not going to maintain this addon.** If anyone would like to maintain it for the remaining Atom audience I'd be happy to transfer ownership of the project.
>

# Copy with style!

Ever which you could just copy the code from your editor into document or
presentation, WITH the syntax highlighting? Well, now you can!

![Demo where code is copied from Atom into Google docs with the syntax highlighting preserved.](http://link.my-codeworks.com/kKrj/copy-with-style-demo-html-in-google-docs.gif)

# Options

You can create presets in the settings, up to three of them, available using `alt+a 1` - `alt+a 3`. A preset is a named combination of:
 * Output format, RTF or HTML.
 * Font face and size.
 * Background color.
 * Optional external command, if not provided it will fall back to the default behaviour and copy the result to the clipboard.

This gives you pretty free reign as to how you want to consume the result. I use it with a simple ruby script to get the proper format on the clipboard in OS X to paste correctly into Google docs.

Take a look at the [repository Wiki](https://github.com/my-codeworks/copy-with-style/wiki) for that script. Feel free to contribute with your own creations as well.
