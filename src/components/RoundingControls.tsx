import React from 'react';
import { RoundingMethod } from '../types';

interface Props {
  roundingMethod: RoundingMethod;
  onMethodChange: (method: RoundingMethod) => void;
  roundingDifference: number;
  members: { id: string; name: string }[];
  roundingAdjusterId?: string;
  onAdjusterChange: (id: string) => void;
}

export default function RoundingControls({
  roundingMethod,
  onMethodChange,
  roundingDifference,
  members,
  roundingAdjusterId,
  onAdjusterChange,
}: Props) {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">端数の処理方法</h4>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onMethodChange('floor')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${roundingMethod === 'floor'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            切り捨て
          </button>
          <button
            onClick={() => onMethodChange('round')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${roundingMethod === 'round'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            四捨五入
          </button>
          <button
            onClick={() => onMethodChange('ceil')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${roundingMethod === 'ceil'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            切り上げ
          </button>
        </div>
      </div>

      {roundingMethod !== 'floor' && roundingDifference > 0 && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-700">端数の負担</h4>
            <span className="text-sm text-gray-500">
              差額: ¥{roundingDifference}
            </span>
          </div>
          <div className="space-y-2">
            {members.map((member) => (
              <label
                key={member.id}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors
                  ${roundingAdjusterId === member.id
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'bg-white hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="roundingAdjuster"
                    value={member.id}
                    checked={roundingAdjusterId === member.id}
                    onChange={(e) => onAdjusterChange(e.target.value)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{member.name}</span>
                </div>
                {roundingAdjusterId === member.id && (
                  <span className="text-sm font-medium">
                    -¥{roundingDifference}
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}