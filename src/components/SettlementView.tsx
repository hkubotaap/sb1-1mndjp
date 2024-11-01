import React, { useState, useEffect } from 'react';
import { Copy, Check, ArrowLeft, RotateCcw, Receipt } from 'lucide-react';
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

interface RoundingAdjustment {
  memberId: string;
  amount: number;
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
  const [roundingAdjustments, setRoundingAdjustments] = useState<RoundingAdjustment[]>([]);

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
      roundingAdjustments
    );
    onSettlementsUpdate(newSettlements);
  }, [roundingMethod, roundingAdjustments, members, expenses]);

  // 端数の分配が更新されたときの処理
  const handleDistributionUpdate = (distributions: RoundingAdjustment[]) => {
    setRoundingAdjustments(distributions);
  };

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
      '【精算方法】',
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
      {/* ヘッダー */}
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
        <button
          onClick={copySettlements}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
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
      </div>

      {/* 支払い情報コード */}
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

      {/* メインコンテンツ */}
      <div className="grid gap-6">
        {/* 支払いサマリ */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Receipt size={20} />
            <span>支払い状況</span>
          </h3>
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
        </div>

        {/* 端数処理設定 */}
        <RoundingControls
          roundingMethod={roundingMethod}
          onMethodChange={onRoundingMethodChange}
          roundingDifference={roundingDifference}
          members={members}
          onDistributionUpdate={handleDistributionUpdate}
        />

        {/* 精算方法 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">精算方法</h3>
          {settlements.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-100">
              精算の必要はありません
            </div>
          ) : (
            <div className="space-y-3">
              {settlements.map((settlement, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-medium">{settlement.from}</div>
                      <div className="text-sm text-gray-500">支払う人</div>
                    </div>
                    <div className="text-gray-400">→</div>
                    <div>
                      <div className="font-medium">{settlement.to}</div>
                      <div className="text-sm text-gray-500">受け取る人</div>
                    </div>
                  </div>
                  <div className="text-xl font-bold">
                    ¥{settlement.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* フッターボタン */}
      <div className="flex gap-4 pt-4">
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
    </div>
  );
}