export default function Modal({ isOpen, onClose, title, message, type = 'alert', onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-primary-600 px-6 py-4">
          <h3 className="text-lg font-bold text-white">{title || 'Messaggio'}</h3>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <p className="text-gray-700 text-base">{message}</p>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          {type === 'confirm' && (
            <button
              onClick={() => {
                if (onConfirm) onConfirm(false);
                onClose();
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Annulla
            </button>
          )}
          <button
            onClick={() => {
              if (type === 'confirm' && onConfirm) onConfirm(true);
              onClose();
            }}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            Conferma
          </button>
        </div>
      </div>
    </div>
  );
}
