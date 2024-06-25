'use strict';

var path = require('path');
var rollup = require('rollup');
var index$1 = require('../core/index.js');

const PLUGIN_NAME = "@pixi/webworker-plugins/rollup-plugin";
const VIRTUAL_MODULE_PREFIX = `\0${PLUGIN_NAME}:`;
const DEFAULT_OPTIONS = {
  worker: {
    pattern: /worker:(.+\.worker\.[cm]?[jt]s)/,
    assertionType: "worker"
  }
};
var index = () => {
  const state = {
    exclude: /* @__PURE__ */ new Set(),
    options: null
  };
  return {
    name: PLUGIN_NAME,
    options(options) {
      state.options = options;
      return null;
    },
    resolveId(source, importer, options) {
      let importee = null;
      const assertType = options.assertions.type;
      if (assertType === DEFAULT_OPTIONS.worker.assertionType)
        importee = source;
      else {
        const patternMatch = source.match(DEFAULT_OPTIONS.worker.pattern);
        if (patternMatch)
          importee = patternMatch[1];
      }
      if (importee === null)
        return null;
      const resolvedPath = path.resolve(importer ? path.resolve(importer, "..") : ".", importee);
      const id = VIRTUAL_MODULE_PREFIX + resolvedPath;
      if (state.exclude.has(id))
        return null;
      return {
        id,
        assertions: { type: DEFAULT_OPTIONS.worker.assertionType }
      };
    },
    async load(id) {
      if (!id.startsWith(VIRTUAL_MODULE_PREFIX))
        return null;
      const source = id.slice(VIRTUAL_MODULE_PREFIX.length);
      state.exclude.add(id);
      const bundle = await rollup.rollup({
        plugins: state.options?.plugins,
        input: source
      });
      state.exclude.delete(id);
      const output = await bundle.generate({
        format: "iife",
        name: "WorkerLoader"
      });
      const workerCode = output.output[0].code;
      const code = index$1.buildWorkerCode(workerCode, "esm");
      return {
        code,
        assertions: { type: DEFAULT_OPTIONS.worker.assertionType }
      };
    }
  };
};

module.exports = index;
//# sourceMappingURL=index.js.map
