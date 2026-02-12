function SuccessAlert({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 rounded-lg border border-emerald-200 bg-emerald-50 p-4 shadow-md md:left-auto md:right-4 md:max-w-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <svg
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm font-semibold text-emerald-800">نجح</p>
            <p className="mt-1 text-sm text-emerald-700">{message}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex-shrink-0 text-emerald-600 transition hover:text-emerald-800"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default SuccessAlert;
