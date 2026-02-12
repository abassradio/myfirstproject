import { Link } from "react-router-dom";

function Header({ userDisplayName, onLogout, onHomeClick }) {
  return (
    <header className="sticky top-0 z-40 flex flex-col gap-6 bg-white/80 py-4 backdrop-blur-md shadow-sm shadow-slate-200/60 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <Link
          to="/"
          aria-label="الرجوع للرئيسية"
          className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:text-indigo-600 hover:shadow-md"
          onClick={onHomeClick}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 20h18" />
            <path d="M5 20V9l7-5 7 5v11" />
            <path d="M9 20v-6h6v6" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
          نظام إدارة المشاريع والمقاولات
        </h1>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-slate-600 font-medium">
          {userDisplayName || "مستخدم"}
        </span>
        {onLogout && (
          <button
            type="button"
            className="min-h-[44px] rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md"
            onClick={onLogout}
          >
            تسجيل الخروج
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
