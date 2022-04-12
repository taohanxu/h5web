import { useThree } from '@react-three/fiber';

import { useVisibleDomains } from '../vis/hooks';
import { useAxisSystemContext } from '../vis/shared/AxisSystemContext';
import RatioSelectionRect from './RatioSelectionRect';
import SelectionRect from './SelectionRect';
import SelectionTool from './SelectionTool';
import { useMoveCameraTo } from './hooks';
import type { Interaction, Selection } from './models';
import { getEnclosedRectangle, getRatioRespectingRectangle } from './utils';

interface Props extends Interaction {
  keepRatio?: boolean;
}

function SelectToZoom(props: Props) {
  const { keepRatio, ...interactionProps } = props;

  const { dataToWorld } = useAxisSystemContext();
  const moveCameraTo = useMoveCameraTo();

  const { width, height } = useThree((state) => state.size);
  const camera = useThree((state) => state.camera);

  const { xVisibleDomain, yVisibleDomain } = useVisibleDomains();
  const dataRatio = Math.abs(
    (xVisibleDomain[1] - xVisibleDomain[0]) /
      (yVisibleDomain[1] - yVisibleDomain[0])
  );

  const onSelectionEnd = (selection: Selection) => {
    const { startPoint: dataStartPoint, endPoint: dataEndPoint } = selection;

    // Work in world coordinates as we need to act on the world camera
    const [startPoint, endPoint] = (
      keepRatio
        ? getRatioRespectingRectangle(dataStartPoint, dataEndPoint, dataRatio)
        : [dataStartPoint, dataEndPoint]
    ).map(dataToWorld);

    if (startPoint.x === endPoint.x && startPoint.y === endPoint.y) {
      return;
    }

    const zoomRect = getEnclosedRectangle(startPoint, endPoint);
    const { center: zoomRectCenter } = zoomRect;

    // Change scale first so that moveCameraTo computes the updated camera bounds
    camera.scale.set(zoomRect.width / width, zoomRect.height / height, 1);
    camera.updateMatrixWorld();

    moveCameraTo(zoomRectCenter.x, zoomRectCenter.y);
  };

  return (
    <SelectionTool
      onSelectionEnd={onSelectionEnd}
      id="SelectToZoom"
      {...interactionProps}
    >
      {({ startPoint, endPoint }) => {
        return (
          <>
            <SelectionRect
              startPoint={startPoint}
              endPoint={endPoint}
              fill="white"
              stroke="black"
              fillOpacity={keepRatio ? 0 : 0.25}
              strokeDasharray={keepRatio ? '4' : undefined}
            />
            {keepRatio && (
              <RatioSelectionRect
                startPoint={startPoint}
                endPoint={endPoint}
                ratio={dataRatio}
                fillOpacity={0.25}
                fill="white"
                stroke="black"
              />
            )}
          </>
        );
      }}
    </SelectionTool>
  );
}

export default SelectToZoom;