import React, { useState } from 'react';
import { Member } from '../types';
import { UserPlus, X } from 'lucide-react';

interface MemberListProps {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  onComplete: () => void;
}

export default function MemberList({ members, setMembers, onComplete }: MemberListProps) {
  const [newMemberName, setNewMemberName] = useState('');
  const [error, setError] = useState<string>();

  const addMember = (e: React.FormEvent) => {
    e.preventDefault();
    const nickname = newMemberName.trim();
    
    if (!nickname) {
      setError('ニックネームを入力してください');
      return;
    }

    if (members.some(m => m.name.toLowerCase() === nickname.toLowerCase())) {
      setError('このニックネームは既に使用されています');
      return;
    }

    setMembers([...members, { id: Date.now().toString(), name: nickname }]);
    setNewMemberName('');
    setError(undefined);
  };

  const removeMember = (id: string) => {
    setMembers(members.filter(member => member.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-blue-800 font-medium mb-2">支払いに関係するメンバーの登録</h3>
        <p className="text-sm text-blue-600">
          支払いの分配に関係する人のニックネームを登録してください。<br />
          個人を特定できる情報（本名など）は使用しないでください。
        </p>
      </div>

      <form onSubmit={addMember} className="space-y-4">
        <div>
          <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
            ニックネーム
          </label>
          <div className="flex gap-2">
            <input
              id="nickname"
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="例: グループA、買い物係など"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <UserPlus size={20} />
              <span>追加</span>
            </button>
          </div>
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
      </form>

      <div className="space-y-2">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <span className="font-medium">{member.name}</span>
            <button
              onClick={() => removeMember(member.id)}
              className="text-gray-500 hover:text-red-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        ))}
      </div>

      {members.length >= 2 ? (
        <button
          onClick={onComplete}
          className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          支払い登録へ進む ({members.length}人)
        </button>
      ) : (
        <p className="text-sm text-gray-500 text-center">
          支払い登録を始めるには、2人以上のメンバーが必要です
        </p>
      )}
    </div>
  );
}