import React from 'react';

const SkeletonReportCard: React.FC = () => {
  return (
    <div className="bg-white rounded-sm shadow-md border border-slate-200 overflow-hidden flex flex-col animate-pulse">
      <div className="p-2 text-center flex-grow">
        <div className="space-y-1 mb-2">
          <div className="h-4 bg-slate-200 rounded-sm w-3/4 mx-auto"></div>
          <div className="h-4 bg-slate-200 rounded-sm w-1/2 mx-auto"></div>
        </div>
        <div className="h-3 bg-slate-200 rounded w-5/6 mx-auto mt-2"></div>
        <div className="h-3 bg-slate-200 rounded w-1/3 mx-auto mt-1"></div>
      </div>
      <div className="p-1 bg-slate-200">
        <div className="w-full h-32 bg-slate-300"></div>
      </div>
    </div>
  );
};

export default SkeletonReportCard;
