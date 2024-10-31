import React, { useState } from 'react';
import { Search, X, Copy, Check } from 'lucide-react';

interface PaymentCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentCode?: string;
  onLoadCode: (code: string) => void;
}

export default function PaymentCodeDialog({
  isOpen,
  onClose,
  currentCode,
  onLoadCode,
}: PaymentCodeDialogProps) {
  const [searchCode, setSearchCode] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyCode = async () => {
    if (currentCode) {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCode.trim()) {
      onLoadCode(searchCode.trim());
      setSearchCode('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">支払い情報コード</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {currentCode ? (
          <div className="mb-6">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-mono font-medium">{currentCode}</span>
              <button
                onClick={copyCode}
                className="text-gray-500 hover:text-indigo-600"
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              このコードを使って後で支払い情報を参照できます
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                支払い情報コードを入力
              </label>
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="例: WCAN12345678"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Search size={20} />
              <span>コードを検索</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}