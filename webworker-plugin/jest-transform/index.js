'use strict';

var tsJest = require('ts-jest');
var index$1 = require('../core/index.js');

var index = {
  process(sourceText, sourcePath, config, options) {
    const tsTransformer = tsJest.createTransformer();
    const transformedCode = tsTransformer.process(sourceText, sourcePath, config, options);
    return index$1.buildWorkerCode(transformedCode, "cjs");
  }
};

module.exports = index;
//# sourceMappingURL=index.js.map
