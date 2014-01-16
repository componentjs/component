  ![web component logo](http://i49.tinypic.com/e7nj9v.png)

  Component package manager for building a better web.

## Installation

  With [node](http://nodejs.org) previously installed:

     $ npm install -g component

  With node binary on OSX:

     $ (cd /usr/local && \
        curl -L# http://nodejs.org/dist/v0.8.15/node-v0.8.15-darwin-x86.tar.gz \
        | tar -zx --strip 1) \
       && npm install -g component \
       && printf "installed component(1) %s\n" $(component --version)

  NOTE: tested with node 0.8.x

## Features

  - write modular commonjs components
  - write components that include their own styles, images, scripts, or any combo
  - no registry publishing or account required, uses github repositories
  - extensible sub-commands via `component-YOURCOMMAND` git-style
  - component skeleton creation command
  - installs dependencies from the command-line or ./component.json
  - avoid name squatting through github's naming conventions
  - build your components with `--standalone` to share them with non-component(1) users
  - discovery of useful packages is simple with a robust search
  - view documentation from the command line
  - simple private registry set up (all you need is a file server)
  - very fast installs (50 components in ~4.5s)
  - very fast search (~300ms)

## Links

 - [List](https://github.com/component/component/wiki/Components) of all available components
 - [Wiki](https://github.com/component/component/wiki)
 - [Mailing List](https://groups.google.com/group/componentjs)
 - [Google+ Community](https://plus.google.com/u/0/communities/109771441994395167277)
 - component ["spec"](https://github.com/component/component/wiki/Spec)
 - join `#components` on freenode
 - follow [@component_js](http://twitter.com/component_js) on twitter
 - [Building better components](https://github.com/component/component/wiki/Building-better-components) tips
 - [F.A.Q](https://github.com/component/component/wiki/F.A.Q)
 - In-browser component [builder](http://component-kelonye.rhcloud.com/)
 - component [dependency visualizer](http://component-graph.herokuapp.com/component/dom)

## Screencasts

 - [Creating web components](https://vimeo.com/53730178)
 - [App integration introduction](https://vimeo.com/48054442)

## Articles

  - building a [date picker component](http://tjholowaychuk.tumblr.com/post/37832588021/building-a-date-picker-component)
  - original [component blog post](http://tjholowaychuk.tumblr.com/post/27984551477/components)

## Usage

 Via `--help`:

```

Usage: component <command> [options]

Options:

  -h, --help     output usage information
  -V, --version  output the version number

Commands:

  install [name ...]      install one or more components
  create [dir]            create a component skeleton
  search [query]          search with the given query
  convert <file ...>      convert html files to js modules
  info <name> [prop]      output json component information
  changes <name>          output changelog contents
  wiki                    open the components list wiki page
  build                   build the component
  ls                      list installed components

```

## Installing packages

  To install one or more packages, simply pass their github
  repo names as arguments to `component install`. Dependencies
  are resolved and the component contents are downloaded into
  `./components` by default. View `component help install` for details.

```
$ component install component/tip

   install : component/tip@master
       dep : component/emitter@master
   install : component/emitter@master
       dep : component/jquery@master
   install : component/jquery@master
     fetch : component/tip:index.js
     fetch : component/tip:tip.css
     fetch : component/tip:tip.html
     fetch : component/emitter:index.js
     fetch : component/jquery:index.js
  complete : component/emitter
  complete : component/jquery
  complete : component/tip
```

## Searching for components

  By adding your component to the [Components List](https://github.com/component/component/wiki/Components) wiki page it will become automatically available to `component-search(1)`. When invoked with no query all components are displayed, otherwise a filtered search, ordered by the number of github "stars":

```
$ component search ui

  component/dialog
  url: https://github.com/component/dialog
  desc: Dialog component
  ★ 12

  component/notification
  url: https://github.com/component/notification
  desc: Notification component
  ★ 10

  component/overlay
  url: https://github.com/component/overlay
  desc: Overlay component
  ★ 7

```

## Using GitHub as a registry

  By using GitHub as the registry, `component(1)` is automatically
  available to you without further explicit knowledge or work
  creating a registry account etc.

  A nice side-effect of this namespaced world is that dependencies
  are explicit and self-documenting. No longer do you need to query
  the registry for a "repo" property that may not exist, it's simply
  built in to the package name, for example ["visionmedia/page.js"](https://github.com/visionmedia/page.js) rather
  than the unclear "page".

  Another benefit of this is that there are zero name collisions, for example
  you may use "component/tip" for a dependency of "foo", and "someuser/tip"
  as a dependency of "bar", providing `require('tip')` in each. This prevents
  obscure or irrelevant naming such as "progress", "progress2", "progress-bar",
  "progress-component" found in npm.

## Creating a component

  The `component-create(1)` command can create a component
  project skeleton for you by filling out the prompts. Once
  this repo is published to GitHub, you're all done!

```
name: popover
description: Popover UI component
does this component have js? yes
does this component have css? yes
does this component have html? yes

     create : popover
     create : popover/index.js
     create : popover/template.html
     create : popover/popover.css
     create : popover/Makefile
     create : popover/Readme.md
     create : popover/.gitignore
     create : popover/component.json

```

  A `Makefile` is created for you in order to create a build of the component,
  complete with installed dependencies simply execute `make`.

## Templates

  Because `component(1)` has no notion of a "template", even simple HTML files
  should be converted to a `require()`-able module. It is recommended that public
  components shared within the community use regular HTML templates, and regular
  CSS stylesheets to maximize contributions, however if you wish to use alternate
  technologies just make sure to compile them before publishing them to GitHub.

  For the recommended use-case of regular HTML, the `component-convert(1)` command
  will translate a regular HTML file to its `require()`-able JavaScript counterpart.

## Developing component(1) sub-commands

  `component(1)` and sub-commands are structured much like `git(1)`,
  in that sub-commands are simply separate executables. For example
  `$ component info pkg` and `$ component-info pkg` are equivalent.

  Because of this you'll likely want `PATH="./bin:$PATH"` in your
  profile or session while developing component, otherwise `./bin/component`
  will have a hard time finding the sub-commands.

## Using private components

  `component(1)` uses [~/.netrc](http://man.cx/netrc(4), like other tools such as [curl](http://man.cx/curl) and [git](http://git-scm.com/), to specify credentials for remote hosts. Simply create a `~/.netrc` file in the home directory:

```
machine raw.github.com
  login visionmedia
  password pass123
```

## Running tests

Make sure dependencies are installed:

```
$ npm install
```

Then run:

```
$ make test
```

## Contributors

  - TJ Holowaychuk
  - Guillermo Rauch
  - Garrett Johnson
  - Amir Abu Shareb
  - Adam Sanderson
  - Matt Mueller
  - Forbes Lindesay
  - Arpad Borsos
  - Dan Williams
  - Damián Suárez
  - Tim Oxley
  - Jeremy Worboys
  - Nick Jackson
  - Cameron Bytheway

## Example applications

  Open source application examples:

  - Example using [script tags](https://github.com/component/script-tag-example) for integrating component with existing non-commonjs applications or frameworks
  - [Todo list](https://github.com/component/todo) example comprised of private and public components
  - [Component.io](https://github.com/component/component.io) website
  - [Posty](https://github.com/visionmedia/posty)
  - [NoFlo](noflojs.org) flow-based programming environment

## Extensions

 - [component-graph(1)](https://github.com/component/component-graph) dependency graphs for component projects

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
