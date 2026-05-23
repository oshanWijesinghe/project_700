// Spinner
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`${sizes[size]} border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin ${className}`} />
  );
};

// LoadingPage
export const LoadingPage = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center">
      <Spinner size="lg" className="mx-auto mb-4" />
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  </div>
);

// EmptyState
export const EmptyState = ({ icon, title, description, action }) => (
  <div className="text-center py-16 px-4">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="font-display font-bold text-gray-800 text-xl mb-2">{title}</h3>
    <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">{description}</p>
    {action}
  </div>
);

// Alert
export const Alert = ({ type = 'error', message }) => {
  if (!message) return null;
  const styles = {
    error: 'bg-red-50 text-red-700 border-red-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    info: 'bg-brand-50 text-brand-700 border-brand-200',
  };
  return (
    <div className={`px-4 py-3 rounded-xl border text-sm font-medium ${styles[type]}`}>
      {message}
    </div>
  );
};

// PageHeader
export const PageHeader = ({ title, subtitle, children }) => (
  <div className="mb-8">
    <h1 className="text-3xl font-display font-bold text-gray-900">{title}</h1>
    {subtitle && <p className="mt-2 text-gray-500">{subtitle}</p>}
    {children}
  </div>
);