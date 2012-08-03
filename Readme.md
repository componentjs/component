
# component

  Component package manager consuming git repositories

## Features

  - no registry required, uses github repositories
  - fast (~2x faster than uncached npm at the time of comparison)
  - extensible sub-commands via `component-YOURCOMMAND`
  - hackable internals (no monolithic lib here)
  - resolves dependencies

## Dependencies

  By using GitHub as the registry, `component(1)` is automatically
  available to you without further explicit knowledge or work
  creating a registry account etc.

  A nice side-effect of this namespaced world is that dependencies
  are explicit and self-documenting. No longer do you need to query
  the registry for a "repo" property that may not exist, it's simply
  build in to the package name, for example ["visionmedia/page.js"](https://github.com/visionmedia/page.js) rather
  than the ambiguous "page".

## Developing component(1)

  `component(1)` and sub-commands are structured much like `git(1)`,
  in that sub-commands are simply separate executables. For example
  `$ component info pkg` and `$ component-info pkg` are equivalent.

  Because of this you'll likely want `PATH="./bin:$PATH"` in your
  profile or session while developing component, otherwise `./bin/component`
  will have a hard time finding the sub-commands.

## License 

(The MIT License)

Copyright (c) 2012 TJ Holowaychuk &lt;tj@vision-media.ca&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.