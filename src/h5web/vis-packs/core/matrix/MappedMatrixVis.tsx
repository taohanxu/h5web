import { ReactElement, useState } from 'react';
import type { HDF5Value } from '../../../providers/hdf5-models';
import type { DimensionMapping } from '../../../dimension-mapper/models';
import MatrixVis from './MatrixVis';
import { assertArray } from '../../../guards';
import { useBaseArray, useMappedArray } from '../hooks';
import DimensionMapper from '../../../dimension-mapper/DimensionMapper';

interface Props {
  value: HDF5Value;
  dims: number[];
}

function MappedMatrixVis(props: Props): ReactElement {
  const { value, dims } = props;
  assertArray<number | string>(value);

  const [dimensionMapping, setDimensionMapping] = useState<DimensionMapping>(
    dims.length === 1
      ? ['x']
      : [...new Array(dims.length - 2).fill(0), 'y', 'x']
  );

  const baseArray = useBaseArray(value, dims);
  const mappedArray = useMappedArray(baseArray, dimensionMapping);

  return (
    <>
      <DimensionMapper
        rawDims={dims}
        mapperState={dimensionMapping}
        onChange={setDimensionMapping}
      />
      <MatrixVis dataArray={mappedArray} />
    </>
  );
}

export default MappedMatrixVis;