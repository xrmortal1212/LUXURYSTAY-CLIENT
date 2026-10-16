import { describe, expect, it } from 'vitest';
import { outstandingBalance } from './BillingUtils';

describe('outstandingBalance', () => {
  it('calculates a partial balance from the invoice total and amount received', () => {
    expect(outstandingBalance({ grandTotal: 240, paidAmount: 75 })).toBe(165);
  });

  it('never reports a negative balance for a settled or overpaid bill', () => {
    expect(outstandingBalance({ grandTotal: 100, paidAmount: 100 })).toBe(0);
    expect(outstandingBalance({ grandTotal: 100, paidAmount: 125 })).toBe(0);
  });

  it('does not treat refunded invoices as outstanding', () => {
    expect(outstandingBalance({ grandTotal: 100, paidAmount: 0, paymentStatus: 'refunded' })).toBe(0);
  });

  it('handles missing and numeric-string amounts', () => {
    expect(outstandingBalance({ grandTotal: '19.95', paidAmount: '5.25' })).toBeCloseTo(14.7);
    expect(outstandingBalance({})).toBe(0);
  });
});
