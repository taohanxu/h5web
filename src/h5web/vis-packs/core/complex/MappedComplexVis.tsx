import { useEffect, useMemo } from 'react';
import { useMappedArray } from '../hooks';
import type { AxisMapping, ScaleType } from '../models';
import type { DimensionMapping } from '../../../dimension-mapper/models';
import { isAxis } from '../../../dimension-mapper/utils';
import shallow from 'zustand/shallow';
import { useSafeDomain, useVisDomain } from '../heatmap/hooks';
import type { H5WebComplex } from '../../../providers/models';
import { usePhaseAmplitude } from './hooks';
import HeatmapVis from '../heatmap/HeatmapVis';
import { DEFAULT_DOMAIN } from '../utils';
import { ComplexVisType } from './models';
import { useComplexConfig } from './config';
import { useHeatmapConfig } from '../heatmap/config';

interface Props {
  value: H5WebComplex[];
  dims: number[];
  dimMapping: DimensionMapping;
  axisMapping?: AxisMapping;
  title: string;
  colorScaleType?: ScaleType;
}

function MappedComplexVis(props: Props) {
  const {
    value,
    dims,
    dimMapping,
    axisMapping = [],
    title,
    colorScaleType,
  } = props;

  const {
    customDomain,
    colorMap,
    scaleType,
    keepAspectRatio,
    showGrid,
    setDataDomain,
    setScaleType,
    invertColorMap,
  } = useHeatmapConfig((state) => state, shallow);

  const { visType } = useComplexConfig((state) => state, shallow);

  const [slicedDims, slicedMapping] = useMemo(
    () => [
      dims.filter((_, i) => isAxis(dimMapping[i])),
      dimMapping.filter((dim) => isAxis(dim)),
    ],
    [dims, dimMapping]
  );

  const [mappedArray] = useMappedArray(value, slicedDims, slicedMapping);

  const {
    phaseArray,
    phaseDomain = DEFAULT_DOMAIN,
    amplitudeArray,
    amplitudeDomain = DEFAULT_DOMAIN,
  } = usePhaseAmplitude(mappedArray, scaleType);

  const dataArray =
    visType !== ComplexVisType.Amplitude ? phaseArray : amplitudeArray;
  const dataDomain =
    visType !== ComplexVisType.Amplitude ? phaseDomain : amplitudeDomain;

  const visDomain = useVisDomain(customDomain, dataDomain);
  const [safeDomain] = useSafeDomain(visDomain, dataDomain, scaleType);
  useEffect(() => {
    setDataDomain(dataDomain);
  }, [dataDomain, setDataDomain]);

  useEffect(() => {
    if (colorScaleType) {
      setScaleType(colorScaleType);
    }
  }, [setScaleType, colorScaleType]);

  return (
    <HeatmapVis
      dataArray={dataArray}
      domain={safeDomain}
      alphaArray={
        visType === ComplexVisType.PhaseAmplitude ? amplitudeArray : undefined
      }
      alphaDomain={
        visType === ComplexVisType.PhaseAmplitude ? amplitudeDomain : undefined
      }
      title={title ? `${title} (${visType.toLowerCase()})` : visType}
      colorMap={colorMap}
      scaleType={scaleType}
      keepAspectRatio={keepAspectRatio}
      showGrid={showGrid}
      invertColorMap={invertColorMap}
      abscissaParams={axisMapping[dimMapping.indexOf('x')]}
      ordinateParams={axisMapping[dimMapping.indexOf('y')]}
    />
  );
}

export default MappedComplexVis;