import React, { useState, useCallback } from 'react';
import './App.css';
import { BankTransaction, AccountingTransaction } from './types';
import Toolbar from './components/Toolbar';
import TransactionCompareView from './components/TransactionCompareView';

function padId(index: number): string {
  return String(index + 1).padStart(3, '0');
}

function parseBankRow(raw: Record<string, unknown>, index: number): BankTransaction {
  return {
    id: `B-${padId(index)}`,
    date: String(raw['date'] ?? raw['Date'] ?? raw['DATE'] ?? ''),
    transactionType: String(
      raw['transactionType'] ?? raw['transaction_type'] ?? raw['type'] ?? raw['Type'] ?? ''
    ),
    amount: parseFloat(String(raw['amount'] ?? raw['Amount'] ?? raw['AMOUNT'] ?? '0')) || 0,
    description: String(
      raw['description'] ?? raw['Description'] ?? raw['memo'] ?? raw['Memo'] ?? ''
    ),
    linkedId: null,
    raw,
  };
}

function parseAccountingRow(
  raw: Record<string, unknown>,
  index: number
): AccountingTransaction {
  return {
    id: `A-${padId(index)}`,
    date: String(raw['date'] ?? raw['Date'] ?? raw['DATE'] ?? ''),
    description: String(
      raw['description'] ?? raw['Description'] ?? raw['memo'] ?? raw['Memo'] ?? ''
    ),
    amount: parseFloat(String(raw['amountNum'] ?? raw['amount'] ?? raw['Amount'] ?? raw['AMOUNT'] ?? '0')) || 0,
    notes: String(raw['notes'] ?? raw['Notes'] ?? raw['note'] ?? ''),
    linkedId: null,
    raw,
  };
}

function readJsonFile(file: File): Promise<unknown[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) {
          reject(new Error('JSON file must contain an array of transactions.'));
        } else {
          resolve(parsed);
        }
      } catch {
        reject(new Error('Invalid JSON. Please upload a valid JSON file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read the file.'));
    reader.readAsText(file);
  });
}

function App() {
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [accountingTransactions, setAccountingTransactions] = useState<
    AccountingTransaction[]
  >([]);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [selectedAccountingId, setSelectedAccountingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadBankJson = useCallback(async (file: File) => {
    try {
      setError(null);
      const rows = await readJsonFile(file);
      setBankTransactions(
        rows.map((r, i) => parseBankRow(r as Record<string, unknown>, i))
      );
      setSelectedBankId(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const loadAccountingJson = useCallback(async (file: File) => {
    try {
      setError(null);
      const rows = await readJsonFile(file);
      setAccountingTransactions(
        rows.map((r, i) => parseAccountingRow(r as Record<string, unknown>, i))
      );
      setSelectedAccountingId(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const selectBankRow = useCallback((id: string) => {
    setSelectedBankId((prev) => (prev === id ? null : id));
  }, []);

  const selectAccountingRow = useCallback((id: string) => {
    setSelectedAccountingId((prev) => (prev === id ? null : id));
  }, []);

  const linkSelectedRows = useCallback(() => {
    if (!selectedBankId || !selectedAccountingId) return;

    setBankTransactions((prev) =>
      prev.map((row) =>
        row.id === selectedBankId ? { ...row, linkedId: selectedAccountingId } : row
      )
    );
    setAccountingTransactions((prev) =>
      prev.map((row) =>
        row.id === selectedAccountingId ? { ...row, linkedId: selectedBankId } : row
      )
    );
    setSelectedBankId(null);
    setSelectedAccountingId(null);
  }, [selectedBankId, selectedAccountingId]);

  const unlinkRows = useCallback((bankId: string, accountingId: string) => {
    setBankTransactions((prev) =>
      prev.map((row) => (row.id === bankId ? { ...row, linkedId: null } : row))
    );
    setAccountingTransactions((prev) =>
      prev.map((row) => (row.id === accountingId ? { ...row, linkedId: null } : row))
    );
    setSelectedBankId(null);
    setSelectedAccountingId(null);
  }, []);

  const handleUnlinkSelected = useCallback(() => {
    // Unlink the currently selected linked rows if both are linked to each other
    if (selectedBankId && selectedAccountingId) {
      unlinkRows(selectedBankId, selectedAccountingId);
      return;
    }
    // Allow unlinking a single selected linked row
    if (selectedBankId) {
      const bankRow = bankTransactions.find((r) => r.id === selectedBankId);
      if (bankRow?.linkedId) unlinkRows(selectedBankId, bankRow.linkedId);
    } else if (selectedAccountingId) {
      const acctRow = accountingTransactions.find((r) => r.id === selectedAccountingId);
      if (acctRow?.linkedId) unlinkRows(acctRow.linkedId, selectedAccountingId);
    }
  }, [
    selectedBankId,
    selectedAccountingId,
    bankTransactions,
    accountingTransactions,
    unlinkRows,
  ]);

  const clearSession = useCallback(() => {
    setBankTransactions([]);
    setAccountingTransactions([]);
    setSelectedBankId(null);
    setSelectedAccountingId(null);
    setError(null);
  }, []);

  // Can match: one row selected per table, neither already linked
  const selectedBank = bankTransactions.find((r) => r.id === selectedBankId);
  const selectedAcct = accountingTransactions.find((r) => r.id === selectedAccountingId);
  const canMatch =
    !!selectedBankId &&
    !!selectedAccountingId &&
    !selectedBank?.linkedId &&
    !selectedAcct?.linkedId;

  // Can unlink: at least one selected row is linked
  const canUnlink =
    (!!selectedBankId && !!selectedBank?.linkedId) ||
    (!!selectedAccountingId && !!selectedAcct?.linkedId);

  return (
    <div className="app-root">
      <header className="app-header">
        <h1 className="app-title">Transaction Comparator</h1>
        <p className="app-subtitle">
          Compare bank exports against accounting app exports side-by-side.
        </p>
      </header>

      <Toolbar
        onLoadBank={loadBankJson}
        onLoadAccounting={loadAccountingJson}
        onClearSession={clearSession}
        onMatchSelected={linkSelectedRows}
        onUnlinkSelected={handleUnlinkSelected}
        canMatch={canMatch}
        canUnlink={canUnlink}
      />

      {error && (
        <div className="error-banner" role="alert">
          <strong>Error:</strong> {error}
          <button className="error-dismiss" onClick={() => setError(null)}>
            ✕
          </button>
        </div>
      )}

      <main className="app-main">
        <TransactionCompareView
          bankTransactions={bankTransactions}
          accountingTransactions={accountingTransactions}
          selectedBankId={selectedBankId}
          selectedAccountingId={selectedAccountingId}
          onSelectBank={selectBankRow}
          onSelectAccounting={selectAccountingRow}
          onUnlinkRows={unlinkRows}
        />
      </main>
    </div>
  );
}

export default App;
