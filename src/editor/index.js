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
