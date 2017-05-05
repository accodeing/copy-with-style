# copy-as-html package for the Atom editor

Ever which you could just copy the code from your editor into document or
presentation, WITH the syntax highlighting? Well, now you can* ...

\* given that you are running on OS X and add a small ruby script, for now :)

## other options

If you want RTF instead of HTML you should use the [copy-as-rtf](https://atom.io/packages/copy-as-rtf) package instead. Be aware that it uses the Pygments python program for the syntax highlighting though, so the visuals might not match the Atom view depending on your theme etc.

If you want another option have a look at [copy-with-syntax](https://atom.io/packages/copy-with-syntax) that also produces RTF but uses Atoms internal editor DOM to extract the colors from the editor.

## why another one then?

Well RTF doesn't paste well into Google docs and that is primarily what I use. I tried a lot of RTF to HTML transformations using tools like textutil etc and while that worked ok I never got OS X to mark the copied HTML as HTML on the clipboard. That means that it pastes as text instead, including the markup, and defeats the point entirely.

I used a modified version of copy-as-rtf for my experiments but didn't like the fact that it used an external program to do the highlighting, the colors never ended up exactly like in Atom. I looked at copy-with-syntax and it was easy enough to modify to create HTML and used Atoms coloring, but ...

Since I need to switch between RTF and HTML output (just because I use Google docs doesn't mean everyone does) and want the option to pipe the output to an external program (to get it into the OS X clipboard properly in my case) I still needed to modify either of the other packages a lot or write my own.

# options

You can create presets in the settings, up to three of them, available using `alt+a 1` - `alt+a 3`. A preset is a named combination of:
 * Output format, RTF or HTML.
 * Font face and size.
 * Background color.
 * Optional external command, if not provided it will fall back to the default behaviour and copy the result to the clipboard.

This gives you pretty free reign as to how you want to consume the result. I use it with this simple `copy-as-html` ruby script:

```ruby
#!/usr/bin/env ruby
# encoding: UTF-8

require 'pasteboard'

Pasteboard.new.put [[ Pasteboard::Type::HTML, ARGF.read ]]
```

Sending the HTML output to this snippet copies it into the OS X clipboard with the proper content type and allows it to be pasted correctly into Google docs. If you create similar solutions, for HTML or RTF, for other platforms please share them and we can build a library of tools to complement the package.
