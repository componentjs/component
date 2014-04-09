

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

I've held off on implementing `locals` logic so far, since with the `type` property I'm less worried about it working out. The other reason is because there's potentially a way to remove the entire concept of locals (in a way that would be backwards compat for public components, where it matters most) that I'd want to discuss.

Potentially controversial, but just keep an open mind while reading :)

Before I get into the Javascript side of it, a brief interlude about CSS. One of the weaknesses of Component has been that it doesn't respect CSS ordering. I think this is fixed in the most recent builder, but the root cause for why CSS ordering has been a pain wasn't obvious to me until now. For Javascript, ordering isn't an issue because you just require the piece of code you want exactly where you want it in the source.

For CSS, all of the ordering is defined in the `component.json` itself, instead of the source. But! If we moved to a solution like what browserify or npm-css or those tools do, with `@import` rules in CSS, we could actually define the order of dependencies much more clearly in CSS itself. I think this would be a ton more intuitive for users and make the handling of a tree of CSS dependencies in order pretty simple.

However, it would require parsing the files. Before you think about that, back to Javascript for a second...

One thing that people tend to like a lot about browserify and node in general is that they don't have to define all of their files up front, they get to just `require` any file in the tree and it "just works". This is one of the major sticking points people have when trying out component. 

However, those niceties also require parsing the files.

What's that have to do with locals? Well parsing the files could also mean we can get rid of the entire concept of locals. The problem with locals is that they masquerade as being loosely-coupled to the codebase, but really they are unversioned so any change will break all of the modules they are required by. Since we have GitHub, using private repositories and a `.netrc` is pretty trivial instead if people want to have properly versioned private components.

Instead, the idea of `paths: ['lib']`, which tends to be super confusing to users anyways, could be replaced by straightforward `require('../lib/component')` in Javascript and `@require ../lib/component` in CSS. That would be more explicit, and reflect the true tight-coupling of the locals to begin with.

So basically, if you combine all of those pros, we get:

  - The ability to stop defining all files in `component.json`.
  - The ability to intuitively define CSS ordering in the source.
  - The ability to choose not to add CSS, like you could with Javascript already by just ommitting the `require` call.
  - To do away with the `locals` concept altogether, which greatly simplifies the abstraction for dealing with dependencies.

Of course the downside is that install and build times have the potential to increase. I don't have enough information about how much they would increase by, but there might be other smart things we can do there to keep the times down. Building scripts and styles separately (also planned) would be another way to cut down on times with `mtime` checking.