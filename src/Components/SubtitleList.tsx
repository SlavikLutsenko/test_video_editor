import { FunctionComponent } from 'react';
import { Subtitle } from 'interfaces/subtitle';

import 'rc-slider/assets/index.css';

export interface SubtitleListProps {
  subtitleList: Subtitle[],
}

export const SubtitleList: FunctionComponent<SubtitleListProps> = ({
  subtitleList,
}) => (
  <div>
    {
      subtitleList.map(({ id, text }) => (
        <p key={id}>
          {text}
        </p>
      ))
    }
  </div>
);
