const weightError = (weights) => {
  const values = Object.values(weights);
  if (values.some((value) => String(value).trim() === '' || !Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 100)) return 'Each weight must be between 0 and 100.';
  return values.reduce((sum, value) => sum + Number(value), 0) === 100 ? '' : 'Weights must total exactly 100.';
};

const WeightControls = ({ weights, onChange, onSubmit, loading }) => (
  <form className="weight-controls" onSubmit={(event) => { event.preventDefault(); onSubmit(); }} noValidate>
    <h2 className="h4">Weighted Score Controls</h2>
    <div className="row">
      {[['priceWeight', 'Price Weight'], ['deliveryWeight', 'Delivery Weight'], ['ratingWeight', 'Rating Weight']].map(([field, label]) => (
        <div key={field} className="col-md-4 mb-3"><label htmlFor={field}>{label}</label>
          <input id={field} type="number" min="0" max="100" step="any" className="form-control" value={weights[field]} onChange={(event) => onChange(field, event.target.value)} />
        </div>
      ))}
    </div>
    <p>Total Weight: {Object.values(weights).reduce((sum, value) => sum + (Number(value) || 0), 0)}%</p>
    {weightError(weights) && <p role="alert">{weightError(weights)}</p>}
    <button type="submit" className="btn btn-outline-primary mb-3" disabled={loading || Boolean(weightError(weights))}>Calculate Best Value</button>
  </form>
);

export { weightError };
export default WeightControls;
