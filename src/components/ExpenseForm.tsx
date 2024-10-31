import React, { useState } from 'react';
import { Member, Expense } from '../types';
import { Plus, Ticket, Car, Pencil, Save, X } from 'lucide-react';

interface ExpenseFormProps {
  members: Member[];
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  onComplete: () => void;
}

export default function ExpenseForm({
  members,
  expenses,
  setExpenses,
  onComplete,
}: ExpenseFormProps) {
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    payerId: '',
    amount: '',
    beneficiaries: {} as Record<string, boolean>,
    splitType: 'equal' as 'equal' | 'multiply',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateExpense = () => {
    if (!newExpense.payerId) {
      setError('支払った人を選択してください');
      return false;
    }
    if (!newExpense.amount || Number(newExpense.amount) <= 0) {
      setError('有効な金額を入力してください');
      return false;
    }
    const beneficiaryIds = Object.entries(newExpense.beneficiaries)
      .filter(([_, checked]) => checked)
      .map(([id]) => id);
    if (beneficiaryIds.length === 0) {
      setError('対象者を1人以上選択してください');
      return false;
    }
    setError(null);
    return true;
  };

  const addExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateExpense()) return;

    const beneficiaryIds = Object.entries(newExpense.beneficiaries)
      .filter(([_, checked]) => checked)
      .map(([id]) => id);

    if (editingId) {
      setExpenses(expenses.map(expense =>
        expense.id === editingId
          ? {
              ...expense,
              date: newExpense.date,
              payerId: newExpense.payerId,
              amount: Number(newExpense.amount),
              beneficiaryIds,
              splitType: newExpense.splitType,
            }
          : expense
      ));
      setEditingId(null);
    } else {
      setExpenses([
        ...expenses,
        {
          id: Date.now().toString(),
          date: newExpense.date,
          payerId: newExpense.payerId,
          amount: Number(newExpense.amount),
          beneficiaryIds,
          splitType: newExpense.splitType,
        },
      ]);
    }

    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      payerId: '',
      amount: '',
      beneficiaries: {},
      splitType: 'equal',
    });
    setError(null);
  };

  const startEditing = (expense: Expense) => {
    setEditingId(expense.id);
    setNewExpense({
      date: expense.date,
      payerId: expense.payerId,
      amount: expense.amount.toString(),
      beneficiaries: expense.beneficiaryIds.reduce((acc, id) => ({
        ...acc,
        [id]: true
      }), {}),
      splitType: expense.splitType,
    });
    setError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      payerId: '',
      amount: '',
      beneficiaries: {},
      splitType: 'equal',
    });
    setError(null);
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  return (
    <div className="space-y-6">
      <form onSubmit={addExpense} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
            <input
              type="date"
              value={newExpense.date}
              onChange={(e) =>
                setNewExpense({ ...newExpense, date: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">金額</label>
            <input
              type="number"
              value={newExpense.amount}
              onChange={(e) =>
                setNewExpense({ ...newExpense, amount: e.target.value })
              }
              placeholder="¥0"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">支払った人</label>
          <select
            value={newExpense.payerId}
            onChange={(e) =>
              setNewExpense({ ...newExpense, payerId: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">選択してください</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">支払いタイプ</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setNewExpense({ ...newExpense, splitType: 'equal' })}
              className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors
                ${newExpense.splitType === 'equal'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                  : 'border-gray-200 hover:border-indigo-200'
              }`}
            >
              <Car size={24} />
              <div className="text-left">
                <div className="font-medium">均等割り</div>
                <div className="text-sm text-gray-500">タクシー代など</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setNewExpense({ ...newExpense, splitType: 'multiply' })}
              className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors
                ${newExpense.splitType === 'multiply'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                  : 'border-gray-200 hover:border-indigo-200'
              }`}
            >
              <Ticket size={24} />
              <div className="text-left">
                <div className="font-medium">人数分</div>
                <div className="text-sm text-gray-500">チケット代など</div>
              </div>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">対象者</label>
          <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-lg">
            {members.map((member) => (
              <label key={member.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newExpense.beneficiaries[member.id] || false}
                  onChange={(e) =>
                    setNewExpense({
                      ...newExpense,
                      beneficiaries: {
                        ...newExpense.beneficiaries,
                        [member.id]: e.target.checked,
                      },
                    })
                  }
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>{member.name}</span>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {editingId ? (
            <>
              <Save size={20} />
              <span>支払いを更新</span>
            </>
          ) : (
            <>
              <Plus size={20} />
              <span>支払いを追加</span>
            </>
          )}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={cancelEditing}
            className="w-full flex items-center justify-center gap-2 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
            <span>編集をキャンセル</span>
          </button>
        )}
      </form>

      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">支払い履歴</h3>
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className={`p-3 bg-gray-50 rounded-lg space-y-1 transition-colors
              ${editingId === expense.id ? 'ring-2 ring-indigo-500' : ''}`}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{expense.date}</span>
              <div className="flex items-center gap-2">
                {expense.splitType === 'equal' ? (
                  <Car size={16} className="text-gray-400" />
                ) : (
                  <Ticket size={16} className="text-gray-400" />
                )}
                <span className="font-medium">¥{expense.amount.toLocaleString()}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => startEditing(expense)}
                    className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
            <div className="text-sm">
              支払者: {members.find((m) => m.id === expense.payerId)?.name}
            </div>
            <div className="text-sm">
              対象者: {expense.beneficiaryIds
                .map((id) => members.find((m) => m.id === id)?.name)
                .join(', ')}
            </div>
          </div>
        ))}
      </div>

      {expenses.length > 0 && (
        <button
          onClick={onComplete}
          className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          精算結果を表示
        </button>
      )}
    </div>
  );
}