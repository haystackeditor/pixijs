import { ExtensionType } from '../../../extensions/Extensions';
import { generateUboSyncPolyfillSTD40 } from '../../../unsafe-eval/ubo/generateUboSyncPolyfill';
import { UboSystem } from '../shared/shader/UboSystem';
import { createUboElementsSTD40 } from './shader/utils/createUboElementsSTD40';

/**
 * System plugin to the renderer to manage uniform buffers. But with an WGSL adaptor.
 * @memberof rendering
 */
export class GlUboSystem extends UboSystem
{
    /** @ignore */
    public static extension = {
        type: [ExtensionType.WebGLSystem],
        name: 'ubo',
    } as const;

    constructor()
    {
        super({
            createUboElements: createUboElementsSTD40,
            generateUboSync: generateUboSyncPolyfillSTD40,
        });
    }
}
