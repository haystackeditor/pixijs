import { ExtensionType } from '../../../extensions/Extensions';
import { generateUboSyncPolyfillWGSL } from '../../../unsafe-eval/ubo/generateUboSyncPolyfill';
import { UboSystem } from '../shared/shader/UboSystem';
import { createUboElementsWGSL } from './shader/utils/createUboElementsWGSL';

/**
 * System plugin to the renderer to manage uniform buffers. With a WGSL twist!
 * @memberof rendering
 */
export class GpuUboSystem extends UboSystem
{
    /** @ignore */
    public static extension = {
        type: [ExtensionType.WebGPUSystem],
        name: 'ubo',
    } as const;

    constructor()
    {
        super({
            createUboElements: createUboElementsWGSL,
            generateUboSync: generateUboSyncPolyfillWGSL,
        });
    }
}
