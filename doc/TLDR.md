# Too Long, Didn't Read

The [tutorial](./tutorial.md) has more detailed info...

Basic svelte app with html, index.js script to bootstrap, and one component.

Create a `src/editors` directory that will have script files to be used as
entry points.  This will put them in a separate location and let build them
all with wildcards:

```text
|--- src
|    |--- editor
|    |    |--- index.js
|    |    |--- ts.worker.js
|    |    |--- editor.worker.js
|    |--- index.html
|    |--- index.js
|    |--- App.svelte
```

index.js (note the workers will go in `/dist/editor` because they are
will be entry points):

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

ts.worker.js:

```js
import 'monaco-editor/esm/vs/language/typescript/ts.worker.js'
```

editor.worker.js:

```js
import 'monaco-editor/esm/vs/editor/editor.worker.js'
```

Edit the scripts in package.json to tell parcel to use everything
in the 'src/editor' directory as an entry point, this will create
separate fields for the workers and the index file that will have
the editor.

```json
  "scripts": {
    "start": "parcel src/index.html src/editor/*",
    "watch": "parcel watch src/index.html src/editor/*",
    "build": "parcel build src/index.html src/editor/*"
  },
```

Import the editor using parcel's async import in the `onMount` lifecycle
event in `App.svelte`:

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
        value: `function say(message) {\n\talert(message)\n}\n\nsay('Hello, world!')`,
        language: "typescript"
      });
    });
  });
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

  <div id="editor" />
</div>
```

