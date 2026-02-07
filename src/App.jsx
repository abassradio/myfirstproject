import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";

const authStorageKey = "vibe-authenticated";
const credentialsStorageKey = "vibe-credentials";

// Load saved account credentials from localStorage.
const loadCredentials = () => {
  try {
    const raw = localStorage.getItem(credentialsStorageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const LoginShell = ({ title, subtitle, children }) => (
  <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 py-12">
    <div className="absolute inset-0">
      <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="absolute right-[-6rem] top-[-4rem] h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" />
      <div className="absolute bottom-[-8rem] left-1/3 h-96 w-96 rounded-full bg-amber-300/20 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.9),_rgba(2,6,23,1))]" />
    </div>
    <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 text-white shadow-2xl backdrop-blur">
      <div className="space-y-2 text-right">
        <p className="text-xs uppercase tracking-[0.4em] text-white/60">
          منصة إدارة المقاولات
        </p>
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="text-sm text-white/70">{subtitle}</p>
      </div>
      {children}
    </div>
  </div>
);

const CreateAccount = ({ onCreate }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("يرجى إدخال اسم المستخدم وكلمة المرور");
      return;
    }
    onCreate({ username: username.trim(), password });
  };

  return (
    <LoginShell
      title="إنشاء حساب"
      subtitle="أنشئ حسابك الخاص للوصول إلى النظام لأول مرة."
    >
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-semibold text-white/80">
          اسم المستخدم
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-right text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none"
            placeholder="مثال: admin"
          />
        </label>
        <label className="block text-sm font-semibold text-white/80">
          كلمة المرور
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-right text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none"
            placeholder="••••••••"
          />
        </label>
        {error ? <p className="text-sm text-rose-200">{error}</p> : null}
        <button
          type="submit"
          className="min-h-[48px] w-full rounded-2xl bg-white text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          إنشاء الحساب
        </button>
      </form>
    </LoginShell>
  );
};

const Login = ({ credentials, onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (
      username === credentials?.username &&
      password === credentials?.password
    ) {
      onLogin();
      return;
    }
    setError("بيانات الدخول غير صحيحة");
  };

  return (
    <LoginShell
      title="تسجيل الدخول"
      subtitle="يرجى إدخال بياناتك للوصول إلى المشاريع والحسابات."
    >
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-semibold text-white/80">
          اسم المستخدم
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-right text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none"
            placeholder="اسم المستخدم"
          />
        </label>
        <label className="block text-sm font-semibold text-white/80">
          كلمة المرور
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-right text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none"
            placeholder="••••••••"
          />
        </label>
        {error ? <p className="text-sm text-rose-200">{error}</p> : null}
        <button
          type="submit"
          className="min-h-[48px] w-full rounded-2xl bg-white text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          دخول النظام
        </button>
      </form>
    </LoginShell>
  );
};

const AccountSettingsModal = ({
  isOpen,
  onClose,
  onSave,
  currentUsername,
  currentPassword,
}) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newUsername, setNewUsername] = useState(currentUsername || "");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!oldPassword) {
      setError("يرجى إدخال كلمة المرور الحالية");
      return;
    }
    if (oldPassword !== currentPassword) {
      setError("كلمة المرور الحالية غير صحيحة");
      return;
    }
    if (!newUsername.trim() && !newPassword.trim()) {
      setError("يرجى إدخال اسم مستخدم جديد أو كلمة مرور جديدة");
      return;
    }
    onSave({
      username: newUsername.trim() || currentUsername,
      password: newPassword.trim() || currentPassword,
    });
    setOldPassword("");
    setNewPassword("");
    setError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-xl font-semibold text-slate-900">
            إعدادات الحساب
          </h3>
          <button
            type="button"
            className="min-h-[40px] rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
            onClick={onClose}
          >
            إغلاق
          </button>
        </div>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-slate-700">
            كلمة المرور الحالية
            <input
              type="password"
              value={oldPassword}
              onChange={(event) => setOldPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-slate-900 focus:outline-none"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            اسم المستخدم الجديد
            <input
              type="text"
              value={newUsername}
              onChange={(event) => setNewUsername(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-slate-900 focus:outline-none"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            كلمة المرور الجديدة
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-slate-900 focus:outline-none"
            />
          </label>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="min-h-[44px] rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md"
            >
              حفظ التغييرات
            </button>
            <button
              type="button"
              className="min-h-[44px] rounded-full border border-slate-300 px-6 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
              onClick={onClose}
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function App() {
  const [credentials, setCredentials] = useState(() => loadCredentials());
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const stored = localStorage.getItem(authStorageKey);
    return stored === "true";
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [homeResetToken, setHomeResetToken] = useState(0);

  // Save initial account credentials and start an authenticated session.
  const handleCreateAccount = (nextCredentials) => {
    localStorage.setItem(
      credentialsStorageKey,
      JSON.stringify(nextCredentials),
    );
    localStorage.setItem(authStorageKey, "true");
    setCredentials(nextCredentials);
    setIsAuthenticated(true);
  };

  const handleLogin = () => {
    localStorage.setItem(authStorageKey, "true");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem(authStorageKey);
    setIsAuthenticated(false);
  };

  // Persist updated credentials from the account settings dialog.
  const handleSaveCredentials = (nextCredentials) => {
    localStorage.setItem(
      credentialsStorageKey,
      JSON.stringify(nextCredentials),
    );
    setCredentials(nextCredentials);
    setIsSettingsOpen(false);
  };

  const handleHomeClick = () => {
    setHomeResetToken((prev) => prev + 1);
  };

  if (!credentials) {
    return <CreateAccount onCreate={handleCreateAccount} />;
  }

  if (!isAuthenticated) {
    return <Login credentials={credentials} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 pb-16 pt-10">
        <Header
          onLogout={handleLogout}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onHomeClick={handleHomeClick}
        />
        <Routes>
          <Route path="/" element={<Home resetToken={homeResetToken} />} />
        </Routes>
      </div>
      <AccountSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveCredentials}
        currentUsername={credentials.username}
        currentPassword={credentials.password}
      />
    </div>
  );
}

export default App;
