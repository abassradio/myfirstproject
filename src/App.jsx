import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import { useAuthContext } from "./context/AuthContext";
import { SignupForm, LoginForm } from "./components/AuthForms";
import ErrorAlert from "./components/ErrorAlert";
import SuccessAlert from "./components/SuccessAlert";
import { useErrorHandler } from "./hooks/useErrorHandler";

function App() {
  const { user, loading, error, signUp, signIn, signOut, displayName } =
    useAuthContext();
  const { error: authError, handleError, clearError } = useErrorHandler();
  const [success, setSuccess] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [homeResetToken, setHomeResetToken] = useState(0);

  const handleSignup = async (email, password, username) => {
    setIsLoading(true);
    clearError();
    setSuccess("");
    try {
      await signUp(email, password, username);
      setSuccess("تم إنشاء حسابك بنجاح! يرجى تسجيل الدخول.");
      setShowSignup(false);
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      handleError(err, "فشل في إنشاء الحساب. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email, password) => {
    setIsLoading(true);
    clearError();
    setSuccess("");
    try {
      await signIn(email, password);
      setSuccess("تم تسجيل الدخول بنجاح!");
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      handleError(err, "بيانات الدخول غير صحيحة.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    clearError();
    try {
      await signOut();
      setSuccess("تم تسجيل الخروج بنجاح!");
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      handleError(err, "فشل تسجيل الخروج.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleHomeClick = () => {
    setHomeResetToken((prev) => prev + 1);
  };

  // جاري التحميل
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // عرض نموذج المصادقة إذا لم يكن المستخدم متسجلاً
  if (!user) {
    if (showSignup) {
      return (
        <>
          <SignupForm
            onSubmit={handleSignup}
            isLoading={isLoading}
            error={authError || error}
          />
          <ErrorAlert message={authError} onClose={clearError} />
          <SuccessAlert message={success} onClose={() => setSuccess("")} />
        </>
      );
    }
    return (
      <>
        <LoginForm
          onSubmit={handleLogin}
          isLoading={isLoading}
          error={authError || error}
          onSwitchToSignup={() => setShowSignup(true)}
        />
        <ErrorAlert message={authError} onClose={clearError} />
        <SuccessAlert message={success} onClose={() => setSuccess("")} />
      </>
    );
  }

  // عرض التطبيق الرئيسي
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 pb-16 pt-10">
        <Header
          userDisplayName={displayName}
          onLogout={handleLogout}
          onHomeClick={() => setHomeResetToken((prev) => prev + 1)}
        />
        <Routes>
          <Route path="/" element={<Home resetToken={homeResetToken} />} />
        </Routes>
      </div>
      <ErrorAlert message={authError} onClose={clearError} />
      <SuccessAlert message={success} onClose={() => setSuccess("")} />
    </div>
  );
}

export default App;
