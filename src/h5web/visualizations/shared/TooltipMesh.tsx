import React, { ReactElement, useCallback } from 'react';
import { Dom, PointerEvent, useThree } from 'react-three-fiber';
import { TooltipWithBounds, useTooltip } from '@vx/tooltip';

import styles from './TooltipMesh.module.css';
import { useAbscissaScale, useOrdinateScale } from './utils';

type Coords = [number, number];

interface Props {
  formatIndex: (t: Coords) => string;
  formatValue: (t: Coords) => string | undefined;
}

function TooltipMesh(props: Props): ReactElement {
  const { formatIndex, formatValue } = props;

  const { camera, size } = useThree();
  const { width, height } = size;

  const {
    tooltipOpen,
    tooltipTop,
    tooltipLeft,
    tooltipData,
    showTooltip,
    hideTooltip,
  } = useTooltip<Coords>();

  // Scales to compute data coordinates from unprojected mesh coordinates
  const { abscissaScale } = useAbscissaScale();
  const { ordinateScale } = useOrdinateScale();

  // Update tooltip when pointer moves
  // When panning, events are handled and stopped by texture mesh and do not reach this mesh (which is behind)
  const onPointerMove = useCallback(
    (evt: PointerEvent) => {
      const { zoom } = camera;
      const projectedPoint = camera.worldToLocal(evt.unprojectedPoint.clone());

      const abscissa = abscissaScale.invert(evt.unprojectedPoint.x);
      const ordinate = ordinateScale.invert(evt.unprojectedPoint.y);

      showTooltip({
        tooltipLeft: projectedPoint.x * zoom + width / 2,
        tooltipTop: -projectedPoint.y * zoom + height / 2,
        tooltipData: [abscissa, ordinate],
      });
    },
    [camera, abscissaScale, ordinateScale, showTooltip, width, height]
  );

  // Hide tooltip when pointer leaves mesh or user starts panning
  const onPointerOut = useCallback(hideTooltip, [hideTooltip]);
  const onPointerDown = useCallback(hideTooltip, [hideTooltip]);

  const value = tooltipData && formatValue(tooltipData);

  return (
    <>
      <mesh {...{ onPointerMove, onPointerOut, onPointerDown }}>
        <planeBufferGeometry attach="geometry" args={[width, height]} />
      </mesh>
      <Dom style={{ width, height }}>
        {tooltipOpen && tooltipData && value ? (
          <TooltipWithBounds
            key={Math.random()}
            className={styles.tooltip}
            top={tooltipTop}
            left={tooltipLeft}
          >
            {formatIndex(tooltipData)}
            <span className={styles.tooltipValue}>{value}</span>
          </TooltipWithBounds>
        ) : (
          <></>
        )}
      </Dom>
    </>
  );
}

export default TooltipMesh;