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
