'use strict';

function buildWorkerCode(source, moduleType) {
  let result = `const WORKER_CODE = ${JSON.stringify(source)};
let WORKER_URL = null;
class WorkerInstance
{
    constructor()
    {
        if (!WORKER_URL)
        {
            const trustedTypes = typeof window !== 'undefined' && typeof window.trustedTypes !== 'undefined' ? window.trustedTypes.createPolicy('pixi', {
                createScriptURL: (value) => value,
            }) : undefined;
            WORKER_URL = URL.createObjectURL(new Blob([WORKER_CODE], { type: 'application/javascript' }));
            WORKER_URL = trustedTypes.createScriptURL(WORKER_URL)
        }
        this.worker = new Worker(WORKER_URL);
    }
}
WorkerInstance.revokeObjectURL = function revokeObjectURL()
{
    if (WORKER_URL)
    {
        URL.revokeObjectURL(WORKER_URL);
        WORKER_URL = null;
    }
}
`;
  switch (moduleType) {
    case "cjs": {
      result += "module.exports = WorkerInstance;";
      break;
    }
    case "esm": {
      result += "export default WorkerInstance;";
      break;
    }
    default: {
      throw new Error(`Unknown module type: ${moduleType}`);
    }
  }
  return result;
}

exports.buildWorkerCode = buildWorkerCode;
//# sourceMappingURL=index.js.map
