import formatDate from '../utils/formatDate';

const SupplierRatingHistory = ({ supplier }) => (
  <section aria-label="Supplier ratings and wins" className="supplier-rating-history mt-4">
    <h2 className="h4">Ratings and RFQ Wins</h2>
    <p>Average Rating: {supplier.averageRating == null ? 'Unrated' : `${supplier.averageRating.toFixed(2)}/5`}</p>
    <p>Rating Count: {supplier.ratingCount ?? 0}</p><p>RFQ Wins: {supplier.rfqWins ?? 0}</p>
    {supplier.ratings?.length ? <ul>{supplier.ratings.map((entry) => <li key={entry.rfqId}>
      {entry.rating}/5 — {entry.note || 'No note.'} — {formatDate(entry.createdAt)}
    </li>)}</ul> : <p>No supplier ratings yet.</p>}
  </section>
);

export default SupplierRatingHistory;
