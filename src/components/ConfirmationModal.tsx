
import React, { useEffect } from 'react';
import { useTranslation } from '../lib/i18n.tsx';
import CloseIcon from './icons/CloseIcon.tsx';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  isConfirmDisabled?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  confirmButtonClass = 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
  isConfirmDisabled = false,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-slate-200">
          <h2 id="confirmation-modal-title" className="text-xl font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 transition-colors">
            <CloseIcon className="h-6 w-6 text-slate-500" />
          </button>
        </header>
        <main className="p-6">
          <div className="text-slate-600">{message}</div>
        </main>
        <footer className="flex justify-end items-center p-4 bg-slate-50 rounded-b-2xl space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 transition-colors text-slate-800 font-medium"
          >
            {cancelText || t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={isConfirmDisabled}
            className={`px-4 py-2 rounded-lg transition-colors text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${confirmButtonClass} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {confirmText || t('common.delete')}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ConfirmationModal;