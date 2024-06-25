import tsJest from 'ts-jest';
import { buildWorkerCode } from '../core/index.mjs';

var index = {
  process(sourceText, sourcePath, config, options) {
    const tsTransformer = tsJest.createTransformer();
    const transformedCode = tsTransformer.process(sourceText, sourcePath, config, options);
    return buildWorkerCode(transformedCode, "cjs");
  }
};

export { index as default };
//# sourceMappingURL=index.mjs.map
