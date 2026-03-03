export default function AdminDashboardPage() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 min-h-[500px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome to Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Select an option from the sidebar to manage the platform.</p>
      </div>
      
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Readings', value: '24', color: 'bg-blue-50 text-blue-700' },
          { label: 'Active Users', value: '143', color: 'bg-green-50 text-green-700' },
          { label: 'Pending Reviews', value: '5', color: 'bg-amber-50 text-amber-700' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.color} rounded-xl p-6`}>
            <p className="text-sm font-medium opacity-80">{stat.label}</p>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
