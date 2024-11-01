import React, { useState, useEffect } from 'react';
import { RoundingMethod } from '../types';
import { AlertCircle } from 'lucide-react';

interface Props {
  roundingMethod: RoundingMethod;
  onMethodChange: (method: RoundingMethod) => void;
  roundingDifference: number;
  members: { id: string; name: string }[];
  onDistributionUpdate: (distributions: Array<{ memberId: string; amount: number }>) => void;
}

interface Distribution {
  memberId: string;
  amount: number;
}

export default function RoundingControls({
  roundingMethod,
  onMethodChange,
  roundingDifference,
  members,
  onDistributionUpdate,
}: Props) {
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [remainingAmount, setRemainingAmount] = useState(0);

  // 端数が2円以上の場合は分配モードを有効にする
  const isDistributionMode = roundingDifference >= 2;

  // 初期分配を設定
  useEffect(() => {
    const roundedDifference = Math.round(roundingDifference);
    if (isDistributionMode) {
      const initialDistributions = members.map(member => ({
        memberId: member.id,
        amount: 0
      }));
      
      // デフォルトで最初のメンバーに全額を割り当てる
      if (initialDistributions.length > 0) {
        initialDistributions[0].amount = roundedDifference;
      }
      
      setDistributions(initialDistributions);
      setRemainingAmount(0);
      onDistributionUpdate(initialDistributions);
    } else if (roundingMethod !== 'floor' && roundedDifference > 0) {
      // 1円の場合は最初のメンバーに割り当てる
      const singleAdjustment = [{
        memberId: members[0]?.id || '',
        amount: roundedDifference
      }];
      setDistributions(singleAdjustment);
      setRemainingAmount(0);
      onDistributionUpdate(singleAdjustment);
    } else {
      setDistributions([]);
      setRemainingAmount(0);
      onDistributionUpdate([]);
    }
  }, [roundingDifference, members, isDistributionMode, roundingMethod]);

  // 分配額を更新
  const handleDistributionChange = (memberId: string, value: number) => {
    const roundedValue = Math.round(value);
    const newDistributions = distributions.map(dist => {
      if (dist.memberId === memberId) {
        return { ...dist, amount: roundedValue };
      }
      return dist;
    });

    const totalDistributed = newDistributions.reduce((sum, dist) => sum + dist.amount, 0);
    const newRemaining = Math.round(roundingDifference - totalDistributed);

    setDistributions(newDistributions);
    setRemainingAmount(newRemaining);

    // 分配が完了している場合のみ更新を通知
    if (newRemaining === 0) {
      onDistributionUpdate(newDistributions);
    }
  };

  // 単一メンバーへの割り当て
  const handleSingleAssignment = (memberId: string) => {
    const roundedDifference = Math.round(roundingDifference);
    const newDistributions = [{
      memberId,
      amount: roundedDifference
    }];
    setDistributions(newDistributions);
    setRemainingAmount(0);
    onDistributionUpdate(newDistributions);
  };

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
              差額: ¥{Math.round(roundingDifference)}
            </span>
          </div>

          {isDistributionMode ? (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg flex items-start gap-2">
                <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                <div className="text-sm text-blue-700">
                  端数が2円以上あるため、複数人で分担できます。
                  スライダーを動かして金額を調整してください。
                </div>
              </div>

              <div className="space-y-3">
                {distributions.map((dist) => {
                  const member = members.find(m => m.id === dist.memberId);
                  if (!member) return null;

                  return (
                    <div key={dist.memberId} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{member.name}</span>
                        <span className="text-sm text-gray-600">¥{Math.round(dist.amount)}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={Math.round(roundingDifference)}
                        value={dist.amount}
                        step="1"
                        onChange={(e) => handleDistributionChange(dist.memberId, parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                  );
                })}
              </div>

              <div className={`text-sm font-medium text-right ${
                remainingAmount === 0 ? 'text-green-600' : 'text-orange-600'
              }`}>
                残り: ¥{remainingAmount}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <label
                  key={member.id}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors
                    ${distributions.some(d => d.memberId === member.id && d.amount > 0)
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'bg-white hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="roundingAdjuster"
                      value={member.id}
                      checked={distributions.some(d => d.memberId === member.id && d.amount > 0)}
                      onChange={() => handleSingleAssignment(member.id)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{member.name}</span>
                  </div>
                  {distributions.some(d => d.memberId === member.id && d.amount > 0) && (
                    <span className="text-sm font-medium">
                      -¥{Math.round(roundingDifference)}
                    </span>
                  )}
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}