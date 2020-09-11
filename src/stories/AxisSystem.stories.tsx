import React, { ReactElement } from 'react';
import type { Story } from '@storybook/react/types-6-0';
import VisCanvas, {
  VisCanvasProps,
} from '../h5web/visualizations/shared/VisCanvas';
import { ScaleType } from '../h5web/visualizations/shared/models';
import FillHeight from '../../.storybook/decorators/FillHeight';

const Template: Story<VisCanvasProps> = (args): ReactElement => (
  <VisCanvas {...args}>
    <></>
  </VisCanvas>
);

export const IndexDomains = Template.bind({});

IndexDomains.args = {
  abscissaConfig: { indexDomain: [0, 3], showGrid: true },
  ordinateConfig: { indexDomain: [50, 100], showGrid: true },
};

export const DataDomains = Template.bind({});

DataDomains.args = {
  abscissaConfig: { dataDomain: [0, 3], showGrid: true },
  ordinateConfig: { dataDomain: [50, 100], showGrid: true },
};

export const LogScales = Template.bind({});

LogScales.args = {
  abscissaConfig: {
    dataDomain: [1, 10],
    showGrid: true,
    scaleType: ScaleType.Log,
  },
  ordinateConfig: {
    dataDomain: [-10, 10],
    showGrid: true,
    scaleType: ScaleType.SymLog,
  },
};

export const AspectRatio = Template.bind({});

AspectRatio.args = {
  abscissaConfig: { indexDomain: [0, 10], showGrid: true },
  ordinateConfig: { indexDomain: [0, 2], showGrid: true },
  aspectRatio: 10 / 2,
};

export const NoGrid = Template.bind({});

NoGrid.args = {
  abscissaConfig: { indexDomain: [-5, 20], showGrid: false },
  ordinateConfig: { dataDomain: [0, 2], showGrid: false },
};

export const InheritedStyles = Template.bind({});

InheritedStyles.args = {
  abscissaConfig: { indexDomain: [0, 50], showGrid: true },
  ordinateConfig: { indexDomain: [0, 3], showGrid: true },
};

InheritedStyles.decorators = [
  (VisCanvasStory: Story) => (
    <div
      style={{
        flex: '1 1 0%',
        display: 'flex',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        fontSize: '1.125rem',
      }}
    >
      <VisCanvasStory />
    </div>
  ),
];

export default {
  title: 'VisCanvas/AxisSystem',
  component: VisCanvas,
  parameters: { layout: 'fullscreen' },
  decorators: [FillHeight],
};
