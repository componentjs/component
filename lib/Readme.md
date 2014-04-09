

Some random thoughts while working through the code and refactoring. Basically since everything is very coupled it's hard to get the abstraction right until you work your way through all of it, so keeping notes as I go.


##### Remote vs. Local

I have a suspicion a bunch of the logic can be divided into two camps. One for remote and one for local. By "remote" I mean things that need to hit the remote endpoints to be resolved. And by "local" I mean things that need to hit the file system to be resolved.

So for example on a `Component` there are two symmetrical methods: `remoteDependencies` and `localDependencies` that return the exact same list of components. One just gets them from GitHub (so it might have semver conflicts) and one gets them from the file system (so it might be incomplete).

To keep as much logic around the codebase similar as possible, I found that trying to use the same type of object whenever possible was nice. Those "package" objects look like this:

```js
{
  type: String,  // one of three types: 'root', 'remote', 'local'
  name: String,  // either 'json.name' or 'json.repository' depending on type
  conf: Object,  // a normalized copy of the json for less boilerplate logic
  json: Object   // the original json
}

{
  type: 'remote',      // these properties are specific to 'remote' packages
  remote: Remote,      // the Remote for the component, to download files
  repository: Object,  // a normalized object of the component's repo
  version: String      // the resolved version for a component
}

{
  type: 'local',  // these properties are specific to 'local' packages
  path: String    // the path to the package in the file system
}
```


##### Packages

I was debating actually using a `Package` instance for the above, so that we could attach some useful things to it like `.getPegs()` or `.eachDependency()` or similar. It got a little heavy-weight though, so I paused seeing if that works for now.

This would also solve the problem of the package "spec" being duplicated in each place (eg. `localDependencies` and `remoteDependencies`) that would initially read components.

I actually think that the potential holy grail is to get a single `Component` and with a `type` flag that switches based on whether it's constructed with a `dir` or `repo` (maybe a state machine?). And then the entire thing can just be recursive. 

Although potentially nevermind about that, because it can't be totally recursive for things like resolving versions across the whole tree?


##### Normalizing

To eliminate the need to put things like `dependencies || {}` everywhere, I've added a couple helpful normalizing functions:

  - `normalize.json()` - normalizing a package's `component.json` and makes it adhere to the newest [spec](https://github.com/component/spec)

  - `normalize.repository()` - normalizes what i've been calling a "repository" string, which looks like `github:component/type@~0.2.2`
  
There are problem more of these that might be useful to clean up the code and for plugin authors.

There's a chance these should actually live on the `Component` or `Package` instances themselves, since for example normalizing a JSON takes a `dev` flag and normalizing a repository _could_ take a `remotes` flag and error out for unknown ones.


##### Errors

I've tried to make errors have as much information on them as possible so that we can give nice messages to the user in the CLI. The `logger` can also be used by plugin authors, and has a `logger.fatal` method that will nicely format errors that it recognizes. That way everyone doesn't have to re-implement things like `'No component.json found in that directory.'`.

I was also thinking about making `logger.fatal` return if there was no error passed, so it could be super-terse passed as a leaf-node callback for things like: `component.install(logger.fatal)`.


##### Locals
