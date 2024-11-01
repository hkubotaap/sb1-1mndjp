import React, { useState, useEffect } from 'react';
import { PlusCircle, Receipt, Calculator, Search } from 'lucide-react';
import MemberList from './components/MemberList';
import ExpenseForm from './components/ExpenseForm';
import SettlementView from './components/SettlementView';
import ConsentDialog from './components/ConsentDialog';
import { Member, Expense, Settlement, RoundingMethod } from './types';
import { calculateSettlements } from './utils/calculations';
import { savePaymentData, getPaymentData, initDB, saveConsent, getConsent } from './utils/db';

function App() {
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [step, setStep] = useState<'members' | 'expenses' | 'settlement'>('members');
  const [paymentCode, setPaymentCode] = useState<string>();
  const [searchCode, setSearchCode] = useState('');
  const [roundingMethod, setRoundingMethod] = useState<RoundingMethod>('round');
  const [error, setError] = useState<string>();
  const [showConsent, setShowConsent] = useState(true);
  const [hasConsented, setHasConsented] = useState(false);

  // 初期化時に同意状態を確認
  useEffect(() => {
    const checkConsent = async () => {
      try {
        await initDB();
        const deviceId = localStorage.getItem('deviceId') || crypto.randomUUID();
        localStorage.setItem('deviceId', deviceId);
        
        const consent = await getConsent(deviceId);
        if (consent) {
          setShowConsent(false);
          setHasConsented(true);
        }
      } catch (err) {
        console.error('Failed to check consent:', err);
      }
    };
    checkConsent();
  }, []);

  const handleConsent = async () => {
    try {
      const deviceId = localStorage.getItem('deviceId');
      if (deviceId) {
        await saveConsent(deviceId);
        setShowConsent(false);
        setHasConsented(true);
      }
    } catch (err) {
      console.error('Failed to save consent:', err);
    }
  };

  const calculateFinalSettlement = async () => {
    const calculatedSettlements = calculateSettlements(members, expenses, roundingMethod);
    setSettlements(calculatedSettlements);
    setStep('settlement');

    try {
      const code = await savePaymentData(members, expenses, paymentCode);
      setPaymentCode(code);
    } catch (err) {
      console.error('Failed to save payment data:', err);
      setError('データの保存に失敗しました');
    }
  };

  const handleSearch = async () => {
    if (!searchCode.trim()) return;

    try {
      const data = await getPaymentData(searchCode.trim());
      if (data) {
        setMembers(data.members);
        setExpenses(data.expenses);
        setPaymentCode(data.code);
        setStep('expenses');
        setSearchCode('');
      } else {
        setError('指定された支払い情報が見つかりませんでした');
      }
    } catch (err) {
      console.error('Failed to load payment data:', err);
      setError('データの読み込みに失敗しました');
    }
  };

  if (showConsent) {
    return <ConsentDialog onConsent={handleConsent} />;
  }

  if (!hasConsented) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8 space-y-4">
          <h1 className="text-3xl font-bold text-indigo-900">
            割り勘アプリ
          </h1>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="WCANから始まる支払い情報コードを入力"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleSearch}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Search size={20} />
              <span>検索</span>
            </button>
          </div>
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-center mb-6 space-x-4">
            <StepIndicator
              icon={<PlusCircle />}
              text="メンバー登録"
              active={step === 'members'}
              completed={members.length > 0}
              onClick={() => setStep('members')}
            />
            <StepIndicator
              icon={<Receipt />}
              text="支払い登録"
              active={step === 'expenses'}
              completed={expenses.length > 0}
              onClick={() => members.length > 0 && setStep('expenses')}
            />
            <StepIndicator
              icon={<Calculator />}
              text="精算"
              active={step === 'settlement'}
              completed={settlements.length > 0}
              onClick={() => expenses.length > 0 && calculateFinalSettlement()}
            />
          </div>

          {step === 'members' && (
            <MemberList
              members={members}
              setMembers={setMembers}
              onComplete={() => setStep('expenses')}
            />
          )}

          {step === 'expenses' && (
            <ExpenseForm
              members={members}
              expenses={expenses}
              setExpenses={setExpenses}
              onComplete={calculateFinalSettlement}
              error={error}
              setError={setError}
            />
          )}

          {step === 'settlement' && (
            <SettlementView
              settlements={settlements}
              paymentCode={paymentCode}
              roundingMethod={roundingMethod}
              onRoundingMethodChange={setRoundingMethod}
              onReset={() => {
                setMembers([]);
                setExpenses([]);
                setSettlements([]);
                setPaymentCode(undefined);
                setStep('members');
              }}
              onBack={() => {
                setSettlements([]);
                setStep('expenses');
              }}
              members={members}
              expenses={expenses}
              onSettlementsUpdate={setSettlements}
            />
          )}
        </div>

        <div className="mt-8 text-sm text-gray-500 text-center">
          ※ メンバーの名前には個人を特定できる情報を入力しないでください<br />
          ※ 生成したWCANコードに1週間アクセスが無い場合は、WCANに紐づく登録情報が消えますのでご注意ください
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ icon, text, active, completed, onClick }: {
  icon: React.ReactNode;
  text: string;
  active: boolean;
  completed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center space-y-2 p-2 rounded-lg transition-colors
        ${active ? 'text-indigo-600' : completed ? 'text-green-600 cursor-pointer' : 'text-gray-400'}
        ${!active && !completed ? 'cursor-not-allowed' : 'hover:bg-indigo-50'}`}
    >
      {icon}
      <span className="text-sm font-medium">{text}</span>
    </button>
  );
}

export default App;