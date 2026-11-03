const displayScore = (value) => value == null ? 'Not provided' : value.toFixed(4);

const WeightedResults = ({ weighted }) => {
  if (!weighted.available) return <p role="alert">{weighted.error}</p>;
  return (
    <section className="weighted-results" aria-label="Best Value results">
      <h2 className="h4">Best Value</h2>
      <p className="best-value-result">{weighted.bestValue.map((score) => `${score.supplierName} — ${score.weightedScore.toFixed(2)} / 100`).join(', ')}</p>
      <p>Decision support only. Best Value and Cheapest are separate; neither is automatically selected.</p>
      <div className="table-responsive" tabIndex="0" aria-label="Scrollable weighted scores"><table className="table table-bordered">
        <thead><tr>{['Supplier', 'Price Score', 'Delivery Score', 'Rating Score', 'Weighted Score'].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead>
        <tbody>{weighted.scores.map((score) => <tr key={score.quotationId}>
          <th scope="row">{score.supplierName}{score.isUnrated && <p className="fw-normal">Unrated — neutral 3/5 used for Best Value calculation.</p>}</th>
          <td>{displayScore(score.priceScore)}</td><td>{displayScore(score.deliveryScore)}</td><td>{displayScore(score.ratingScore)}</td><td>{displayScore(score.weightedScore)}</td>
        </tr>)}</tbody>
      </table></div>
    </section>
  );
};

export default WeightedResults;
