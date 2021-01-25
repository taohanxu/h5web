import { Datatype, Entity, EntityKind, Group, Link } from '../models';
import {
  HDF5Attribute,
  HDF5CompoundType,
  HDF5Dims,
  HDF5ExternalLink,
  HDF5FloatType,
  HDF5IntegerType,
  HDF5Link,
  HDF5LinkClass,
  HDF5NumericType,
  HDF5ScalarShape,
  HDF5Shape,
  HDF5ShapeClass,
  HDF5SimpleShape,
  HDF5StringType,
  HDF5Type,
  HDF5TypeClass,
  HDF5Value,
} from '../hdf5-models';
import type { NxInterpretation, SilxStyle } from '../../vis-packs/nexus/models';
import { isGroup } from '../../guards';
import { buildEntityPath } from '../../utils';
import type { MockDataset, MockValueId } from './models';
import { mockValues } from './values';

/* -------------------------- */
/* ----- TYPES & SHAPES ----- */

export const intType: HDF5IntegerType = {
  class: HDF5TypeClass.Integer,
  base: 'H5T_STD_I32LE',
};

export const floatType: HDF5FloatType = {
  class: HDF5TypeClass.Float,
  base: 'H5T_IEEE_F64LE',
};

export const stringType: HDF5StringType = {
  class: HDF5TypeClass.String,
  charSet: 'H5T_CSET_ASCII',
  strPad: 'H5T_STR_NULLPAD',
  length: 'H5T_VARIABLE',
};

export const compoundType: HDF5CompoundType = {
  class: HDF5TypeClass.Compound,
  fields: [{ name: 'int', type: intType }],
};

export const scalarShape: HDF5ScalarShape = { class: HDF5ShapeClass.Scalar };

export function makeSimpleShape(dims: HDF5Dims): HDF5SimpleShape {
  return { class: HDF5ShapeClass.Simple, dims };
}

/* ---------------------- */
/* ----- ATTRIBUTES ----- */

export function makeAttr(
  name: string,
  shape: HDF5Shape,
  type: HDF5Type,
  value: HDF5Value
): HDF5Attribute {
  return { name, type, shape, value };
}

export function makeStrAttr(name: string, value: string): HDF5Attribute {
  return makeAttr(name, { class: HDF5ShapeClass.Scalar }, stringType, value);
}

export function makeIntAttr(name: string, value: number): HDF5Attribute {
  return makeAttr(name, { class: HDF5ShapeClass.Scalar }, intType, value);
}

export function withAttributes<T extends Entity>(
  entity: T,
  attributes: HDF5Attribute[]
): T {
  return {
    ...entity,
    attributes: [...entity.attributes, ...attributes],
  };
}

/* -------------------- */
/* ----- ENTITIES ----- */

type EntityOpts = Partial<Pick<Entity, 'attributes' | 'rawLink'>>;
type GroupOpts = EntityOpts & { isRoot?: boolean; children?: Entity[] };
type DatasetOpts = EntityOpts & { valueId?: MockValueId };

function prefixChildrenPaths(group: Group, parentPath: string): void {
  group.children.forEach((c) => {
    c.path = buildEntityPath(parentPath, c.path.slice(1));

    if (isGroup(c)) {
      prefixChildrenPaths(c, parentPath);
    }
  });
}

export function makeGroup(
  name: string,
  children: Entity[] = [],
  opts: Omit<GroupOpts, 'children'> = {}
): Group {
  const { attributes = [], rawLink, isRoot = false } = opts;
  const path = isRoot ? '/' : `/${name}`;

  const group: Group = {
    name,
    path,
    kind: EntityKind.Group,
    children,
    attributes,
    rawLink,
  };

  prefixChildrenPaths(group, path);
  return group;
}

export function makeDataset<S extends HDF5Shape, T extends HDF5Type>(
  name: string,
  shape: S,
  type: T,
  opts: DatasetOpts = {}
): MockDataset<S, T> {
  const { attributes = [], valueId = name, rawLink } = opts;

  return {
    name,
    path: `/${name}`,
    kind: EntityKind.Dataset,
    attributes,
    shape,
    type,
    value: mockValues[valueId as MockValueId],
    rawLink,
  };
}

export function makeSimpleDataset<T extends HDF5Type>(
  name: string,
  type: T,
  dims: HDF5Dims,
  opts: DatasetOpts = {}
): MockDataset<HDF5SimpleShape, T> {
  return makeDataset(name, makeSimpleShape(dims), type, opts);
}

