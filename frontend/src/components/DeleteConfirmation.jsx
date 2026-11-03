const DeleteConfirmation = ({ recordName, warning, deleting, onConfirm, onCancel }) => (
  <section className="border p-3 mb-3" role="alertdialog" aria-label="Delete confirmation">
    <p>Delete {recordName}? This action cannot be undone.</p>
    {warning && <p>{warning}</p>}
    <div className="d-flex gap-2">
      <button className="btn btn-outline-danger" type="button" disabled={deleting} onClick={onConfirm}>
        {deleting ? 'Deleting...' : 'Confirm Delete'}
      </button>
      <button className="btn btn-outline-secondary" type="button" disabled={deleting} onClick={onCancel}>
        Cancel Delete
      </button>
    </div>
  </section>
);

export default DeleteConfirmation;
