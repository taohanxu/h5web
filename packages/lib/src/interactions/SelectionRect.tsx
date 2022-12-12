import type { SVGProps } from 'react';
import type { Vector2 } from 'three';

import { useCameraState } from '../vis/hooks';
import SvgElement from '../vis/shared/SvgElement';
import { dataToHtml } from '../vis/utils';

interface Props extends SVGProps<SVGRectElement> {
  startPoint: Vector2;
  endPoint: Vector2;
}

function SelectionRect(props: Props) {
  const {
    startPoint,
    endPoint,
    fill = 'red',
    fillOpacity = 0.5,
    ...restSvgProps
  } = props;

  const htmlSelection = useCameraState(
    (...args) => ({
      startPoint: dataToHtml(...args, startPoint),
      endPoint: dataToHtml(...args, endPoint),
    }),
    [startPoint, endPoint]
  );

  const { x: x1, y: y1 } = htmlSelection.startPoint;
  const { x: x2, y: y2 } = htmlSelection.endPoint;

  return (
    <SvgElement>
      <rect
        x={Math.min(x1, x2)}
        y={Math.min(y1, y2)}
        width={Math.abs(x2 - x1)}
        height={Math.abs(y2 - y1)}
        fill={fill}
        fillOpacity={fillOpacity}
        {...restSvgProps}
      />
    </SvgElement>
  );
}

export default SelectionRect;
