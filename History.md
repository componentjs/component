
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
  * remove special-casing of 127 exit status
  * fix subcommand execution on windows [ForbesLindesay]
  * update component(1) --help docs
  * remove component-register(1) from package.json

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
