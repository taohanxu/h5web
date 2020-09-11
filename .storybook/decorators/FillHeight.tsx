import React from 'react';
import { Story } from '@storybook/react';

function FillHeight(VisCanvasStory: Story) {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <VisCanvasStory />
    </div>
  );
}

export default FillHeight;
