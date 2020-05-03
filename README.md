# [monaco-editor] using [parceljs]

This is a sample showing using [monaco-editor] with [parceljs]
that happens to use [svelte].

## Why?

Trying to write a chrome extension with multiple pages and different
scripts and css for things like options, page overrides, popup,
backgrouind, and content scripts was a pain until I
fouind [parceljs].  There is zero configuration, you just pass
the files you want and it uses each one as an entry point and
creates the files in the dist directory.  There's a [parcel-plugin-web-extension]
for extension manifests so you only have to specify the manifest and
it will find all the scripts, pages, and css (or scss) files in
the manifest and process them all.  Beautiful...

In the extension I wanted to allow the user to create and edit scripts
and style overrides for any web page, so I thought I'd check out [monaco-editor].
Their [monaco parceljs example] left something to be desired, I really
didn't want to have to have a separate step in my build process running
a bash script to create the workers.

I wanted to check out [svelte] to evaluate it and I'm liking it.
Their [tutorial] is awesome and has a [repl] where you can create
and save projects with multiple files, a really nice svelte version
of jsfiddle or codepen.

## Tutorial

### 1: Init project

Initialize node project and git:

  mkdir parcel-svelte-monaco-editor
  cd parcel-svelte-monaco-editor
  npm init
  git init

Then add simple `.gitignore` for parceljs:

```text
node_modules
dist
.cache
```

### 2. Add requirements

I use yarn, so do `npm install -g yarn` if you haven't.

We're going to use [parceljs] and [svelte]:

```text
yarn add svelte parcel-plugin-svelte parcel-bundler
```

And we're going to use [monaco-editor]:

```text
yarn add monaco-editor
```

### 3. Starter page

Here will be the basic structure:

```text
|--- src
|    |--- index.html
|    |--- index.js
|    |--- App.svelte
```

`index.html` is pretty simple, it just loads the `index.js` script
that bootstraps the single `App.svelte` component.

```html
<html>
  <head>
    <title>monaco-editor witih parceljs and svelte</title>
  </head>

  <body>
    <script src="index.js"></script>
  </body>
</html>
```

`index.js` bootstraps the svelte component:

```js
import App from './App.svelte';

const app = new App({ target: document.body });

export default app;
```

`App.svelte` is the svelte component.  If you're new to [svelte], it's
basically like an html file that can contain script and style sections.
This style creates a full-page div container with a header and the editor
taking up the remaining space.

```html
<script>
</script>

<style>
  div.container {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    justify-content: stretch;
  }

  div.header {
    border-bottom: solid 1px black;
    flex: 0 1 auto;
    background-color: #e0e0f4;
  }

  div#editor {
    flex: 1 1 auto;
  }
</style>

<div class="container">
  <div class="header">
    <h1>Monaco Editor test</h1>
  </div>

  <div id="editor">Editor will go here</div>
</div>
```

And setup the scripts pin `package.json`:

```json
  "scripts": {
    "start": "parcel src/index.html",
    "watch": "parcel watch src/index.html",
    "build": "parcel build src/index.html"
  },
```

Now we can view our beautiful nearly empty page.  Run this to
serve your app and automatically rebuild when you make changes:

```text
yarn start
```

And open your browser to: [http://localhost:1234](http://localhost:1234)

### 3. Add [monaco-editor]

[monaco-editor] uses web workers to offload some processing for the editor,
syntax highlighting, and code completion.  The [monaco parceljs example] would
have you create a separate index file and run a script to do builds for each of
the workers that go to your dist directory, but that seems like a pain.

Let's get started by adding the editor.  The editor will use `localStorage`
to save the text.  Add this to the `<script></script>` section in `App.svelte`:

```js
  import { onMount } from 'svelte'
  import { editor as monacoEditor } from 'monaco-editor'

  let editor;

  onMount(() => {
    editor = monacoEditor.create(
      document.getElementById('editor'), {
        automaticLayout: true, // resize automatically with window
        value: `function say(message) {\n\talert(message)\n}\n\nsay('Hello, world!')`,
        language: 'typescript'
      });
  })
```

You should also remove the sample text from the #editor div:

```html
  <div id="editor" />
```

That's all you *really* need!  If you refresh your browser you will now see the editor
and you can use it.  

There are problems.  First the editor is now bundled with our soruce code, and since
it's 6.2mb that's not good.  ParecelJS and svelte usually produce very tiny and fast
bundles.  With the editor bundled like this, the whole file has to be compiled before
there can be interaction on the page.  Go to the network tab, disable cache, and
change the speed to 'Fast 3G' and you'll see.

Also there are some errors in the console because [monaco-editor] can't find the web
workers it wants to use to enable things like code completion for typescript and
colorizing for css.

### 4. Splitting the editor

There are a few caveats.  If you look in the `dist` directory you may be surprised. 
There are files for each of the supported languages.  They are only loaded when needed
though and I don't know how to move them at the moment.

However our 'src' bundle is now 6.2mb.  It would be better if we could lazy-load the editor
and have the base page load faster, as well as re-use the editor in different pages if we
wanted to.

Also there are some errors in the console because [monaco-editor] can't load the web workers
it is expecting to see.  If you 

[parceljs] supports lazy module loading.  Let's create a new `editor` directory and
file `src/editor/index.js` to re-export the module. We will use the editor directory
as a place for entry points for editor-related modules.  This file will just re-export
the 'editor' from 'monaco-editor':

```js
import { editor as monacoEditor } from 'monaco-editor'

export default monacoEditor;
```

The structure should look like this:

```text
|--- src
|    |--- editor
|    |    |--- index.js
|    |--- index.html
|    |--- index.js
|    |--- App.svelte
```



Now in `App.svelte` we use `import()` as a function to lazy-load the module:

```html
<script>
  import { onMount } from "svelte";

  let monacoEditor;

  let editor;

  onMount(() => {
    import("./editor/index").then(mod => {
      monacoEditor = mod.default;
      editor = monacoEditor.create(document.getElementById("editor"), {
        automaticLayout: true, // resize automatically with window
        value: `function say(message) {\n\talert(message)\n})\n\nsay('Hello, world!')`,
        language: "typescript"
      });
    });
  });
</script>
```

