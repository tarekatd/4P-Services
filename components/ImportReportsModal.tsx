



import React from 'react';
import { Report, ReportCategory } from '../types';
import { UploadIcon, DownloadIcon } from './icons';

interface ImportReportsModalProps {
  closeModal: () => void;
  onImport: (newReports: Omit<Report, 'id'>[]) => void;
}

type ImportStatus = 'idle' | 'processing' | 'done';
type ImportResult = {
  successCount: number;
  errors: string[];
};

const ImportReportsModal: React.FC<ImportReportsModalProps> = ({ closeModal, onImport }) => {
  const [file, setFile] = React.useState<File | null>(null);
  const [status, setStatus] = React.useState<ImportStatus>('idle');
  const [result, setResult] = React.useState<ImportResult | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setResult(null);
    }
  };

  const handleDownloadTemplate = () => {
    const XLSX = (window as any).XLSX;
    const headers = [
        'atm_name', 'atm_number', 'serial_number', 'governorate', 'address', 
        'maintenance_date', 'category', 'technical_report', 'notes'
    ];
    const instructions = [
        'اسم الماكينة (مطلوب)', 'رقم الماكينة (مطلوب)', 'الرقم المسلسل (مطلوب)', 
        'المحافظة (مطلوب)', 'العنوان (مطلوب)', 'YYYY-MM-DD (مطلوب)', 
        `"${ReportCategory.CORRECTIVE}" أو "${ReportCategory.MODERN}" (افصل بفاصلة للتعدد)`, 
        'التقرير الفني (مطلوب)', 'ملاحظات (اختياري)'
    ];

    const data = [headers, instructions];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "import-template.xlsx");
  };

  const processFile = () => {
    if (!file) return;

    setStatus('processing');
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const XLSX = (window as any).XLSX;
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        
        const validReports: Omit<Report, 'id'>[] = [];
        const errors: string[] = [];

        json.forEach((row: any, index: number) => {
          const rowIndex = index + 2; // Excel rows are 1-based, plus header
          
          if (!row.atm_name || !row.atm_number || !row.serial_number || !row.governorate || !row.address || !row.maintenance_date || !row.category || !row.technical_report) {
            errors.push(`صف ${rowIndex}: يحتوي على حقول مطلوبة فارغة.`);
            return;
          }

          const categories = String(row.category).split(',')
              .map(c => c.trim())
              .filter(c => c);

          if (categories.length === 0) {
              errors.push(`صف ${rowIndex}: حقل التصنيف مطلوب ولا يمكن أن يكون فارغًا.`);
              return;
          }
          const validCategoriesEnum = Object.values(ReportCategory) as string[];
          const invalidCategories = categories.filter(c => !validCategoriesEnum.includes(c));

          if (invalidCategories.length > 0) {
              errors.push(`صف ${rowIndex}: قيم التصنيف '${invalidCategories.join(', ')}' غير صالحة.`);
              return;
          }

          const maintenanceDate = new Date(row.maintenance_date);
          if (isNaN(maintenanceDate.getTime())) {
              errors.push(`صف ${rowIndex}: صيغة التاريخ '${String(row.maintenance_date)}' غير صالحة. استخدم YYYY-MM-DD.`);
              return;
          }

          validReports.push({
            atm_name: String(row.atm_name),
            atm_number: String(row.atm_number),
            serial_number: String(row.serial_number),
            governorate: String(row.governorate),
            address: String(row.address),
            maintenance_date: maintenanceDate.toISOString(),
            category: categories as ReportCategory[],
            technical_report: String(row.technical_report),
            notes: row.notes ? String(row.notes) : '',
            before_photos: [], // Photos cannot be imported
            after_photos: [],
          });
        });

        onImport(validReports);
        setResult({ successCount: validReports.length, errors });
        setStatus('done');
      } catch (error) {
        console.error("Error processing file:", error);
        setResult({ successCount: 0, errors: ['حدث خطأ غير متوقع أثناء معالجة الملف. تأكد من أنه ملف Excel صالح.'] });
        setStatus('done');
      }
    };
    reader.onerror = () => {
        setResult({ successCount: 0, errors: ['لا يمكن قراءة الملف.'] });
        setStatus('done');
    }
    reader.readAsBinaryString(file);
  };
  
  const resetState = () => {
    setFile(null);
    setStatus('idle');
    setResult(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4 z-50" onClick={closeModal}>
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="p-8">
                <h2 className="text-2xl font-semibold text-slate-800 mb-2">استيراد تقارير من Excel</h2>
                <p className="text-slate-500 text-sm mb-4">
                    قم بتحميل ملف Excel لإضافة تقارير متعددة دفعة واحدة.
                </p>

                <button 
                  onClick={handleDownloadTemplate}
                  className="w-full mb-6 flex items-center justify-center gap-2 text-sm font-medium text-[var(--primary-600)] bg-[var(--primary-50)] hover:bg-[var(--primary-100)] py-2.5 px-4 rounded-md transition-colors"
                >
                  <DownloadIcon className="w-5 h-5"/>
                  <span>تنزيل القالب</span>
                </button>

                {status !== 'done' ? (
                  <>
                    <label 
                      htmlFor="excel-upload"
                      className="cursor-pointer flex flex-col items-center justify-center w-full h-32 px-3 py-2 border-2 border-dashed border-slate-300 rounded-md hover:border-[var(--primary-500)] bg-slate-50"
                    >
                      <UploadIcon className="w-8 h-8 text-slate-400 mb-2"/>
                      <span className="text-sm text-slate-600 font-medium">
                        {file ? file.name : "اختر ملفًا أو قم بإفلاته هنا"}
                      </span>
                      <span className="text-xs text-slate-400 mt-1">
                        (ملفات .xlsx فقط)
                      </span>
                      <input 
                        ref={fileInputRef}
                        id="excel-upload" 
                        type="file" 
                        accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
                        className="hidden" 
                        onChange={handleFileSelect} 
                      />
                    </label>
                    <div className="mt-8 flex justify-end gap-3">
                        <button type="button" onClick={closeModal} className="px-5 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors">
                            إلغاء
                        </button>
                        <button type="button" onClick={processFile} disabled={!file || status === 'processing'} className="px-5 py-2 text-sm font-medium text-white bg-[var(--primary-600)] rounded-md hover:bg-[var(--primary-700)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-500)] disabled:bg-[var(--primary-400)] flex items-center transition-colors">
                            {status === 'processing' && <svg className="animate-spin -ms-1 me-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                            {status === 'processing' ? 'جاري المعالجة...' : 'استيراد'}
                        </button>
                    </div>
                  </>
                ) : (
                  <div>
                      <h3 className="font-semibold text-slate-800 mb-3">نتائج الاستيراد</h3>
                      <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-3">
                          <p className="font-medium text-green-600">
                              ✓ تم استيراد {result?.successCount} تقرير بنجاح.
                          </p>
                          {result && result.errors.length > 0 && (
                            <div>
                              <p className="font-medium text-red-600">
                                ✗ تم العثور على {result.errors.length} أخطاء:
                              </p>
                              <ul className="list-disc list-inside text-sm text-red-500 mt-2 max-h-32 overflow-y-auto pr-4">
                                {result.errors.map((err, i) => <li key={i}>{err}</li>)}
                              </ul>
                            </div>
                          )}
                      </div>
                      <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={resetState} className="px-5 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">
                            استيراد ملف آخر
                        </button>
                        <button type="button" onClick={closeModal} className="px-5 py-2 text-sm font-medium text-white bg-[var(--primary-600)] rounded-md hover:bg-[var(--primary-700)]">
                            إغلاق
                        </button>
                      </div>
                  </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default ImportReportsModal;