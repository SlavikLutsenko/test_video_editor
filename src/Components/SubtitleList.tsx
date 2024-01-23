import { FunctionComponent } from 'react';
import moment from 'moment';
import { twMerge } from 'tailwind-merge';

import 'rc-slider/assets/index.css';

import { Subtitle } from 'interfaces/subtitle';

export interface SubtitleListProps {
  subtitleList: Subtitle[],
  onRemoveFrame: (startTime: number, endTime: number) => void;
}

export const SubtitleList: FunctionComponent<SubtitleListProps> = ({
  subtitleList,
  onRemoveFrame,
}) => (
  <div className="space-y-2">
    {
      subtitleList.map(({ id, text, startTime, endTime, isRemoved }, idx) => (
        <div
          key={id}
          className={twMerge(
            'relative',
            subtitleList[idx].isRemoved && `
              after:absolute after:top-0 after:w-full after:h-full after:z-10 after:bg-red-400 after:bg-opacity-45
            `
          )}
        >
          <div className="flex justify-between items-center text-gray-500">
            {
              moment(new Date(startTime * 1000))
                .utc()
                .format('mm:ss')
            }
            <button
              className="text-red-400"
              disabled={isRemoved}
              onClick={() => onRemoveFrame(
                startTime,
                subtitleList[idx + 1]?.startTime || endTime
              )}
            >
              {
                isRemoved
                  ? 'removed'
                  : 'remove'
              }
            </button>
          </div>
          <p>
            {text}
          </p>
        </div>
      ))
    }
  </div>
);
