import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '确定',
  cancelText = '取消'
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[320px] rounded-3xl p-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-[15px] text-gray-500 leading-relaxed">{message}</p>
      </div>
      <div className="flex flex-col gap-3">
        <Button 
          variant="danger" 
          className="w-full h-12 rounded-2xl text-[15px] font-semibold"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmText}
        </Button>
        <Button 
          variant="secondary" 
          className="w-full h-12 rounded-2xl text-[15px] font-semibold bg-gray-100 text-gray-900"
          onClick={onClose}
        >
          {cancelText}
        </Button>
      </div>
    </Modal>
  );
}