export function makeDatatype<T extends HDF5Type>(
  name: string,
  type: T,
  opts: EntityOpts = {}
): Datatype<T> {
  const { attributes = [], rawLink } = opts;

  return {
    name,
    path: `/${name}`,
    kind: EntityKind.Datatype,
    attributes,
    type,
    rawLink,
  };
}

function makeLink<T extends HDF5Link>(rawLink: T): Link<T> {
  return {
    name: rawLink.title,
    path: `/${rawLink.title}`,
    kind: EntityKind.Link,
    attributes: [],
    rawLink,
  };
}

export function makeExternalLink(
  name: string,
  file: string,
  h5path: string
): Link<HDF5ExternalLink> {
  return makeLink({
    class: HDF5LinkClass.External,
    title: name,
    file,
    h5path,
  });
}

/* ----------------- */
/* ----- NEXUS ----- */

export function makeNxAxesAttr(axes: string[]): HDF5Attribute {
  return makeAttr('axes', makeSimpleShape([axes.length]), stringType, axes);
}

export function makeSilxStyleAttr(style: SilxStyle): HDF5Attribute {
  const { signalScaleType, axesScaleType } = style;

  return makeStrAttr(
    'SILX_style',
    JSON.stringify({
      signal_scale_type: signalScaleType,
      axes_scale_type: axesScaleType,
    })
  );
}

export function makeNxGroup(
  name: string,
  type: 'NXroot' | 'NXentry' | 'NXprocess' | 'NXdata',
  opts: { defaultPath?: string } & GroupOpts = {}
): Group {
  const { defaultPath, children, ...groupOpts } = opts;

  return makeGroup(name, children, {
    ...groupOpts,
    attributes: [
      ...(groupOpts.attributes || []),
      makeStrAttr('NX_class', type),
      ...(defaultPath ? [makeStrAttr('default', defaultPath)] : []),
    ],
  });
}

export function makeNxDataGroup<
  T extends Record<string, MockDataset<HDF5SimpleShape, HDF5NumericType>>
>(
  name: string,
  opts: {
    signal: MockDataset<HDF5SimpleShape, HDF5NumericType>;
    errors?: MockDataset<HDF5SimpleShape, HDF5NumericType>;
    title?: MockDataset<HDF5ScalarShape, HDF5StringType>;
    silxStyle?: SilxStyle;
  } & (
    | { axes: T; axesAttr: (Extract<keyof T, string> | '.')[] }
    | { axes?: never; axesAttr?: never }
  ) &
    GroupOpts
): Group {
  const {
    signal,
    title,
    errors,
    silxStyle,
    axes = {},
    axesAttr,
    ...groupOpts
  } = opts;

  return makeNxGroup(name, 'NXdata', {
    ...groupOpts,
    attributes: [
      ...(groupOpts.attributes || []),
      makeStrAttr('signal', signal.name),
      ...(axesAttr ? [makeNxAxesAttr(axesAttr)] : []),
      ...(silxStyle ? [makeSilxStyleAttr(silxStyle)] : []),
    ],
    children: [
      signal,
      ...(title ? [title] : []),
      ...(errors ? [errors] : []),
      ...Object.values<MockDataset>(axes),
    ],
  });
}

export function makeNxDataset(
  name: string,
  type: HDF5NumericType,
  dims: HDF5Dims,
  opts: {
    interpretation?: string;
    longName?: string;
    units?: string;
  } & DatasetOpts = {}
): MockDataset<HDF5SimpleShape, HDF5NumericType> {
  const { interpretation, longName, units, ...datasetOpts } = opts;

  return makeSimpleDataset(name, type, dims, {
    ...datasetOpts,
    attributes: [
      ...(datasetOpts.attributes || []),
      ...(interpretation
        ? [makeStrAttr('interpretation', interpretation)]
        : []),
      ...(longName ? [makeStrAttr('long_name', longName)] : []),
      ...(units ? [makeStrAttr('units', units)] : []),
    ],
  });
}

export function withNxInterpretation<
  T extends MockDataset<HDF5SimpleShape, HDF5NumericType>
>(dataset: T, interpretation: NxInterpretation): T {
  return withAttributes(dataset, [
    makeStrAttr('interpretation', interpretation),
  ]);
}