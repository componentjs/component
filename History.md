1.1.0 / 2015-03-14
======================

 * provide shrinkwrapper support: [component-shrinkwrapper](https://github.com/componentjs/shrinkwrapper)

1.0.1 / 2014-11-22
======================

 * watch development fields [watcher.js#2](https://github.com/componentjs/watcher.js/issues/2)
 * check latest tag for component.json at first [component#611](https://github.com/componentjs/component/issues/611)
 * download archive if globs are used in component.json [downloader.js#7](https://github.com/componentjs/downloader.js/pull/7)

1.0.0 / 2014-10-30
======================
* use `debug` instead of consoler.js to warn about __requiring components below root__
* add repository redirects for api.github.com requests (if a user rename a repo)
* require2

  * fix semver sorting for `require.latest`

For a more in-depth changelog about v1, please read: https://github.com/component/guide/blob/master/changelogs/1.0.0.md.

1.0.0-rc7 / 2014-10-12
======================

* `component-build`

  * update autoprefixer

* require2

  * provide `require.loader`
  * provide `require.latest(moduleName)` to require a remote module without specify the version


1.0.0-rc6 / 2014-10-05
======================

 * `component-build --watch` deletes build files if errors occur and doesn't stop the process anymore
 * allow to require locals below the root without throwing an error
 * allow to require paths which cannot be resolved without throwing an error
 * fix requiring files from a local (without file extension)
 * feature: nested locals like `foo/bar`
 * fix CSS parsing for url rewriting, 10x faster
 * fix module name when exporting as AMD
 * fix AMD export for `strict` mode
 * fix remaining quotes when rewrite `require()` paths
 * allow hashtag in CSS URLs


1.0.0-rc5 / 2014-04-07
======================

Primarily bug fixes.

* bitbucket support
* `component-link`

  * add `--tag`
  * remove the requirement of the component name matching the repository name

* `component-build`

  * fix `--out`
  * fix `--copy`
  * fix file path rewriting for local components

* fix `component-ls --depth`

1.0.0-rc4 / 2014-04-04
======================

Component `1.0.0` is now feature complete. Please help debug and open an issues you may have with this release! `1.0.0` will not be released until http://component.io is updated.

* doc updates
* better debug/error messages
* bug fixes
* re-add `component install --proxy`

1.0.0-rc3 / 2014-04-03
======================

The primary goal of this release is to make 1.0.0 feature complete. Please try all the new commands and provide feedback!

* add:

    - `component build --watch`
    - `component link`

* update `component-search` to use crawled components

1.0.0-rc2 / 2014-04-03
======================

The primary goal of this release is to test the new commands.

* add:

    - `component-duplicates`
    - `component-open`
    - `component-outdated`
    - `component-pin`
    - `component-update`
    - `component-validate`

* reintroduce `--standalone` to `component-build`

1.0.0-rc1 / 2014-04-01
======================

The primary goal of this release is to test `component install` and `component build` and remove features we've decided to remove.

* add:

    - `component-install` semver support
    - `component-install` now handles redirects (not w/ semver resolution, however)
    - `component-crawl`
    - `component-build <styles|scripts|files>` for designating a specific build
    - `component-build styles --browsers` - default autoprefixer support
    - `component-build styles` - fix CSS dependency ordering
    - `component-build scripts` - es6 module support
    - `component-build scripts` - other generator improvements from [builder2](http://github.com/component/builder2.js)
    - `component-build scripts` - now autorequires by default

* remove:

    - `component-create` - moved to [component-create](https://github.com/component/create.js)
    - `component-convert`
    - `component-wiki`
    - `component-info`
    - `component-changes`
    - `component-install --force`
    - `component-install` custom remotes (for now, need adapter APIs in [remotes](http://github.com/component/remotes.js))
    - `component-install` proxy - temporarily removed/untested, will be added again later

* changed:

    - `component-build scripts --umd` from `--standalone`

* updated to comply with the latest [specs](https://github.com/component/spec/blob/master/component.json/specifications.md)

0.19.8 / 2014-03-29
==================

 * fix force install option #485
 * fix dependencies installed via not being added to component.json #466
 * bump deps

0.19.7 / 2014-02-25
==================

 * update github URLs in package.js to https://raw.githubusercontent.com

0.19.6 / 2014-02-06
==================

 * update component-installer to remove lowercasing
 * update "superagent-proxy" to v0.3.0
 * update "proxy-agent" to v1.1.0

0.19.5 / 2014-01-16
==================

 * update installer for lookup casing fix
 * fix casing in .lookup()

0.19.4 / 2014-01-16
==================

 * update installer for casing fix
 * update builder for casing fix

0.19.3 / 2014-01-07
==================

 * update installer

0.19.2 / 2014-01-06
==================

 * revert builder

0.19.1 / 2013-12-30
==================

 * update builder for main alias fix

0.19.0 / 2013-12-30
==================

 * add .netrc auth logic back
 * add proxy support
 * add full MIT license to component-create(1)
 * update component-builder for alias removal
 * change component-install to use installer.js
 * remove component-install(1) --out flag. Closes #389
 * change component-search(1) to only display "demo: ..." when present

0.18.0 / 2013-10-17
==================

 * update builder for json support

0.17.6 / 2013-09-17
==================

 * revert superagent enabling for now
 * add use of "open" for component-wiki

0.17.5 / 2013-09-13
==================

 * add superagent use back for netrc

0.17.4 / 2013-09-12
==================

 * update builder

0.17.3 / 2013-09-06
==================

 * update builder (require function change)

0.17.2 / 2013-09-03
==================

 * add superagent-proxy
 * add warning for missing bin
 * fix: bump version of netrc
 * fix: keep default gh remote from being added each install command.
 * fix: wait for packages to install successfully before writing component.json -- Should solve #386

0.17.0 / 2013-07-19
==================

 * update builder

0.16.8 / 2013-07-17
==================

 * fix dups reported in install output. Closes #372
 * fix corrupt downloads with quick superagent replacement. Closes #374

0.16.7 / 2013-07-05
==================

 * update superagent for unzip fixes

0.16.6 / 2013-07-02
==================

 * update superagent
 * fix node 0.8 issues when installing partial files
 * remove OAuth in .netrc instructions

0.16.5 / 2013-06-26
==================

 * update superagent
 * fixing resolve bug for node 0.10+

0.16.4 / 2013-06-18
==================

 * fix build of empty js files when no js is present
 * fix installation of local dependencies via lookup paths
 * fix removal of semi-installed components

0.16.3 / 2013-06-06
==================

 * update builder

0.16.2 / 2013-05-31
==================

 * add dev url prefixing back

0.16.1 / 2013-05-30
==================

 * add mtime update of output directory on install. Closes #344
 * fix component-install(1) --dev, manip .development not .dependencies Closes #177

0.16.0 / 2013-05-13
==================

  * add netrc support
  * add `component-install(1)` --verbose
  * add .demo, closes #254
  * add -v, --verbose to component-search(1) with license / version. Closes #317
  * add `--no-require` to `component-build(1)`
  * remove component-docs(1)
  * fix: inFlight components do not emit `end` events

0.15.1 / 2013-04-26
==================

  * update builder for root-level main alias fix

0.15.0 / 2013-04-24
==================

  * update builder

0.14.0 / 2013-04-23
==================

  * add .main to component-create(1) generated component.json for clarity
  * add component-info(1) tests
  * add Package#url() default of first remote
  * remove .addLookup() from component-build(1), now performed in Builder
  * update builder
  * fix a call to fn() that should be done()
  * fix UMD: use "this" instead of window for global

0.13.2 / 2013-03-26
==================

  * change error handling to treat non-404s as fatals
  * fix exit status of component(1)
  * fix current .remote usage in Package

0.13.1 / 2013-03-19
==================

  * update builder
  * fix component-info(1)
  * fix: install: do not create component.json if it doesn't exist
  * fix fatal detection
  * add explicit remotes using `-r <url>`

0.13.0 / 2013-02-24
==================

  * add: only one in-flight request per component (~50% perf increase). Closes #47
  * add --use flag
  * remove makefile and .gitignore from component-create local components

0.12.0 / 2013-02-15
==================

  * add -c, --copy option to copy files instead of symlinking
  * fix AMD support for modules exporting functions

0.11.1 / 2013-02-01
==================

  * add component link to component-create(1) template
  * add `make test-remotes`
  * add correct version of dependency to component.json when installing
  * update builder
  * remove term-css dep
  * fix ability to install dependencies from remote repos

0.11.0 / 2012-12-30
==================

  * add AMD support to --standalone. Closes #139
  * add component-ls(1) --depth support
  * add in `<path>` to getLocalJSON error
  * add in `<url>` message to JSON parsing errors
  * add g+ community link
  * change component-ls(1) to use tree view. Closes #204
  * remove empty build.css output. Closes #80
  * update builder
  * fix component-info(1) example typo

0.10.1 / 2012-12-07
==================

  * rename win-spawn to win-fork [fixes #170]

0.10.0 / 2012-12-04
==================

  * add source url support when in --dev mode
  * fix component-search(1) EPIPE with pagers. Closes #122
  * remove component-open(1)

0.9.1 / 2012-11-28
==================

  * add increase of installation performance 50% via gzip
  * add increase of search performance 50% via gzip
  * update builder

0.9.0 / 2012-11-06
==================

  * add `-l, --local` to `component-create(1)`. Closes #119
  * add module check to `component-build(1)` --standalone dance
  * add `.paths` lookup path array support. Closes #137
  * update builder for root main alias fix
  * remove __COMPONENT_PATH__ support. Closes #137

0.8.0 / 2012-11-04
==================

  * add `-p, --prefix <str>` support
  * add asset copying and url rewriting. Closes #52
  * add `.images` and `.fonts` support for installation

0.7.1 / 2012-11-02
==================

  * add error-handling for getFiles(). Closes #121
  * add error(res, url) helper

0.7.0 / 2012-10-31
==================

  * add implicit `--save` to `component-install(1)`. Closes #103
  * add recursive `.local` support to `component-install(1)`
  * add better local dep failure message
  * add `-l, --license` to `component-search(1)`. Closes #107
  * add `component.lookup(pkg)` function
  * add `component.dependenciesOf(pkg)` function
  * add History.md to `component-create(1)`. Closes #101
  * add default .license of "MIT" to `component-create(1)`
  * update builder

0.6.4 / 2012-10-26
==================

  * fix a component-install(1) bug where a 404 would not display an error [damian]

0.6.3 / 2012-10-24
==================

  * update builder for main alias fix

0.6.2 / 2012-10-22
==================

  * add component-create(1) support for existing dirs and files. Closes #58
  * add local sub-command resolution
  * improve some error handling
  * fix annoying node warning for existsSync()
  * fix utils.error() stderr

0.6.1 / 2012-10-22
==================

  * change "bundled" to "local"

0.6.0 / 2012-10-22
==================

  * add __COMPONENT_PATH__ support. Closes #30
  * add `component.paths()` helper function
  * update builder

0.5.0 / 2012-10-19
==================

  * add "main" support
  * fix `component-search(1)` when description is missing. Closes #83 [Tim Oxley]

0.4.2 / 2012-10-17
==================

  * fix silly component-install(1) bug attempting to read ./component.json. Closes #81

0.4.1 / 2012-10-16
==================

  * update builder

0.4.0 / 2012-10-15
==================

  * add `.remotes` support. Closes #6
  * add --name option to specify the base name of built files.
  * change --standalone name to be required. Closes #71
  * update builder dep, remove --dev cascading. Closes #69

0.3.0 / 2012-10-10
==================

  * add readme template for `component-create(1)` with more boilerplate
  * add default of `{}` for conf for direct installs
  * add `auth` support for basic authentication [Dan Williams]

0.2.0 / 2012-10-06
==================

  * add `component-search(1)` `--open` flag to view in browser. Closes #39
  * add `component-wiki(1)`. Closes #55
  * add "y" as "yes" support
  * add `component-install(1)` `--save` support
  * fix < 0.8.x support

0.1.1 / 2012-09-19
==================

  * add new "stdio" child process inherit option. Closes #45
  * update component(1) --help docs
  * remove special-casing of 127 exit status
  * remove component-register(1) from package.json
  * fix subcommand execution on windows [ForbesLindesay]

0.1.0 / 2012-09-18
==================

  * add remote search
  * add ★ to search output
  * add sorting by stars
  * add --json to `component-search(1)`
  * remove `component-register(1)`
  * change `component-search(1)` to use only verbose output

0.0.7 / 2012-09-14
==================

  * add `--standalone [name]` support to component-build(1). Closes #34
  * add memoized mkdir
  * add empty .development `{}` to component-create(1)
  * update component-builder
  * remove "which" dependency
  * remove logging from component-convert(1)
  * remove "component.json" dep of component target in component-create(1) makefile
  * rename devDependencies to development

0.0.6 / 2012-09-05
==================

  * add `--dev` to `component-create(1)` build command
  * add `component-build(1)` --dev flag. Closes #25
  * rename `devDependencies` to `development`
  * fix `component-create(1)` undefined.css. Closes#24

0.0.5 / 2012-09-04
==================

  * add `--standalone` to `component-build(1)`

0.0.4 / 2012-09-01
==================

  * add `.repo` to `component-create(1)`
  * add `.files` support. Closes #11
  * fix installation of files nested in dirs
  * change `component-register(1)` to use .repo prop
  * change `component-search(1)` query to be optional
  * change `component-search(1)` to join args

0.0.3 / 2012-08-30
==================

  * add missing commands to package.json

0.0.2 / 2012-08-30
==================

  * update commander.js for pull-request fail
