import React, { useState, useMemo } from 'react';
import {
  BankTransaction,
  AccountingTransaction,
  FilterMode,
  MismatchWarning,
} from '../types';
import TransactionTable from './TransactionTable';
import MatchSummary from './MatchSummary';

interface TransactionCompareViewProps {
  bankTransactions: BankTransaction[];
  accountingTransactions: AccountingTransaction[];
  selectedBankId: string | null;
  selectedAccountingId: string | null;
  onSelectBank: (id: string) => void;
  onSelectAccounting: (id: string) => void;
  onUnlinkRows: (bankId: string, accountingId: string) => void;
}

function datesClose(a: string, b: string): boolean {
  if (!a || !b) return false;
  const da = new Date(a).getTime();
  const db = new Date(b).getTime();
  if (isNaN(da) || isNaN(db)) return false;
  return Math.abs(da - db) <= 3 * 24 * 60 * 60 * 1000; // within 3 days
}

function descriptionOverlap(a: string, b: string): boolean {
  if (!a || !b) return false;
  const wa = a.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const wb = new Set(b.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
  return wa.some((w) => wb.has(w));
}

const TransactionCompareView: React.FC<TransactionCompareViewProps> = ({
  bankTransactions,
  accountingTransactions,
  selectedBankId,
  selectedAccountingId,
  onSelectBank,
  onSelectAccounting,
  onUnlinkRows,
}) => {
  const [bankFilter, setBankFilter] = useState<FilterMode>('all');
  const [accountingFilter, setAccountingFilter] = useState<FilterMode>('all');
  const [bankSearch, setBankSearch] = useState('');
  const [accountingSearch, setAccountingSearch] = useState('');

  // Compute possible matches (unlinked rows with similar amount/date/description)
  const possibleMatchPairs = useMemo(() => {
    const pairs: { bankId: string; accountingId: string }[] = [];
    const unlinkedBank = bankTransactions.filter((b) => !b.linkedId);
    const unlinkedAcct = accountingTransactions.filter((a) => !a.linkedId);

    for (const bank of unlinkedBank) {
      for (const acct of unlinkedAcct) {
        const amountMatch = bank.amount === acct.amount;
        const dateMatch = datesClose(bank.date, acct.date);
        const descMatch = descriptionOverlap(bank.description, acct.description);
        const score = (amountMatch ? 2 : 0) + (dateMatch ? 1 : 0) + (descMatch ? 1 : 0);
        if (score >= 2) {
          pairs.push({ bankId: bank.id, accountingId: acct.id });
        }
      }
    }
    return pairs;
  }, [bankTransactions, accountingTransactions]);

  const possibleBankIds = useMemo(
    () => new Set(possibleMatchPairs.map((p) => p.bankId)),
    [possibleMatchPairs]
  );
  const possibleAcctIds = useMemo(
    () => new Set(possibleMatchPairs.map((p) => p.accountingId)),
    [possibleMatchPairs]
  );

  // Mismatch warning when both rows are selected
  const mismatchWarning = useMemo<MismatchWarning | null>(() => {
    if (!selectedBankId || !selectedAccountingId) return null;
    const bank = bankTransactions.find((b) => b.id === selectedBankId);
    const acct = accountingTransactions.find((a) => a.id === selectedAccountingId);
    if (!bank || !acct) return null;
    const amountMismatch = bank.amount !== acct.amount;
    const dateMismatch = bank.date !== acct.date;
    if (!amountMismatch && !dateMismatch) return null;
    return {
      amountMismatch,
      dateMismatch,
      bankAmount: bank.amount,
      accountingAmount: acct.amount,
      bankDate: bank.date,
      accountingDate: acct.date,
    };
  }, [selectedBankId, selectedAccountingId, bankTransactions, accountingTransactions]);

  const bankLinked = bankTransactions.filter((r) => r.linkedId).length;
  const acctLinked = accountingTransactions.filter((r) => r.linkedId).length;

  // Column definitions for Bank table
  const bankColumns = [
    {
      key: 'id',
      label: 'ID',
      defaultWidth: 70,
    },
    {
      key: 'date',
      label: 'Date',
      defaultWidth: 100,
    },
    {
      key: 'transactionType',
      label: 'Type',
      defaultWidth: 90,
    },
    {
      key: 'amount',
      label: 'Amount',
      defaultWidth: 90,
      render: (row: BankTransaction) => (
        <span className={row.amount < 0 ? 'amount-negative' : 'amount-positive'}>
          {row.amount.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      defaultWidth: 180,
    },
    {
      key: 'select',
      label: 'Select',
      defaultWidth: 60,
      render: (row: BankTransaction) => (
        <input
          type="checkbox"
          className="row-checkbox"
          checked={selectedBankId === row.id}
          disabled={!!row.linkedId}
          onChange={() => onSelectBank(row.id)}
        />
      ),
    },
    {
      key: 'linkedId',
      label: 'Linked',
      defaultWidth: 90,
      render: (row: BankTransaction) =>
        row.linkedId ? (
          <span
            className="linked-badge"
            title={`Linked to ${row.linkedId}. Click to unlink.`}
            onClick={() => onUnlinkRows(row.id, row.linkedId!)}
            style={{ cursor: 'pointer' }}
          >
            {row.linkedId}
          </span>
        ) : (
          <span className="unlinked-dash">—</span>
        ),
    },
  ];

  // Column definitions for Accounting table
  const accountingColumns = [
    {
      key: 'id',
      label: 'ID',
      defaultWidth: 70,
    },
    {
      key: 'date',
      label: 'Date',
      defaultWidth: 100,
    },
    {
      key: 'description',
      label: 'Description',
      defaultWidth: 180,
    },
    {
      key: 'amountNum',
      label: 'Amount',
      defaultWidth: 90,
      render: (row: AccountingTransaction) => (
        <span className={row.amount < 0 ? 'amount-negative' : 'amount-positive'}>
          {row.amount.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'notes',
      label: 'Notes',
      defaultWidth: 140,
    },
    {
      key: 'select',
      label: 'Select',
      defaultWidth: 60,
      render: (row: AccountingTransaction) => (
        <input
          type="checkbox"
          className="row-checkbox"
          checked={selectedAccountingId === row.id}
          disabled={!!row.linkedId}
          onChange={() => onSelectAccounting(row.id)}
        />
      ),
    },
    {
      key: 'linkedId',
      label: 'Linked',
      defaultWidth: 90,
      render: (row: AccountingTransaction) =>
        row.linkedId ? (
          <span
            className="linked-badge"
            title={`Linked to ${row.linkedId}. Click to unlink.`}
            onClick={() => onUnlinkRows(row.linkedId!, row.id)}
            style={{ cursor: 'pointer' }}
          >
            {row.linkedId}
          </span>
        ) : (
          <span className="unlinked-dash">—</span>
        ),
    },
  ];

  return (
    <div className="compare-view">
      <MatchSummary
        bankCount={bankTransactions.length}
        accountingCount={accountingTransactions.length}
        bankLinked={bankLinked}
        accountingLinked={acctLinked}
        mismatchWarning={mismatchWarning}
      />

      <div className="tables-row">
        <TransactionTable
          title="Bank Transactions"
          rows={bankTransactions}
          columns={bankColumns as any}
          selectedId={selectedBankId}
          onSelectRow={onSelectBank}
          filterMode={bankFilter}
          onFilterChange={setBankFilter}
          searchText={bankSearch}
          onSearchChange={setBankSearch}
          possibleMatchIds={possibleBankIds}
          tableType="bank"
        />
        <div className="table-divider" />
        <TransactionTable
          title="Accounting Transactions"
          rows={accountingTransactions}
          columns={accountingColumns as any}
          selectedId={selectedAccountingId}
          onSelectRow={onSelectAccounting}
          filterMode={accountingFilter}
          onFilterChange={setAccountingFilter}
          searchText={accountingSearch}
          onSearchChange={setAccountingSearch}
          possibleMatchIds={possibleAcctIds}
          tableType="accounting"
        />
      </div>
    </div>
  );
};

export default TransactionCompareView;
