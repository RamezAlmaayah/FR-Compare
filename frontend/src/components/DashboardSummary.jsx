const summaryFields = [
  ['totalSuppliers', 'Total Suppliers'], ['totalRFQs', 'Total RFQs'], ['openRFQs', 'Open RFQs'],
  ['completedRFQs', 'Completed RFQs'], ['totalQuotations', 'Total Quotations'],
  ['selectedQuotations', 'Selected Quotations'], ['estimatedSavings', 'Estimated Savings'],
];

const DashboardSummary = ({ summary }) => (
  <section aria-label="Dashboard summary" className="dashboard-metrics">
    {summaryFields.map(([field, label]) => (
      <div key={field} className={`metric-card${field === 'estimatedSavings' ? ' savings-metric' : ''}`}>
        <dl className="mb-0">
          <dt>{label}</dt><dd className="mb-0">{summary[field]}{field === 'estimatedSavings' ? <small> JD</small> : ''}</dd>
        </dl>
      </div>
    ))}
  </section>
);

export default DashboardSummary;
