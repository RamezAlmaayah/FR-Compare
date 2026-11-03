const ConnectionStatus = ({ status, message }) => {
  const statusClass = status === 'connected' ? 'alert-success' : 'alert-danger';

  if (status === 'checking') {
    return <p className="alert alert-secondary mb-0">API Status: Checking...</p>;
  }

  return (
    <div className={`alert ${statusClass} mb-0`} role="status">
      <p className="fw-semibold mb-1">
        API Status: {status === 'connected' ? 'Connected' : 'Disconnected'}
      </p>
      <p className="mb-0">{message}</p>
    </div>
  );
};

export default ConnectionStatus;
