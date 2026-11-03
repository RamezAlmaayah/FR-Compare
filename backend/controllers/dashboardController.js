import Supplier from '../models/Supplier.js';
import RFQ from '../models/RFQ.js';
import Quotation from '../models/Quotation.js';
import calculateDashboardSavings from '../utils/dashboardSavings.js';

const getDashboard = async (req, res) => {
  const ownership = { userId: req.userId };
  const [totalSuppliers, totalRFQs, openRFQs, completedRFQs, totalQuotations, selectedQuotations,
    recentRFQs, recentQuotations, completedRecords] = await Promise.all([
    Supplier.countDocuments(ownership),
    RFQ.countDocuments(ownership),
    RFQ.countDocuments({ ...ownership, status: { $in: ['Open', 'Under Comparison'] } }),
    RFQ.countDocuments({ ...ownership, status: 'Completed' }),
    Quotation.countDocuments(ownership),
    Quotation.countDocuments({ ...ownership, status: 'Selected' }),
    RFQ.find(ownership).select('referenceNumber title status requestDate createdAt').sort({ createdAt: -1, _id: -1 }).limit(5),
    Quotation.find(ownership).select('quotationReference quotationDate grandTotal status supplierId rfqId createdAt')
      .sort({ createdAt: -1, _id: -1 }).limit(5)
      .populate({ path: 'supplierId', select: 'name', match: ownership })
      .populate({ path: 'rfqId', select: 'referenceNumber title', match: ownership }),
    RFQ.find({ ...ownership, status: 'Completed' }).select('selectedQuotationId'),
  ]);
  const completedOffers = completedRecords.length
    ? await Quotation.find({ ...ownership, rfqId: { $in: completedRecords.map((rfq) => rfq._id) } })
      .select('rfqId grandTotal status supplierId').populate({ path: 'supplierId', select: '_id', match: ownership })
    : [];

  res.json({
    summary: { totalSuppliers, totalRFQs, openRFQs, completedRFQs, totalQuotations, selectedQuotations,
      estimatedSavings: calculateDashboardSavings(completedRecords, completedOffers) },
    recentRFQs,
    recentQuotations,
  });
};

export { getDashboard };
