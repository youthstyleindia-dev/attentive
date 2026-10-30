import React from 'react';
import { Composition } from 'remotion';
import { AtentivDemoVideo } from './AtentivDemoVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="AtentivDemo"
      component={AtentivDemoVideo}
      durationInFrames={600} // 20 seconds @ 30fps
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
