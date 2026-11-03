import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import getApiErrorMessage from '../utils/getApiErrorMessage';
import DashboardSummary from '../components/DashboardSummary';
import DashboardRecentRecords from '../components/DashboardRecentRecords';

const DashboardPage = () => {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      try {
        const response = await apiClient.get('/dashboard');
        if (active) setState({ data: response.data, loading: false, error: '' });
      } catch (error) {
        if (active) setState({ data: null, loading: false, error: getApiErrorMessage(error, 'Unable to load dashboard. Please try again later.') });
      }
    };
    loadDashboard();
    return () => { active = false; };
  }, []);

  return (
    <main className="container py-5 dashboard-page">
      <section>
        <header className="dashboard-hero">
          <img className="mountain-artwork" src="/mountain-hero.png" alt="" aria-hidden="true" />
          <div className="dashboard-greeting"><p className="eyebrow">Dashboard</p>
            <h1>{greeting}, {user.name}.</h1><p>Here’s an overview of your procurement activities.</p>
          </div>
        </header>
        <div className="d-flex flex-wrap gap-2 dashboard-actions">
          <Link className="btn btn-primary" to="/suppliers">
            Suppliers
          </Link>
          <Link className="btn btn-outline-primary" to="/items">Item Catalog</Link>
          <Link className="btn btn-outline-primary" to="/rfqs">RFQs</Link>
        </div>
        {state.loading ? <p role="status" className="mt-3">Loading dashboard...</p>
          : state.error ? <p role="alert" className="alert alert-danger mt-3">{state.error}</p>
            : state.data && <>
              <DashboardSummary summary={state.data.summary} />
              <DashboardRecentRecords recentRFQs={state.data.recentRFQs} recentQuotations={state.data.recentQuotations} />
            </>}
      </section>
    </main>
  );
};

export default DashboardPage;
