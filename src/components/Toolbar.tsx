import React, { useRef } from 'react';

interface ToolbarProps {
  onLoadBank: (file: File) => void;
  onLoadAccounting: (file: File) => void;
  onClearSession: () => void;
  onMatchSelected: () => void;
  onUnlinkSelected: () => void;
  canMatch: boolean;
  canUnlink: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onLoadBank,
  onLoadAccounting,
  onClearSession,
  onMatchSelected,
  onUnlinkSelected,
  canMatch,
  canUnlink,
}) => {
  const bankFileRef = useRef<HTMLInputElement>(null);
  const accountingFileRef = useRef<HTMLInputElement>(null);

  const handleBankFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onLoadBank(file);
    e.target.value = '';
  };

  const handleAccountingFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onLoadAccounting(file);
    e.target.value = '';
  };

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <input
          type="file"
          accept=".json"
          ref={bankFileRef}
          style={{ display: 'none' }}
          onChange={handleBankFile}
        />
        <button
          className="toolbar-btn btn-bank"
          onClick={() => bankFileRef.current?.click()}
        >
          Upload Bank JSON
        </button>

        <input
          type="file"
          accept=".json"
          ref={accountingFileRef}
          style={{ display: 'none' }}
          onChange={handleAccountingFile}
        />
        <button
          className="toolbar-btn btn-accounting"
          onClick={() => accountingFileRef.current?.click()}
        >
          Upload Accounting JSON
        </button>
      </div>

      <div className="toolbar-group">
        <button
          className="toolbar-btn btn-match"
          onClick={onMatchSelected}
          disabled={!canMatch}
          title="Link the selected bank row and accounting row"
        >
          Match Selected
        </button>
        <button
          className="toolbar-btn btn-unlink"
          onClick={onUnlinkSelected}
          disabled={!canUnlink}
          title="Unlink the selected linked rows"
        >
          Unlink Selected
        </button>
      </div>

      <div className="toolbar-group toolbar-group-right">
        <button
          className="toolbar-btn btn-clear"
          onClick={onClearSession}
          title="Clear all loaded data from this session"
        >
          Clear Session
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
