export const outstandingBalance = billing => billing?.paymentStatus === 'refunded'
  ? 0
  : Math.max(0, Number(billing?.grandTotal || 0) - Number(billing?.paidAmount || 0));
