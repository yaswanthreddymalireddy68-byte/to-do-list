import { createContext, useContext, useState } from 'react';
import { Check, CircleAlert, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function notify(message, type = 'success') {
    const id = crypto.randomUUID();
    setToasts((items) => [...items, { id, message, type }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 3600);
  }

  return <ToastContext.Provider value={notify}>{children}<div className="toast-stack" aria-live="polite">{toasts.map((toast) => <div className={`toast toast-${toast.type}`} key={toast.id}><span className="toast-icon">{toast.type === 'success' ? <Check size={16} /> : <CircleAlert size={16} />}</span><span>{toast.message}</span><button className="icon-button toast-close" onClick={() => setToasts((items) => items.filter((item) => item.id !== toast.id))} aria-label="Dismiss"><X size={15} /></button></div>)}</div></ToastContext.Provider>;
}

export function useToast() {
  return useContext(ToastContext);
}
