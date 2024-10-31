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

  const addMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMemberName.trim()) {
      setMembers([...members, { id: Date.now().toString(), name: newMemberName.trim() }]);
      setNewMemberName('');
    }
  };

  const removeMember = (id: string) => {
    setMembers(members.filter(member => member.id !== id));
  };

  return (
    <div className="space-y-6">
      <form onSubmit={addMember} className="flex gap-2">
        <input
          type="text"
          value={newMemberName}
          onChange={(e) => setNewMemberName(e.target.value)}
          placeholder="メンバーの名前を入力"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <UserPlus size={20} />
          <span>追加</span>
        </button>
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

      {members.length >= 2 && (
        <button
          onClick={onComplete}
          className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          支払い登録へ進む
        </button>
      )}
    </div>
  );
}