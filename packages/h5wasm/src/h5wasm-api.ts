import type { ValuesStoreParams } from '@h5web/app';
import { convertDtype, ProviderApi } from '@h5web/app';
import { getNameFromPath } from '@h5web/app/src/providers/utils';
import type {
  AttributeValues,
  Dataset,
  Entity,
  Group,
  GroupWithChildren,
  UnresolvedEntity,
} from '@h5web/shared';
import {
  assertNonNull,
  buildEntityPath,
  DTypeClass,
  EntityKind,
} from '@h5web/shared';
import { File as H5WasmFile, FS, ready as h5wasmReady } from 'h5wasm';

import type { H5WasmAttribute, H5WasmEntity } from './models';
import {
  assertH5WasmDataset,
  assertH5WasmEntityWithAttrs,
  isH5WasmDataset,
  isH5WasmGroup,
  isHDF5,
} from './utils';

export class H5WasmApi extends ProviderApi {
  private readonly file: Promise<H5WasmFile>;

  public constructor(filename: string, buffer: ArrayBuffer) {
    super(filename);

    if (!isHDF5(buffer)) {
      throw new Error('Expected valid HDF5 file');
    }

    this.file = this.initFile(buffer);
  }

  public async getEntity(path: string): Promise<Entity> {
    const h5wEntity = await this.getH5WasmEntity(path);
    return this.processH5WasmEntity(getNameFromPath(path), path, h5wEntity);
  }

  public async getValue(params: ValuesStoreParams): Promise<unknown> {
    const { dataset } = params;

    const h5wDataset = await this.getH5WasmEntity(dataset.path);
    assertH5WasmDataset(h5wDataset);

    return h5wDataset.value;
  }

  public async getAttrValues(entity: Entity): Promise<AttributeValues> {
    const h5wEntity = await this.getH5WasmEntity(entity.path);
    assertH5WasmEntityWithAttrs(h5wEntity);

    return Object.fromEntries(
      Object.entries(h5wEntity.attrs).map(([name, attr]) => {
        return [name, (attr as H5WasmAttribute).value];
      })
    );
  }

  public async cleanUp(): Promise<void> {
    const file = await this.file;
    file.close();
  }

  private async initFile(buffer: ArrayBuffer): Promise<H5WasmFile> {
    await h5wasmReady;

    // `FS` is guaranteed to be defined once H5Wasm is ready
    // https://github.com/silx-kit/h5web/pull/1082#discussion_r858613242
    assertNonNull(FS);

    // Write file to Emscripten virtual file system
    // https://emscripten.org/docs/api_reference/Filesystem-API.html#FS.writeFile
    FS.writeFile(this.filepath, new Uint8Array(buffer), { flags: 'w+' });

    return new H5WasmFile(this.filepath, 'r');
  }

  private async getH5WasmEntity(path: string): Promise<H5WasmEntity> {
    const file = await this.file;

    const h5wEntity = file.get(path);
    assertNonNull(h5wEntity, `No entity found at ${path}`);

    return h5wEntity;
  }

  private processH5WasmEntity(
    name: string,
    path: string,
    h5wEntity: H5WasmEntity,
    isChild = false
  ): Entity {
    const baseEntity = { name, path };

    if (isH5WasmGroup(h5wEntity)) {
      const baseGroup: Group = {
        ...baseEntity,
        kind: EntityKind.Group,
        attributes: this.processH5WasmAttrs(h5wEntity.attrs),
      };

      if (isChild) {
        return baseGroup;
      }

      const children = h5wEntity.keys().map((name) => {
        const h5wChild = h5wEntity.get(name);
        assertNonNull(h5wChild);

        const childPath = buildEntityPath(path, name);
        return this.processH5WasmEntity(name, childPath, h5wChild, true);
      });

      return { ...baseGroup, children } as GroupWithChildren;
    }

    if (isH5WasmDataset(h5wEntity)) {
      const { shape, dtype } = h5wEntity;

      return {
        ...baseEntity,
        kind: EntityKind.Dataset,
        attributes: this.processH5WasmAttrs(h5wEntity.attrs),
        shape,
        type:
          typeof dtype === 'string'
            ? convertDtype(dtype)
            : { class: DTypeClass.Compound, fields: dtype.compound },
        rawType: dtype,
      } as Dataset;
    }

    return {
      ...baseEntity,
      kind: EntityKind.Unresolved,
    } as UnresolvedEntity;
  }

  private processH5WasmAttrs(h5wAttrs: Record<string, unknown>) {
    return Object.entries(h5wAttrs).map(([name, attr]) => {
      const { shape, dtype } = attr as H5WasmAttribute;
      return { name, shape, type: convertDtype(dtype) };
    });
  }
}