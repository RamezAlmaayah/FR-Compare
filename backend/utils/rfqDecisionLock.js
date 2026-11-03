const pendingDecisions = new Map();

// The course app runs one Express process; serialize multi-record decisions per RFQ.
const withRFQDecisionLock = async (rfqId, action) => {
  const key = String(rfqId);
  const previous = pendingDecisions.get(key) || Promise.resolve();
  let release;
  const current = new Promise((resolve) => { release = resolve; });
  const queued = previous.then(() => current);
  pendingDecisions.set(key, queued);
  await previous;
  try { return await action(); }
  finally {
    release();
    if (pendingDecisions.get(key) === queued) pendingDecisions.delete(key);
  }
};

export default withRFQDecisionLock;
