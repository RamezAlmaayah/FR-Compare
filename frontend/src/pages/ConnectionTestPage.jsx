import { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import ConnectionStatus from '../components/ConnectionStatus';

const initialApiState = {
  status: 'checking',
  message: '',
};

const ConnectionTestPage = () => {
  const [apiState, setApiState] = useState(initialApiState);

  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const response = await apiClient.get('/health');

        setApiState({
          status: 'connected',
          message: response.data.status === 'ok' ? 'The API is healthy.' : 'The API is unavailable.',
        });
      } catch {
        setApiState({
          status: 'disconnected',
          message: 'The backend API could not be reached.',
        });
      }
    };

    checkApiConnection();
  }, []);

  return (
    <main className="container py-5">
      <section className="mx-auto app-status-panel">
        <h1 className="mb-3">FR Compare</h1>
        <p className="lead">Frontend running successfully</p>
        <ConnectionStatus status={apiState.status} message={apiState.message} />
      </section>
    </main>
  );
};

export default ConnectionTestPage;
