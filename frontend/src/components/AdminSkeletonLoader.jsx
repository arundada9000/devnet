const AdminSkeletonLoader = () => (
  <div className="p-8 w-full min-h-screen bg-slate-50 flex flex-col gap-8 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="h-10 bg-slate-200 rounded-xl w-64" />
      <div className="h-10 bg-slate-200 rounded-xl w-40" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-36 bg-white border border-slate-100 rounded-2xl shadow-sm p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-slate-200 rounded-xl" />
            <div className="w-12 h-6 bg-slate-200 rounded-md" />
          </div>
          <div className="w-24 h-8 bg-slate-200 rounded-lg" />
        </div>
      ))}
    </div>
    <div className="flex-1 bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
      <div className="w-48 h-6 bg-slate-200 rounded-lg mb-6" />
      <div className="space-y-4">
        <div className="h-12 bg-slate-100 rounded-xl w-full" />
        <div className="h-12 bg-slate-100 rounded-xl w-full" />
        <div className="h-12 bg-slate-100 rounded-xl w-full" />
        <div className="h-12 bg-slate-100 rounded-xl w-full" />
      </div>
    </div>
  </div>
);

export default AdminSkeletonLoader;