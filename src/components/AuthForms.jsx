import { useState } from "react";

const AuthShell = ({ title, subtitle, children }) => (
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

export const SignupForm = ({ onSubmit, isLoading = false, error = null }) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setLocalError("");

    if (!email.trim()) {
      setLocalError("يرجى إدخال البريد الإلكتروني");
      return;
    }

    if (!username.trim()) {
      setLocalError("يرجى إدخال اسم المستخدم المراد عرضه");
      return;
    }

    if (!password.trim()) {
      setLocalError("يرجى إدخال كلمة المرور");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("كلمات المرور غير متطابقة");
      return;
    }

    onSubmit(email.trim(), password, username.trim());
  };

  return (
    <AuthShell
      title="إنشاء حساب"
      subtitle="أنشئ حسابك الخاص للوصول إلى النظام لأول مرة."
    >
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-semibold text-white/80">
          البريد الإلكتروني
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-right text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none disabled:opacity-50"
            placeholder="your@email.com"
          />
        </label>
        <label className="block text-sm font-semibold text-white/80">
          اسم المستخدم للعرض
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-right text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none disabled:opacity-50"
            placeholder="مثال: Ali"
          />
        </label>
        <label className="block text-sm font-semibold text-white/80">
          كلمة المرور
          <div className="mt-2 flex items-center">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="flex-1 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-right text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none disabled:opacity-50"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="mr-2 rounded px-2 py-2 text-sm text-white/80 hover:text-white"
              aria-label={showPassword ? "إخفاء كلمة السر" : "عرض كلمة السر"}
            >
              {showPassword ? "إخفاء" : "عرض"}
            </button>
          </div>
        </label>
        <label className="block text-sm font-semibold text-white/80">
          تأكيد كلمة المرور
          <div className="mt-2 flex items-center">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              className="flex-1 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-right text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none disabled:opacity-50"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((s) => !s)}
              className="mr-2 rounded px-2 py-2 text-sm text-white/80 hover:text-white"
              aria-label={
                showConfirmPassword
                  ? "إخفاء تأكيد كلمة السر"
                  : "عرض تأكيد كلمة السر"
              }
            >
              {showConfirmPassword ? "إخفاء" : "عرض"}
            </button>
          </div>
        </label>
        {(localError || error) && (
          <p className="text-sm text-rose-200">{localError || error}</p>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="min-h-[48px] w-full rounded-2xl bg-white text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
        </button>
      </form>
    </AuthShell>
  );
};

export const LoginForm = ({
  onSubmit,
  isLoading = false,
  error = null,
  onSwitchToSignup,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setLocalError("");

    if (!email.trim()) {
      setLocalError("يرجى إدخال البريد الإلكتروني");
      return;
    }

    if (!password.trim()) {
      setLocalError("يرجى إدخال كلمة المرور");
      return;
    }

    onSubmit(email.trim(), password);
  };

  return (
    <AuthShell
      title="تسجيل الدخول"
      subtitle="يرجى إدخال بياناتك للوصول إلى المشاريع والحسابات."
    >
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-semibold text-white/80">
          البريد الإلكتروني
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-right text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none disabled:opacity-50"
            placeholder="your@email.com"
          />
        </label>
        <label className="block text-sm font-semibold text-white/80">
          كلمة المرور
          <div className="mt-2 flex items-center">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="flex-1 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-right text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none disabled:opacity-50"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="mr-2 rounded px-2 py-2 text-sm text-white/80 hover:text-white"
              aria-label={showPassword ? "إخفاء كلمة السر" : "عرض كلمة السر"}
            >
              {showPassword ? "إخفاء" : "عرض"}
            </button>
          </div>
        </label>
        {(localError || error) && (
          <p className="text-sm text-rose-200">{localError || error}</p>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="min-h-[48px] w-full rounded-2xl bg-white text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "جارٍ الدخول..." : "دخول النظام"}
        </button>
        {onSwitchToSignup && (
          <div className="flex justify-center">
            <p className="text-sm text-white/70">
              ليس لديك حساب؟{" "}
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="font-semibold text-white hover:underline"
              >
                أنشئ واحداً الآن
              </button>
            </p>
          </div>
        )}
      </form>
    </AuthShell>
  );
};
