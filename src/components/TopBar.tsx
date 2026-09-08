import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';

interface TopBarProps {
  title?: string;
  onBack?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ title, onBack }) => {
  return (
    <div className="topbar">
      {onBack && (
        <button className="topbar__back" onClick={onBack} aria-label="Wstecz">
          <FiArrowLeft size={18} />
        </button>
      )}
      {title && <span className="topbar__title">{title}</span>}
    </div>
  );
};
