const StatusBadge = ({ status }) => {
  const tone = ['Completed', 'Selected'].includes(status) ? 'positive'
    : ['Cancelled', 'Rejected'].includes(status) ? 'danger'
      : ['Open', 'Under Comparison'].includes(status) ? 'open' : 'neutral';
  return <span className={`status-badge status-${tone}`}>{status}</span>;
};

export default StatusBadge;
