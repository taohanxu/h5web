import {
  DefaultInteractions,
  ErrorBars,
  mockValues,
  useDomain,
  VisCanvas,
} from '@h5web/lib';
import { assertDefined } from '@h5web/shared/guards';
import { ScaleType } from '@h5web/shared/vis-models';
import type { Meta, StoryObj } from '@storybook/react';
import { range } from 'lodash-es';

import FillHeight from './decorators/FillHeight';

const dataArray = mockValues.oneD();

const meta = {
  title: 'Building Blocks/ErrorBars',
  component: ErrorBars,
  decorators: [FillHeight],
  parameters: {
    layout: 'fullscreen',
    controls: { sort: 'requiredFirst' },
  },
  args: {
    abscissas: range(0, dataArray.size),
    ordinates: dataArray.data,
    errors: dataArray.data.map(() => 10),
    color: 'blue',
    visible: true,
  },
  argTypes: {
    abscissas: { control: false },
    ordinates: { control: false },
    errors: { control: false },
    color: { control: { type: 'color' } },
  },
} satisfies Meta<typeof ErrorBars>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default = {
  render: (args) => {
    const { abscissas, ordinates, errors, ignoreValue } = args;

    const abscissaDomain = useDomain(abscissas);
    const ordinateDomain = useDomain(
      ordinates,
      ScaleType.Log,
      errors,
      ignoreValue,
    );

    assertDefined(abscissaDomain);
    assertDefined(ordinateDomain);

    return (
      <VisCanvas
        abscissaConfig={{ visDomain: abscissaDomain, showGrid: true }}
        ordinateConfig={{
          visDomain: ordinateDomain,
          scaleType: ScaleType.Log,
          showGrid: true,
        }}
      >
        <DefaultInteractions />
        <ErrorBars {...args} />
      </VisCanvas>
    );
  },
} satisfies Story;

export const Color = {
  ...Default,
  args: {
    color: 'red',
  },
} satisfies Story;

export const IgnoreValue = {
  ...Default,
  args: {
    ignoreValue: (val) => val % 5 === 0,
  },
} satisfies Story;
