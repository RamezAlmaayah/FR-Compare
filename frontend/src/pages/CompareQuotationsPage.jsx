import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import apiClient from '../api/apiClient';
import ComparisonTable from '../components/ComparisonTable';
import ComparisonSummary from '../components/ComparisonSummary';
import WeightControls, { weightError } from '../components/WeightControls';
import WeightedResults from '../components/WeightedResults';
import WinnerSelection from '../components/WinnerSelection';
import getApiErrorMessage from '../utils/getApiErrorMessage';
import StatusBadge from '../components/StatusBadge';

const CompareQuotationsPage = () => {
  const { id } = useParams();
  const [weights, setWeights] = useState({ priceWeight: 60, deliveryWeight: 25, ratingWeight: 15 });
  const [appliedWeights, setAppliedWeights] = useState(weights);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const loadComparison = async () => {
      try {
        const response = await apiClient.get(`/rfqs/${id}/comparison`, { params: appliedWeights });
        if (active) setComparison(response.data.comparison);
      } catch (requestError) { if (active) setError(getApiErrorMessage(requestError, 'Unable to compare quotations.')); }
      finally { if (active) setLoading(false); }
    };
    loadComparison();
    return () => { active = false; };
  }, [id, appliedWeights, reload]);
  const weightsCurrent = !weightError(weights) && Object.keys(weights).every((field) => Number(weights[field]) === Number(appliedWeights[field]));
  return (
    <main className="container py-4">
      <h1>Quotation Comparison</h1><Link to={`/rfqs/${id}`}>Back to RFQ</Link>
      {loading ? <p>Loading comparison...</p> : error ? <p role="alert">{error}</p> : comparison && <>
        <p>{comparison.rfq.referenceNumber} — {comparison.rfq.title}</p><p>{comparison.quotationCount} quotations — RFQ <StatusBadge status={comparison.rfq.status} /></p>
        {!comparison.available ? <p role="status">{comparison.message}</p> : <>
          <ComparisonTable comparison={comparison} /><ComparisonSummary comparison={comparison} />
          <WeightControls weights={weights} loading={loading} onChange={(field, value) => setWeights((current) => ({ ...current, [field]: value }))}
            onSubmit={() => { if (!weightError(weights)) setAppliedWeights({ ...weights }); }} />
          {weightsCurrent ? <WeightedResults weighted={comparison.weighted} /> : <p>Apply valid weights to show Best Value.</p>}
          <WinnerSelection rfq={comparison.rfq} quotations={comparison.quotations} onSelected={() => setReload((value) => value + 1)} />
        </>}
      </>}
    </main>
  );
};

export default CompareQuotationsPage;
