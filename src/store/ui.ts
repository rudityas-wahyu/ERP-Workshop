import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ConfirmDialog {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

interface UIState {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
  
  confirmDialog: ConfirmDialog;
  showConfirm: (message: string, onConfirm: () => void) => void;
  closeConfirm: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
    }, 3000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) })),
  
  confirmDialog: {
    isOpen: false,
    message: '',
    onConfirm: () => {},
    onCancel: () => {},
  },
  showConfirm: (message, onConfirm) => set({
    confirmDialog: {
      isOpen: true,
      message,
      onConfirm: () => {
        onConfirm();
        set(state => ({ confirmDialog: { ...state.confirmDialog, isOpen: false } }));
      },
      onCancel: () => {
        set(state => ({ confirmDialog: { ...state.confirmDialog, isOpen: false } }));
      }
    }
  }),
  closeConfirm: () => set(state => ({ confirmDialog: { ...state.confirmDialog, isOpen: false } })),
}));
