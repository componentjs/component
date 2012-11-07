
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
