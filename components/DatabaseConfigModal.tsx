


import React from 'react';
import { FirebaseConfig } from '../types';
import { db } from '../services/database';
import { CheckIcon, XCircleIcon, UploadIcon } from './icons';

interface DatabaseConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Icon for the cloud/database
const CloudIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
    </svg>
);

const SignalIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.008H12V12z" />
  </svg>
);

const DatabaseConfigModal: React.FC<DatabaseConfigModalProps> = ({ isOpen, onClose }) => {
    const [config, setConfig] = React.useState<FirebaseConfig>({
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: ''
    });
    const [jsonInput, setJsonInput] = React.useState('');
    const [isConnected, setIsConnected] = React.useState(db.isFirebaseConnected());
    const [mode, setMode] = React.useState<'json' | 'fields'>('json');
    const [isSyncing, setIsSyncing] = React.useState(false);
    const [isTesting, setIsTesting] = React.useState(false);

    React.useEffect(() => {
        setIsConnected(db.isFirebaseConnected());
        // We do not load the existing config back into the form for security/cleanliness, 
        // but we show the connection status.
    }, [isOpen]);

    const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setJsonInput(e.target.value);
        try {
            const parsed = JSON.parse(e.target.value);
            setConfig(prev => ({ ...prev, ...parsed }));
        } catch (e) {
            // Ignore parse errors while typing
        }
    };

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfig(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        let finalConfig = config;
        if (mode === 'json') {
            try {
                // Try to find the inner config object if user pasted the whole code snippet
                const text = jsonInput;
                // Simple heuristic to extract JSON from JS snippet if pasted
                const jsonStart = text.indexOf('{');
                const jsonEnd = text.lastIndexOf('}');
                if (jsonStart !== -1 && jsonEnd !== -1) {
                     const jsonStr = text.substring(jsonStart, jsonEnd + 1);
                     // Need to quote keys if they are not quoted (JS object vs JSON)
                     // This is tricky, so we rely on user pasting valid JSON or manual fields.
                     // For now, assume valid JSON or use fields.
                     try {
                        finalConfig = JSON.parse(jsonStr);
                     } catch(e) {
                         // Fallback to what was parsed incrementally or manual
                         if(!finalConfig.apiKey) {
                             alert("الرجاء التأكد من صحة تنسيق JSON");
                             return;
                         }
                     }
                }
            } catch (e) {
                // console.error(e);
            }
        }

        if (!finalConfig.apiKey || !finalConfig.projectId) {
            alert("يرجى ملء البيانات المطلوبة (API Key و Project ID على الأقل).");
            return;
        }

        await db.saveConfig(finalConfig);
        onClose();
    };

    const handleDisconnect = () => {
        if (confirm("هل أنت متأكد من رغبتك في قطع الاتصال؟ سيعود التطبيق لاستخدام التخزين المحلي.")) {
            db.clearConfig();
            onClose();
        }
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        try {
            await db.testConnection();
            alert("✅ الاتصال ناجح! \nتم الاتصال بقاعدة البيانات وقراءة البيانات بنجاح.");
        } catch (error: any) {
            console.error(error);
            alert("❌ فشل الاتصال! \nيرجى التأكد من إعدادات المشروع وصلاحيات Firestore.\n\nتفاصيل الخطأ: " + (error.message || error));
        } finally {
            setIsTesting(false);
        }
    };

    const handleSync = async () => {
        if (!confirm("هل تريد بالتأكيد رفع جميع البيانات المحلية (التقارير والمستخدمين) إلى قاعدة البيانات السحابية؟\n\nسيتم دمج البيانات، مما قد يؤدي إلى تحديث السجلات الموجودة مسبقاً بنفس المعرف.")) {
            return;
        }
        
        setIsSyncing(true);
        try {
            const result = await db.syncLocalDataToFirebase();
            alert(`تمت المزامنة بنجاح!\n\nتم رفع:\n- ${result.reports} تقرير\n- ${result.users} مستخدم`);
        } catch (error: any) {
            console.error("Sync error:", error);
            alert(`فشل في المزامنة: ${error.message || "حدث خطأ غير معروف"}`);
        } finally {
            setIsSyncing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4 z-[70]">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
                <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isConnected ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
                            <CloudIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">إعدادات المزامنة السحابية</h2>
                            <p className="text-sm text-slate-500">
                                {isConnected ? 'متصل بقاعدة البيانات (Firebase)' : 'يتم استخدام التخزين المحلي حالياً'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><XCircleIcon className="w-8 h-8"/></button>
                </div>
                
                <div className="p-6 space-y-4">
                    {!isConnected && (
                        <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-lg mb-4">
                            لتمكين المزامنة عبر الأجهزة، قم بإنشاء مشروع مجاني على <a href="https://console.firebase.google.com" target="_blank" className="underline font-bold">Firebase Console</a>، أنشئ قاعدة بيانات Firestore، وانسخ إعدادات المشروع (Project Settings) هنا.
                        </div>
                    )}

                    {isConnected && (
                        <div className="bg-green-50 border border-green-200 text-green-800 text-sm p-4 rounded-lg mb-4">
                            <div className="flex justify-between items-center mb-3">
                                <span className="font-bold flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    حالة الاتصال: متصل
                                </span>
                                <button
                                    onClick={handleTestConnection}
                                    disabled={isTesting}
                                    className="text-xs bg-white border border-green-300 text-green-700 px-3 py-1.5 rounded hover:bg-green-100 transition-colors flex items-center gap-1.5 shadow-sm"
                                >
                                    {isTesting ? (
                                        <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    ) : <SignalIcon className="w-3 h-3" />}
                                    {isTesting ? 'جاري الفحص...' : 'اختبار الاتصال'}
                                </button>
                            </div>
                            
                            <hr className="border-green-200 my-3" />

                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold">مزامنة البيانات</span>
                            </div>
                            <p className="mb-3 text-green-700">يمكنك رفع البيانات المخزنة محلياً (التقارير والمستخدمين) إلى قاعدة البيانات السحابية لدمجها.</p>
                            <button 
                                onClick={handleSync}
                                disabled={isSyncing}
                                className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors disabled:bg-green-400 shadow-sm"
                            >
                                {isSyncing ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : (
                                    <UploadIcon className="w-5 h-5" />
                                )}
                                <span>{isSyncing ? 'جاري المزامنة...' : 'رفع البيانات المحلية الآن'}</span>
                            </button>
                        </div>
                    )}

                    <div className="flex gap-4 border-b border-slate-200 mb-4">
                        <button 
                            className={`pb-2 px-4 text-sm font-medium transition-colors ${mode === 'json' ? 'text-[var(--primary-600)] border-b-2 border-[var(--primary-600)]' : 'text-slate-500'}`}
                            onClick={() => setMode('json')}
                        >
                            لصق JSON
                        </button>
                        <button 
                            className={`pb-2 px-4 text-sm font-medium transition-colors ${mode === 'fields' ? 'text-[var(--primary-600)] border-b-2 border-[var(--primary-600)]' : 'text-slate-500'}`}
                            onClick={() => setMode('fields')}
                        >
                            إدخال يدوي
                        </button>
                    </div>

                    {mode === 'json' ? (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">لصق كائن التكوين (firebaseConfig)</label>
                            <textarea 
                                value={jsonInput}
                                onChange={handleJsonChange}
                                className="w-full h-40 p-3 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent"
                                placeholder={'{ "apiKey": "...", "authDomain": "...", ... }'}
                                dir="ltr"
                            ></textarea>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            <input name="apiKey" value={config.apiKey} onChange={handleFieldChange} placeholder="apiKey" className="px-3 py-2 border rounded-md" dir="ltr" />
                            <input name="authDomain" value={config.authDomain} onChange={handleFieldChange} placeholder="authDomain" className="px-3 py-2 border rounded-md" dir="ltr" />
                            <input name="projectId" value={config.projectId} onChange={handleFieldChange} placeholder="projectId" className="px-3 py-2 border rounded-md" dir="ltr" />
                            <input name="storageBucket" value={config.storageBucket} onChange={handleFieldChange} placeholder="storageBucket" className="px-3 py-2 border rounded-md" dir="ltr" />
                            <input name="messagingSenderId" value={config.messagingSenderId} onChange={handleFieldChange} placeholder="messagingSenderId" className="px-3 py-2 border rounded-md" dir="ltr" />
                            <input name="appId" value={config.appId} onChange={handleFieldChange} placeholder="appId" className="px-3 py-2 border rounded-md" dir="ltr" />
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4">
                        {isConnected ? (
                            <button 
                                onClick={handleDisconnect}
                                className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                                قطع الاتصال والعودة للمحلي
                            </button>
                        ) : <span></span>}
                        
                        <div className="flex gap-3">
                            <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">إلغاء</button>
                            <button 
                                onClick={handleSave}
                                className="px-6 py-2 bg-[var(--primary-600)] text-white rounded-lg hover:bg-[var(--primary-700)] shadow-md flex items-center gap-2"
                            >
                                <CheckIcon className="w-5 h-5"/>
                                <span>حفظ واتصال</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DatabaseConfigModal;
