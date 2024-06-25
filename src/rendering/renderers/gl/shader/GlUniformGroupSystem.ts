import { ExtensionType } from '../../../../extensions/Extensions';
// eslint-disable-next-line max-len
import { uniformArrayParserFunctions, uniformParserFunctions, uniformSingleParserFunctions } from '../../../../unsafe-eval/uniforms/uniformSyncFunctions';
import { uniformParsers } from '../../shared/shader/utils/uniformParsers';

import type { UniformUploadFunction } from '../../../../unsafe-eval/uniforms/uniformSyncFunctions';
import type { UniformsSyncCallback } from '../../shared/shader/types';
import type { UniformGroup } from '../../shared/shader/UniformGroup';
import type { System } from '../../shared/system/System';
import type { GlRenderingContext } from '../context/GlRenderingContext';
import type { WebGLRenderer } from '../WebGLRenderer';
import type { GlProgram, GlUniformData } from './GlProgram';

/**
 * System plugin to the renderer to manage shaders.
 * @memberof rendering
 */
export class GlUniformGroupSystem implements System
{
    /** @ignore */
    public static extension = {
        type: [
            ExtensionType.WebGLSystem,
        ],
        name: 'uniformGroup',
    } as const;

    /**
     * The current WebGL rendering context.
     * @member {WebGLRenderingContext}
     */
    protected gl: GlRenderingContext;

    /** Cache to holds the generated functions. Stored against UniformObjects unique signature. */
    private _cache: Record<string, UniformsSyncCallback> = {};
    private _renderer: WebGLRenderer;

    private _uniformGroupSyncHash: Record<string, Record<string, UniformsSyncCallback>> = {};

    /** @param renderer - The renderer this System works for. */
    constructor(renderer: WebGLRenderer)
    {
        this._renderer = renderer;

        this.gl = null;
        this._cache = {};
    }

    protected contextChange(gl: GlRenderingContext): void
    {
        this.gl = gl;
    }

    /**
     * Uploads the uniforms values to the currently bound shader.
     * @param group - the uniforms values that be applied to the current shader
     * @param program
     * @param syncData
     * @param syncData.textureCount
     */
    public updateUniformGroup(group: UniformGroup, program: GlProgram, syncData: { textureCount: number }): void
    {
        const programData = this._renderer.shader._getProgramData(program);

        if (!group.isStatic || group._dirtyId !== programData.uniformDirtyGroups[group.uid])
        {
            programData.uniformDirtyGroups[group.uid] = group._dirtyId;

            const syncFunc = this._getUniformSyncFunction(group, program);

            syncFunc(programData.uniformData, group.uniforms, this._renderer, syncData);
        }
    }

    /**
     * Overrideable by the pixi.js/unsafe-eval package to use static syncUniforms instead.
     * @param group
     * @param program
     */
    private _getUniformSyncFunction(group: UniformGroup, program: GlProgram): UniformsSyncCallback
    {
        return this._uniformGroupSyncHash[group._signature]?.[program._key]
            || this._createUniformSyncFunction(group, program);
    }

    private _createUniformSyncFunction(group: UniformGroup, program: GlProgram): UniformsSyncCallback
    {
        const uniformGroupSyncHash = this._uniformGroupSyncHash[group._signature]
            || (this._uniformGroupSyncHash[group._signature] = {});

        const id = this._getSignature(group, program._uniformData, 'u');

        if (!this._cache[id])
        {
            this._cache[id] = this._generateUniformsSync(group, program._uniformData);
        }

        uniformGroupSyncHash[program._key] = this._cache[id];

        return uniformGroupSyncHash[program._key];
    }

    private _generateUniformsSync(group: UniformGroup, uniformData: Record<string, GlUniformData>): UniformsSyncCallback
    {
    // loop through all the uniforms..
        const functionMap: Record<string, UniformUploadFunction> = {};

        for (const i in group.uniformStructures)
        {
            if (!uniformData[i]) continue;

            const uniform = group.uniformStructures[i];

            let parsed = false;

            for (let j = 0; j < uniformParsers.length; j++)
            {
                const parser = uniformParsers[j];

                if (uniform.type === parser.type && parser.test(uniform))
                {
                    functionMap[i] = uniformParserFunctions[j];

                    parsed = true;

                    break;
                }
            }

            // if not parsed...

            if (!parsed)
            {
                const templateType = uniform.size === 1 ? uniformSingleParserFunctions : uniformArrayParserFunctions;

                functionMap[i] = templateType[uniform.type];
            }
        }

        return (
            ud: Record<string, any>,
            uv: Record<string, any>,
            renderer: WebGLRenderer) =>
        {
            const gl = renderer.gl;

            for (const i in functionMap)
            {
                const v = uv[i];
                const cu = ud[i];
                const cv = ud[i].value;

                functionMap[i](i, cu, cv, v, ud, uv, gl);
            }
        };
    }

    /**
     * Takes a uniform group and data and generates a unique signature for them.
     * @param group - The uniform group to get signature of
     * @param group.uniforms
     * @param uniformData - Uniform information generated by the shader
     * @param preFix
     * @returns Unique signature of the uniform group
     */
    private _getSignature(group: UniformGroup, uniformData: Record<string, any>, preFix: string): string
    {
        const uniforms = group.uniforms;

        const strings = [`${preFix}-`];

        for (const i in uniforms)
        {
            strings.push(i);

            if (uniformData[i])
            {
                strings.push(uniformData[i].type);
            }
        }

        return strings.join('-');
    }

    /** Destroys this System and removes all its textures. */
    public destroy(): void
    {
        this._renderer = null;
        this._cache = null;
    }
}
