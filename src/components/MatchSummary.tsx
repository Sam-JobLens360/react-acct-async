import React from 'react';
import { MismatchWarning } from '../types';

interface MatchSummaryProps {
  bankCount: number;
  accountingCount: number;
  bankLinked: number;
  accountingLinked: number;
  mismatchWarning: MismatchWarning | null;
}

const MatchSummary: React.FC<MatchSummaryProps> = ({
  bankCount,
  accountingCount,
  bankLinked,
  accountingLinked,
  mismatchWarning,
}) => {
  return (
    <div className="match-summary">
      <div className="summary-stats">
        <div className="stat-group">
          <span className="stat-label">Bank</span>
          <span className="stat-value">{bankLinked}/{bankCount} linked</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-group">
          <span className="stat-label">Accounting</span>
          <span className="stat-value">{accountingLinked}/{accountingCount} linked</span>
        </div>
      </div>

      {mismatchWarning && (
        <div className="mismatch-warnings">
          {mismatchWarning.amountMismatch && (
            <div className="mismatch-badge mismatch-amount">
              Amount mismatch: Bank {mismatchWarning.bankAmount.toFixed(2)} vs Acct {mismatchWarning.accountingAmount.toFixed(2)}
            </div>
          )}
          {mismatchWarning.dateMismatch && (
            <div className="mismatch-badge mismatch-date">
              Date mismatch: Bank {mismatchWarning.bankDate || '—'} vs Acct {mismatchWarning.accountingDate || '—'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MatchSummary;
