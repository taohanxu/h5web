import React, { ReactElement, useState } from 'react';
import type { Story } from '@storybook/react/types-6-0';
import ndarray from 'ndarray';
import { useInterval } from 'react-use';
import FillHeight from '../../.storybook/decorators/FillHeight';
import HeatmapVis, {
  HeatmapVisProps,
} from '../h5web/visualizations/heatmap/HeatmapVis';
import { ScaleType } from '../h5web/visualizations/shared/models';
import { INTERPOLATORS } from '../h5web/visualizations/heatmap/interpolators';
import { getMockedDataset } from '../h5web/providers/mock/utils';
import { getDataDomain } from '../packages/lib';

// A 2D dataset
const dataset = getMockedDataset<number[][]>('/nD/twoD');
const values = dataset.value.flat(Infinity) as number[];

const dataArray = ndarray<number>(values, dataset.dims).transpose(1, 0); // makes for a nicer-looking heatmap
const domain = getDataDomain(values);
const logSafeDomain = getDataDomain(values, ScaleType.Log);

const Template: Story<HeatmapVisProps> = (args): ReactElement => (
  <HeatmapVis {...args} />
);

export const Default = Template.bind({});

Default.args = {
  dataArray,
  domain,
};

export const Domain = Template.bind({});

Domain.args = {
  dataArray,
  domain: [-400, 400],
};

export const ColorMap = Template.bind({});

ColorMap.args = {
  dataArray,
  domain,
  colorMap: 'Rainbow',
};

export const LogScale = Template.bind({});

LogScale.args = {
  dataArray,
  domain: logSafeDomain,
  scaleType: ScaleType.Log,
};

export const SymLogScale = Template.bind({});

SymLogScale.args = {
  dataArray,
  domain,
  scaleType: ScaleType.SymLog,
};

export const IgnoreAspectRatio = Template.bind({});

IgnoreAspectRatio.args = {
  dataArray,
  domain,
  keepAspectRatio: false,
};

export const NoGrid = Template.bind({});

NoGrid.args = {
  dataArray,
  domain,
  showGrid: false,
};

export const LiveDataWithoutLoader: Story<HeatmapVisProps> = (
  args
): ReactElement => {
  const [shuffledArray, setShuffledArray] = useState(args.dataArray);

  useInterval(() => {
    const shuffledValues = shuffledArray.data
      .slice(0)
      .sort(() => 0.5 - Math.random());

    setShuffledArray(
      ndarray<number>(shuffledValues, dataset.dims).transpose(1, 0)
    );
  }, 5000);

  return <HeatmapVis {...args} dataArray={shuffledArray} />;
};

LiveDataWithoutLoader.args = {
  dataArray,
  domain,
  showLoader: false,
};

export default {
  title: 'Visualizations/HeatmapVis',
  component: HeatmapVis,
  parameters: { layout: 'fullscreen' },
  decorators: [FillHeight],
  argTypes: {
    dataArray: {}, // To keep mandatory args above optional ones.
    domain: {},
    colorMap: {
      defaultValue: 'Viridis',
      control: {
        type: 'select',
        options: Object.keys(INTERPOLATORS),
      },
    },
    scaleType: {
      defaultValue: ScaleType.Linear,
      control: {
        type: 'inline-radio',
        options: [ScaleType.Linear, ScaleType.Log, ScaleType.SymLog],
      },
    },
    keepAspectRatio: {
      defaultValue: true,
    },
    showGrid: {
      defaultValue: true,
    },
  },
};
