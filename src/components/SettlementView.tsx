import React, { useState, useEffect } from 'react';
import { Copy, Check, ArrowLeft, RotateCcw } from 'lucide-react';
import { Member, Expense, Settlement, RoundingMethod } from '../types';
import RoundingControls from './RoundingControls';
import { calculateSettlements, getRoundingDifference } from '../utils/calculations';

interface Props {
  settlements: Settlement[];
  members: Member[];
  expenses: Expense[];
  paymentCode?: string;
  roundingMethod: RoundingMethod;
  onRoundingMethodChange: (method: RoundingMethod) => void;
  onSettlementsUpdate: (settlements: Settlement[]) => void;
  onBack: () => void;
  onReset: () => void;
}

export default function SettlementView({
  settlements,
  members,
  expenses,
  paymentCode,
  roundingMethod,
  onRoundingMethodChange,
  onSettlementsUpdate,
  onBack,
  onReset,
}: Props) {
  const [copiedResults, setCopiedResults] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [roundingAdjusterId, setRoundingAdjusterId] = useState<string>();

  // 支払いサマリを計算
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const expensesByPayer = expenses.reduce((acc, exp) => ({
    ...acc,
    [exp.payerId]: (acc[exp.payerId] || 0) + exp.amount
  }), {} as Record<string, number>);

  // 端数の差額を計算
  const roundingDifference = getRoundingDifference(members, expenses, roundingMethod);

  // 端数処理方法が変更されたら精算結果を再計算
  useEffect(() => {
    const newSettlements = calculateSettlements(
      members,
      expenses,
      roundingMethod,
      roundingAdjusterId
    );
    onSettlementsUpdate(newSettlements);
  }, [roundingMethod, roundingAdjusterId]);

  // 端数処理方法が変更されたら最初のメンバーを端数負担者に設定
  useEffect(() => {
    if (roundingMethod !== 'floor' && !roundingAdjusterId && members.length > 0) {
      setRoundingAdjusterId(members[0].id);
    }
  }, [roundingMethod]);

  const copySettlements = async () => {
    if (settlements.length === 0) return;

    const summaryText = [
      paymentCode ? `支払い情報コード: ${paymentCode}` : '',
      '',
      '【支払いサマリ】',
      `合計金額: ¥${totalAmount.toLocaleString()}`,
      ...members.map(m => 
        `${m.name}: ¥${(expensesByPayer[m.id] || 0).toLocaleString()}`
      ),
      '',
      '【端数処理】',
      `方法: ${roundingMethod === 'floor' ? '切り捨て' : roundingMethod === 'ceil' ? '切り上げ' : '四捨五入'}`,
      roundingDifference > 0 ? `差額 ¥${roundingDifference} を ${members.find(m => m.id === roundingAdjusterId)?.name} が負担` : '',
      '',
      '【精算結果】',
      ...settlements.map(s => 
        `${s.from} が ${s.to} に ¥${s.amount.toLocaleString()} を支払う`
      )
    ].filter(Boolean).join('\n');

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopiedResults(true);
      setTimeout(() => setCopiedResults(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const copyPaymentCode = async () => {
    if (!paymentCode) return;
    
    try {
      await navigator.clipboard.writeText(paymentCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold">精算結果</h2>
        </div>
      </div>

      {paymentCode && (
        <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
          <div>
            <div className="text-sm text-indigo-600 font-medium mb-1">支払い情報コード</div>
            <div className="font-mono">{paymentCode}</div>
          </div>
          <button
            onClick={copyPaymentCode}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              copiedCode
                ? 'bg-green-100 text-green-700'
                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            }`}
          >
            {copiedCode ? (
              <>
                <Check size={16} />
                <span>コピーしました</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>コードをコピー</span>
              </>
            )}
          </button>
        </div>
      )}

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">支払いサマリ</h3>
        <div className="space-y-2">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="font-medium">合計金額</div>
            <div className="text-2xl font-bold">¥{totalAmount.toLocaleString()}</div>
          </div>
          {members.map(member => (
            <div key={member.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium">{member.name}</div>
              <div className="text-xl">¥{(expensesByPayer[member.id] || 0).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      <RoundingControls
        roundingMethod={roundingMethod}
        onMethodChange={onRoundingMethodChange}
        roundingDifference={roundingDifference}
        members={members}
        roundingAdjusterId={roundingAdjusterId}
        onAdjusterChange={setRoundingAdjusterId}
      />

      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-700">精算方法</h3>
          <button
            onClick={copySettlements}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              copiedResults
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {copiedResults ? (
              <>
                <Check size={14} />
                <span>コピーしました</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>結果をコピー</span>
              </>
            )}
          </button>
        </div>
        {settlements.length === 0 ? (
          <p className="text-center py-8 text-gray-500">精算の必要はありません</p>
        ) : (
          <div className="space-y-2">
            {settlements.map((settlement, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
              >
                <div className="flex items-center gap-4">
                  <span className="font-medium">{settlement.from}</span>
                  <span className="text-gray-500">→</span>
                  <span className="font-medium">{settlement.to}</span>
                </div>
                <span className="font-bold">¥{settlement.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-4 pt-4">
        <button
          onClick={onBack}
          className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          支払い登録に戻る
        </button>
        <button
          onClick={onReset}
          className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          新しい割り勘を始める
        </button>
      </div>
    </div>
  );
}