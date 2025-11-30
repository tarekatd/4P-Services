import React from 'react';
import { User, UserRole } from '../types';
import { UserIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from './icons';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  users: User[];
  onRegister: (user: Omit<User, 'id'>) => Promise<boolean>;
  authView: 'login' | 'register';
  onSwitchToLogin: () => void;
  onSwitchToRegister: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, users, onRegister, authView, onSwitchToLogin, onSwitchToRegister }) => {
  // --- Common State ---
  const [isLoading, setIsLoading] = React.useState(false);

  // --- Login State ---
  const [loginUsername, setLoginUsername] = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');
  const [loginError, setLoginError] = React.useState('');
  const [showLoginPassword, setShowLoginPassword] = React.useState(false);

  // --- Registration State ---
  const [regName, setRegName] = React.useState('');
  const [regUsername, setRegUsername] = React.useState('');
  const [regPassword, setRegPassword] = React.useState('');
  const [regRole, setRegRole] = React.useState<UserRole>(UserRole.BANK);
  const [regError, setRegError] = React.useState('');
  const [showRegPassword, setShowRegPassword] = React.useState(false);

  // Effect to clear forms when switching between login/register
  React.useEffect(() => {
    setIsLoading(false);
    setLoginUsername('');
    setLoginPassword('');
    setLoginError('');
    setShowLoginPassword(false);
    setRegName('');
    setRegUsername('');
    setRegPassword('');
    setRegError('');
    setRegRole(UserRole.BANK);
    setShowRegPassword(false);
  }, [authView]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    setTimeout(() => {
      const user = users.find(u => u.username === loginUsername && u.password === loginPassword);
      if (user) {
        onLogin(user);
      } else {
        setLoginError('اسم المستخدم أو كلمة المرور غير صحيحة.');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regUsername || !regPassword) {
      setRegError('يرجى ملء جميع الحقول.');
      return;
    }
    setIsLoading(true);
    setRegError('');

    const success = await onRegister({ name: regName, username: regUsername, password: regPassword, role: regRole });
    if (!success) {
      setRegError('اسم المستخدم مستخدم بالفعل.');
      setIsLoading(false);
    }
    // On success, the parent component switches the view, unmounting this component or causing an effect cleanup.
  };

  const renderLogin = () => (
     <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6 animate-fade-in">
        <div className="text-center">
            <h1 className="text-3xl font-semibold text-slate-800">تسجيل الدخول</h1>
            <p className="text-slate-500 mt-2 text-sm">مرحباً بك في نظام صيانة ماكينات الصراف الآلي</p>
        </div>
        <form onSubmit={handleLoginSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-600 mb-2">اسم المستخدم</label>
            <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                    id="username" 
                    type="text" 
                    value={loginUsername} 
                    onChange={(e) => setLoginUsername(e.target.value)} 
                    className="w-full pr-10 pl-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-500)]/50 focus:border-[var(--primary-500)] transition-colors" 
                    placeholder="اسم المستخدم" 
                    required 
                />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-600 mb-2">كلمة المرور</label>
            <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                    id="password" 
                    type={showLoginPassword ? "text" : "password"} 
                    value={loginPassword} 
                    onChange={(e) => setLoginPassword(e.target.value)} 
                    className="w-full pr-10 pl-10 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-500)]/50 focus:border-[var(--primary-500)] transition-colors" 
                    placeholder="••••••••" 
                    required 
                />
                <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    tabIndex={-1}
                >
                    {showLoginPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
            </div>
          </div>
          {loginError && <p className="text-red-500 text-sm text-center pt-2">{loginError}</p>}
          <div className="pt-2">
            <button type="submit" disabled={isLoading} className="w-full bg-[var(--primary-600)] text-white font-semibold py-3 px-4 rounded-lg hover:bg-[var(--primary-700)] focus:outline-none focus:ring-4 focus:ring-[var(--primary-300)] transition-all duration-300 disabled:bg-[var(--primary-400)] disabled:cursor-not-allowed flex items-center justify-center">
              {isLoading ? (<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>) : 'تسجيل الدخول'}
            </button>
          </div>
        </form>
        <div className="text-center text-sm text-slate-600">
            ليس لديك حساب؟{' '}
            <button onClick={onSwitchToRegister} className="font-semibold text-[var(--primary-600)] hover:underline focus:outline-none">إنشاء حساب جديد</button>
        </div>

        {/* Demo Credentials Hint */}
        <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-center text-slate-500 mb-3 font-medium">تسجيل دخول سريع (نسخة تجريبية)</p>
            <div className="grid grid-cols-2 gap-3">
                {users.filter(u => ['admin', 'bank'].includes(u.username)).map(u => (
                    <button 
                        key={u.id} 
                        type="button"
                        onClick={() => { setLoginUsername(u.username); setLoginPassword('password'); }}
                        className="flex flex-col items-center justify-center p-3 border border-slate-200 rounded-xl hover:border-[var(--primary-500)] hover:bg-[var(--primary-50)] hover:text-[var(--primary-700)] transition-all duration-200 group"
                    >
                        <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-white flex items-center justify-center mb-2 transition-colors">
                             {u.role === UserRole.ADMIN ? (
                                 <div className="text-xl">🛡️</div>
                             ) : (
                                 <div className="text-xl">🏦</div>
                             )}
                        </div>
                        <span className="text-sm font-bold text-slate-700 group-hover:text-[var(--primary-700)]">{u.name}</span>
                        <span className="text-[10px] text-slate-400 mt-1">{u.username}</span>
                    </button>
                ))}
            </div>
        </div>
      </div>
  );

  const renderRegister = () => (
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6 animate-fade-in">
        <div className="text-center">
            <h1 className="text-3xl font-semibold text-slate-800">إنشاء حساب جديد</h1>
            <p className="text-slate-500 mt-2 text-sm">انضم إلى نظام متابعة تقارير الصيانة</p>
        </div>
        <form onSubmit={handleRegisterSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">نوع الحساب</label>
            <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setRegRole(UserRole.BANK)} className={`w-full text-center px-4 py-2.5 border rounded-lg transition-all duration-200 ${regRole === UserRole.BANK ? 'bg-[var(--primary-600)] text-white border-[var(--primary-600)] font-semibold shadow-sm' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}>مسئول البنك</button>
                <button type="button" onClick={() => setRegRole(UserRole.ADMIN)} className={`w-full text-center px-4 py-2.5 border rounded-lg transition-all duration-200 ${regRole === UserRole.ADMIN ? 'bg-[var(--primary-600)] text-white border-[var(--primary-600)] font-semibold shadow-sm' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}>حساب شركة</button>
            </div>
          </div>
          <div>
            <label htmlFor="reg-name" className="block text-sm font-medium text-slate-600 mb-2">الاسم الكامل</label>
            <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input id="reg-name" type="text" value={regName} onChange={(e) => setRegName(e.target.value)} className="w-full pr-10 pl-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-500)]/50 focus:border-[var(--primary-500)] transition-colors" placeholder="مثال: أحمد محمد" required />
            </div>
          </div>
          <div>
            <label htmlFor="reg-username" className="block text-sm font-medium text-slate-600 mb-2">اسم المستخدم</label>
            <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input id="reg-username" type="text" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} className="w-full pr-10 pl-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-500)]/50 focus:border-[var(--primary-500)] transition-colors" placeholder="اختر اسم مستخدم" required />
            </div>
          </div>
          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-slate-600 mb-2">كلمة المرور</label>
             <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                    id="reg-password" 
                    type={showRegPassword ? "text" : "password"} 
                    value={regPassword} 
                    onChange={(e) => setRegPassword(e.target.value)} 
                    className="w-full pr-10 pl-10 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-500)]/50 focus:border-[var(--primary-500)] transition-colors" 
                    placeholder="••••••••" 
                    required 
                />
                 <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    tabIndex={-1}
                >
                    {showRegPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
            </div>
          </div>
          {regError && <p className="text-red-500 text-sm text-center pt-2">{regError}</p>}
          <div className="pt-2">
            <button type="submit" disabled={isLoading} className="w-full bg-[var(--primary-600)] text-white font-semibold py-3 px-4 rounded-lg hover:bg-[var(--primary-700)] focus:outline-none focus:ring-4 focus:ring-[var(--primary-300)] transition-all duration-300 disabled:bg-[var(--primary-400)] disabled:cursor-not-allowed flex items-center justify-center">
              {isLoading ? (<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>) : 'إنشاء الحساب'}
            </button>
          </div>
        </form>
         <div className="text-center text-sm text-slate-600">
            لديك حساب بالفعل؟{' '}
            <button onClick={onSwitchToLogin} className="font-semibold text-[var(--primary-600)] hover:underline focus:outline-none">تسجيل الدخول</button>
        </div>
      </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50">
      {authView === 'login' ? renderLogin() : renderRegister()}
    </div>
  );
};

export default AuthScreen;