import React, { useRef, useState, useCallback } from 'react';
import { BankTransaction, AccountingTransaction, FilterMode } from '../types';

type AnyTransaction = BankTransaction | AccountingTransaction;

interface Column<T> {
  key: string;
  label: string;
  defaultWidth?: number;
  render?: (row: T) => React.ReactNode;
}

interface TransactionTableProps<T extends AnyTransaction> {
  title: string;
  rows: T[];
  columns: Column<T>[];
  selectedId: string | null;
  onSelectRow: (id: string) => void;
  filterMode: FilterMode;
  onFilterChange: (mode: FilterMode) => void;
  searchText: string;
  onSearchChange: (text: string) => void;
  possibleMatchIds: Set<string>;
  tableType: 'bank' | 'accounting';
}

function TransactionTable<T extends AnyTransaction>({
  title,
  rows,
  columns,
  selectedId,
  onSelectRow,
  filterMode,
  onFilterChange,
  searchText,
  onSearchChange,
  possibleMatchIds,
  tableType,
}: TransactionTableProps<T>) {
  const [colWidths, setColWidths] = useState<number[]>(() =>
    columns.map((c) => c.defaultWidth ?? 120)
  );
  const resizingRef = useRef<{
    colIndex: number;
    startX: number;
    startWidth: number;
  } | null>(null);

  const onMouseDown = useCallback(
    (e: React.MouseEvent, colIndex: number) => {
      e.preventDefault();
      resizingRef.current = {
        colIndex,
        startX: e.clientX,
        startWidth: colWidths[colIndex],
      };

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (!resizingRef.current) return;
        const delta = moveEvent.clientX - resizingRef.current.startX;
        const newWidth = Math.max(60, resizingRef.current.startWidth + delta);
        setColWidths((prev) => {
          const next = [...prev];
          next[resizingRef.current!.colIndex] = newWidth;
          return next;
        });
      };

      const onMouseUp = () => {
        resizingRef.current = null;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [colWidths]
  );

  const filteredRows = rows.filter((row) => {
    if (filterMode === 'linked' && !row.linkedId) return false;
    if (filterMode === 'unlinked' && row.linkedId) return false;
    if (searchText.trim()) {
      const lower = searchText.toLowerCase();
      return Object.values(row).some((v) =>
        String(v ?? '').toLowerCase().includes(lower)
      );
    }
    return true;
  });

  const totalRows = rows.length;
  const linkedRows = rows.filter((r) => r.linkedId).length;
  const unlinkedRows = totalRows - linkedRows;

  return (
    <div className={`transaction-table-container table-${tableType}`}>
      <div className="table-header-bar">
        <h3 className="table-title">{title}</h3>
        <div className="table-counts">
          <span className="count-badge count-total" title="Total rows">
            Total: {totalRows}
          </span>
          <span className="count-badge count-linked" title="Linked rows">
            Linked: {linkedRows}
          </span>
          <span className="count-badge count-unlinked" title="Unlinked rows">
            Unlinked: {unlinkedRows}
          </span>
        </div>
      </div>

      <div className="table-controls">
        <input
          type="text"
          className="search-box"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <div className="filter-buttons">
          {(['all', 'unlinked', 'linked'] as FilterMode[]).map((mode) => (
            <button
              key={mode}
              className={`filter-btn${filterMode === mode ? ' active' : ''}`}
              onClick={() => onFilterChange(mode)}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="table-scroll-wrapper">
        <table className="txn-table" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            {columns.map((_, i) => (
              <col key={i} style={{ width: colWidths[i] }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={col.key} className="txn-th">
                  <div className="th-inner">
                    <span className="th-label">{col.label}</span>
                    <span
                      className="col-resize-handle"
                      onMouseDown={(e) => onMouseDown(e, i)}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="empty-state">
                  {rows.length === 0
                    ? 'No data loaded. Upload a JSON file.'
                    : 'No rows match the current filter.'}
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => {
                const isSelected = row.id === selectedId;
                const isLinked = !!row.linkedId;
                const isPossibleMatch = possibleMatchIds.has(row.id);

                let rowClass = 'txn-row';
                if (isSelected) rowClass += ' row-selected';
                if (isLinked) rowClass += ' row-linked';
                if (isPossibleMatch && !isLinked) rowClass += ' row-possible-match';

                return (
                  <tr key={row.id} className={rowClass}>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="txn-td"
                        title={col.render ? undefined : String((row as any)[col.key] ?? '')}
                      >
                        {col.render ? col.render(row) : String((row as any)[col.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransactionTable;
