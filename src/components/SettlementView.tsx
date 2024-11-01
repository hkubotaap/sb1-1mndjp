import React, { useState } from 'react';
import { Copy, Check, ArrowLeft, RotateCcw } from 'lucide-react';
import { Member, Expense, Settlement, RoundingMethod } from '../types';
import RoundingControls from './RoundingControls';
import { calculateSettlements, getRoundingDifference } from '../utils/calculations';

interface SettlementViewProps {
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
}: SettlementViewProps) {
  const [copiedResults, setCopiedResults] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [roundingAdjustments, setRoundingAdjustments] = useState<Array<{ memberId: string; amount: number }>>([]);

  // メンバーごとの支払い・受け取りフローを整理
  const payingSettlements = settlements.filter(s => !s.isRoundingAdjustment);

  // 支払いサマリを計算
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const expensesByPayer = expenses.reduce((acc, exp) => ({
    ...acc,
    [exp.payerId]: (acc[exp.payerId] || 0) + exp.amount
  }), {} as Record<string, number>);

  // 端数の差額を計算
  const roundingDifference = getRoundingDifference(members, expenses, roundingMethod);

  // 端数処理方法が変更されたら精算結果を再計算
  React.useEffect(() => {
    const newSettlements = calculateSettlements(
      members,
      expenses,
      roundingMethod,
      roundingAdjustments
    );
    onSettlementsUpdate(newSettlements);
  }, [roundingMethod, roundingAdjustments, members, expenses, onSettlementsUpdate]);

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
      '【支払い詳細】',
      ...expenses.map(exp => {
        const payer = members.find(m => m.id === exp.payerId)?.name;
        const beneficiaries = exp.beneficiaryIds
          .map(id => members.find(m => m.id === id)?.name)
          .join('、');
        return [
          `日付: ${exp.date}`,
          `支払者: ${payer}`,
          `金額: ¥${exp.amount.toLocaleString()}`,
          `タイプ: ${exp.splitType === 'equal' ? '均等割り' : '人数分'}`,
          `対象者: ${beneficiaries}`,
          exp.note ? `備考: ${exp.note}` : '',
          ''
        ].filter(Boolean).join('\n');
      }),
      '',
      '【端数処理】',
      `方法: ${roundingMethod === 'floor' ? '切り捨て' : roundingMethod === 'ceil' ? '切り上げ' : '四捨五入'}`,
      roundingDifference > 0 ? `差額: ¥${roundingDifference}` : '',
      '',
      '【精算方法】',
      ...payingSettlements.map(s => 
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">合計金額</div>
          <div className="text-2xl font-bold">¥{totalAmount.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">支払い回数</div>
          <div className="text-2xl font-bold">{expenses.length}回</div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map(member => (
          <div key={member.id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">{member.name}の支払い</div>
            <div className="text-xl font-bold">¥{(expensesByPayer[member.id] || 0).toLocaleString()}</div>
          </div>
        ))}
      </div>

      <RoundingControls
        roundingMethod={roundingMethod}
        onMethodChange={onRoundingMethodChange}
        roundingDifference={roundingDifference}
        members={members}
        onDistributionUpdate={setRoundingAdjustments}
      />

      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">精算方法</h3>
        {payingSettlements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            精算の必要はありません
          </div>
        ) : (
          <div className="space-y-2">
            {payingSettlements.map((settlement, index) => (
              <div
                key={`pay-${index}`}
                className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="font-medium">{settlement.from}</div>
                  <span className="text-gray-400">→</span>
                  <div>{settlement.to}</div>
                </div>
                <div className="font-medium">¥{settlement.amount.toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={copySettlements}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          copiedResults
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {copiedResults ? (
          <>
            <Check size={18} />
            <span>コピーしました</span>
          </>
        ) : (
          <>
            <Copy size={18} />
            <span>結果をコピー</span>
          </>
        )}
      </button>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          支払い登録に戻る
        </button>
        <button
          onClick={onReset}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <RotateCcw size={18} />
          <span>新しい割り勘を始める</span>
        </button>
      </div>

      {paymentCode && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-blue-600 font-medium mb-1">支払い情報コード</div>
              <div className="font-mono text-blue-900">{paymentCode}</div>
            </div>
            <button
              onClick={copyPaymentCode}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                copiedCode
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
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
        </div>
      )}
    </div>
  );
}