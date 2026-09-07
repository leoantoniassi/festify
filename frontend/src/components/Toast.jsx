import { useEffect, useState } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bg = type === 'success'
    ? 'bg-secondary text-on-secondary'
    : type === 'warning'
      ? 'bg-warning text-on-warning'
      : 'bg-error text-on-error';
  const icon = type === 'success'
    ? 'check_circle'
    : type === 'warning'
      ? 'warning'
      : 'cancel';

  return (
    <div
      className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl transition-all duration-300 ${bg} ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
      }`}
    >
      <span className="material-symbols-outlined filled text-lg">{icon}</span>
      <span className="text-sm font-bold">{message}</span>
      <button onClick={() => { setVisible(false); setTimeout(onClose, 300); }} className="ml-2 p-0.5 rounded-full hover:bg-surface/20 transition-colors">
        <span className="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  );
}
