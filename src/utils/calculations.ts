import { Member, Expense, Settlement, RoundingMethod } from '../types';

function roundAmount(amount: number, method: RoundingMethod): number {
  switch (method) {
    case 'floor':
      return Math.floor(amount);
    case 'ceil':
      return Math.ceil(amount);
    case 'round':
      return Math.round(amount);
  }
}

export function getRoundingDifference(
  members: Member[],
  expenses: Expense[],
  roundingMethod: RoundingMethod
): number {
  if (roundingMethod === 'floor') return 0;

  let exactTotal = 0;
  let roundedTotal = 0;

  expenses.forEach(expense => {
    const beneficiaryIds = expense.beneficiaryIds;
    if (beneficiaryIds.length > 0) {
      const amountPerPerson = expense.splitType === 'equal'
        ? expense.amount / beneficiaryIds.length
        : expense.amount;

      beneficiaryIds.forEach(beneficiaryId => {
        if (beneficiaryId !== expense.payerId) {
          exactTotal += amountPerPerson;
          roundedTotal += roundAmount(amountPerPerson, roundingMethod);
        }
      });
    }
  });

  return roundedTotal - Math.floor(exactTotal);
}

export function calculateSettlements(
  members: Member[],
  expenses: Expense[],
  roundingMethod: RoundingMethod,
  roundingAdjusterId?: string
): Settlement[] {
  // 各メンバーの収支を計算
  const balances = new Map<string, number>();
  members.forEach(member => balances.set(member.id, 0));

  // 支払いを処理
  expenses.forEach(expense => {
    const payer = expense.payerId;
    const beneficiaryIds = expense.beneficiaryIds;
    
    if (beneficiaryIds.length > 0) {
      // 各受益者が支払う金額を計算
      const amountPerPerson = expense.splitType === 'equal'
        ? expense.amount / beneficiaryIds.length
        : expense.amount;
      
      // 各メンバーの収支を計算
      beneficiaryIds.forEach(beneficiaryId => {
        if (beneficiaryId === payer) {
          const othersCount = beneficiaryIds.filter(id => id !== payer).length;
          balances.set(
            payer,
            (balances.get(payer) || 0) + roundAmount(amountPerPerson * othersCount, roundingMethod)
          );
        } else {
          const amount = roundAmount(amountPerPerson, roundingMethod);
          balances.set(
            beneficiaryId,
            (balances.get(beneficiaryId) || 0) - amount
          );
        }
      });
    }
  });

  // 端数調整
  if (roundingMethod !== 'floor' && roundingAdjusterId) {
    const difference = getRoundingDifference(members, expenses, roundingMethod);
    if (difference > 0) {
      balances.set(
        roundingAdjusterId,
        (balances.get(roundingAdjusterId) || 0) - difference
      );
    }
  }

  // 精算リストを作成
  const settlements: Settlement[] = [];
  const debtors = members.filter(m => (balances.get(m.id) || 0) < 0)
    .map(m => ({ id: m.id, balance: balances.get(m.id) || 0 }))
    .sort((a, b) => a.balance - b.balance);

  const creditors = members.filter(m => (balances.get(m.id) || 0) > 0)
    .map(m => ({ id: m.id, balance: balances.get(m.id) || 0 }))
    .sort((a, b) => b.balance - a.balance);

  // 債務者から債権者への支払いを計算
  debtors.forEach(debtor => {
    let remainingDebt = Math.abs(debtor.balance);
    
    creditors.forEach(creditor => {
      if (remainingDebt > 0 && creditor.balance > 0) {
        const amount = Math.min(remainingDebt, creditor.balance);
        if (amount >= 1) {
          settlements.push({
            from: members.find(m => m.id === debtor.id)!.name,
            to: members.find(m => m.id === creditor.id)!.name,
            amount: amount,
          });
        }
        remainingDebt -= amount;
        creditor.balance -= amount;
      }
    });
  });

  return settlements;
}