Now if you go to the chrome network tab, click 'Disable cache', and change the speed to 'Fast 3G'
then refresh the page, you will see our src bundle is now only 74k and loads in just over a second
and the page is displayed.  The 6.2mb 'index.js' bundle now takes 34 seconds to load and
make the editor available.

The editor is now `editor.f784ca51.js` in `dist`.  Now let's put that into `dist/editor`.  We'll
do that by adding it as an entry point to our scripts in `package.json`, which we'll be doing for
the workers as well, so let's use a wildcard to make anything in the `editor` directory an entry point:

```json
  "scripts": {
    "start": "parcel src/index.html src/editor/*",
    "watch": "parcel watch src/index.html src/editor/*",
    "build": "parcel build src/index.html src/editor/*"
  },
```

You'll have to cancel and re-run `yarn start` and now you'll see the output js and css for
the editor has moved to the `dist/editor` directory.  This is becaue [parceljs] has recognized
`index.js` as an entry point and put the output relative to your `src` directory.

### 5. Web Workers

Looking at the [monaco parceljs example], we need to build the web workers and configure the
environment for them.  Right now we just need `editor.worker.js` and `ts.worker.js`.  Let's create
entry points for them in `editor` and just import those modules:

```js
// src/editor/editor.worker.js
import 'monaco-editor/esm/vs/editor/editor.worker.js'
```

```js
// src/editor/ts.worker.js
import 'monaco-editor/esm/vs/language/typescript/ts.worker.js'
```


Parcel will not recognize the new entry points right away because they are bundled with hashes.
To get them to the proper place just kill and re-run `yarn start`.  Now they should be in
the `dist/editor` directory.  We can specify their locations by using modified
code from the example.  Change `src/editor/index.js` to include setting the `MonacoEnvironment`:

```js
const locations = {
  'css': '/editor/css.worker.js',
  'typescript': '/editor/ts.worker.js',
  'javascript': '/editor/ts.worker.js',
  'json': '/editor/json.worker.js',
  'html': '/editor/html.worker.js',
  'editor': '/editor/editor.worker.js',
}
self.MonacoEnvironment = {
  getWorkerUrl: function(moduleId, label) {
    return locations[label] || locations['editor'];
  },
};

import { editor as monacoEditor } from 'monaco-editor'

export default monacoEditor;
```

### Done

Refresh the page and there will be no errors and the typescript functionality will work as expected.
If you star typing `say(` or `document.` now it will allow code completion.  I only showed
the ts and editor workers, but you could create hte fiels for `css`, `json`, and `html` the same way.


[svelte]: https://svelte.dev/
[parceljs]: https://parceljs.org/
[monaco-editor]: https://microsoft.github.io/monaco-editor/
[monaco parceljs example]: https://github.com/microsoft/monaco-editor/blob/master/docs/integrate-esm.md



[monaco-editor]: https://microsoft.github.io/monaco-editor/
[svelte]: https://svelte.dev/
[parceljs]: https://parceljs.org/
[parcel-plugin-web-extension]: https://www.npmjs.com/package/parcel-plugin-web-extension
[tutorial]: https://svelte.dev/tutorial/basics
[repl]: https://svelte.dev/repl/hello-world?version=3.21.0
[monaco parceljs example]: https://github.com/microsoft/monaco-editor/blob/master/docs/integrate-esm.md
