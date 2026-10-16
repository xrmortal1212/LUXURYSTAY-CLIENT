import { startTransition, useCallback, useEffect, useState } from 'react';
import { Download, Mail, Printer, Receipt, RefreshCw } from 'lucide-react';
import { api, getApiErrorMessage } from '../../Config/api';
import { EmptyState, ErrorState, LoadingState, Panel, Status } from './DashboardParts';
import { dateLabel, money } from './DashboardUtils';
import { outstandingBalance } from './BillingUtils';

const BillingWorkflow = ({
  id,
  title = 'Billing overview',
  allowEmail = false,
  allowPaymentRecording = false,
  allowCharges = false,
  guestView = false
}) => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState('');
  const [paymentForms, setPaymentForms] = useState({});
  const [chargeForms, setChargeForms] = useState({});
  const [paymentHistory, setPaymentHistory] = useState({});
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async (requestedPage = 1) => {
    setLoading(true);
    setError('');
    try {
      const endpoint = guestView ? '/billing/my-bills' : '/billing/overview';
      const { data } = await api.get(endpoint, { params: { limit: 100, page: requestedPage } });
      setRecords(data.invoices || data.billings || []);
      setSummary(data.summary || null);
      setPagination(data.pagination || { page: requestedPage, pages: 1, total: 0 });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Billing records could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }, [guestView]);

  useEffect(() => { startTransition(() => { void load(); }); }, [load]);

  const downloadInvoice = async (billing, print = false) => {
    const printWindow = print ? window.open('', '_blank') : null;
    setWorkingId(billing._id);
    setError('');
    try {
      const { data } = await api.get(`/billing/${billing._id}/invoice`, { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      if (print && printWindow) {
        printWindow.location.href = url;
        printWindow.addEventListener('load', () => printWindow.print(), { once: true });
      } else if (printWindow) {
        printWindow.close();
      }
      const link = document.createElement('a');
      link.href = url;
      link.download = `${billing.invoiceNumber || billing.booking?.bookingReference || 'invoice'}.pdf`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (requestError) {
      if (printWindow) printWindow.close();
      setError(getApiErrorMessage(requestError, 'Invoice could not be downloaded.'));
    } finally {
      setWorkingId('');
    }
  };

  const emailInvoice = async billing => {
    setWorkingId(billing._id);
    setError('');
    setNotice('');
    try {
      const { data } = await api.post(`/billing/${billing._id}/email`);
      setNotice(data.message || 'Invoice email request completed.');
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Invoice could not be emailed.'));
    } finally {
      setWorkingId('');
    }
  };

  const recordPayment = async (event, billing) => {
    event.preventDefault();
    const form = paymentForms[billing._id] || { amountPaid: '', paymentMethod: 'cash' };
    setWorkingId(billing._id);
    setError('');
    setNotice('');
    try {
      const { data } = await api.post(`/billing/${billing._id}/payment`, {
        amountPaid: Number(form.amountPaid),
        paymentMethod: form.paymentMethod
      });
      setRecords(current => current.map(record =>
        record._id === billing._id ? { ...record, ...data.billing, booking: record.booking } : record
      ));
      setNotice('Received payment recorded; billing status updated by the server.');
      setPaymentForms(current => ({ ...current, [billing._id]: { ...form, amountPaid: '' } }));
      setPaymentHistory(current => ({ ...current, [billing._id]: undefined }));
      await load(pagination.page);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Payment receipt could not be recorded.'));
    } finally {
      setWorkingId('');
    }
  };

  const addCharge = async (event, billing) => {
    event.preventDefault();
    const form = chargeForms[billing._id] || { description: '', amount: '' };
    setWorkingId(billing._id);
    setError('');
    setNotice('');
    try {
      const { data } = await api.post(`/billing/${billing._id}/charges`, {
        description: form.description,
        amount: Number(form.amount),
        code: 'front_desk'
      });
      setRecords(current => current.map(record =>
        record._id === billing._id ? { ...record, ...data.billing, booking: record.booking } : record
      ));
      setNotice('Charge added to the bill.');
      setChargeForms(current => ({ ...current, [billing._id]: { description: '', amount: '' } }));
      await load(pagination.page);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Charge could not be added.'));
    } finally {
      setWorkingId('');
    }
  };

  const showPayments = async billing => {
    if (paymentHistory[billing._id]) return;
    setWorkingId(billing._id);
    setError('');
    try {
      const { data } = await api.get(`/billing/${billing._id}/payments`);
      setPaymentHistory(current => ({ ...current, [billing._id]: data.payments || [] }));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Payment history could not be loaded.'));
    } finally {
      setWorkingId('');
    }
  };

  const totalOutstanding = summary?.outstandingBalance
    ?? records.reduce((sum, billing) => sum + outstandingBalance(billing), 0);
  const totalCollected = summary?.paidAmount
    ?? records.reduce((sum, billing) => sum + Number(billing.paidAmount || 0), 0);

  return (
    <Panel
      id={id}
      title={title}
      meta={`${summary?.invoiceCount ?? records.length} bills · ${money(totalOutstanding)} outstanding`}
      action={<button className="dash-button-secondary" type="button" onClick={() => void load(pagination.page)} disabled={loading}><RefreshCw size={13} /> Refresh billing</button>}
    >
      <div className="dash-panel-body dash-billing-summary">
        <div><span>Bills found</span><strong>{summary?.invoiceCount ?? records.length}</strong></div>
        <div><span>Collected</span><strong>{money(totalCollected)}</strong></div>
        <div><span>Outstanding</span><strong>{money(totalOutstanding)}</strong></div>
      </div>
      {error && <div className="dash-panel-body"><ErrorState message={error} onRetry={() => void load(pagination.page)} /></div>}
      {notice && <div className="dash-panel-body"><div className="dash-note" role="status">{notice}</div></div>}
      {loading ? <LoadingState label="Loading billing records…" /> : records.length === 0
        ? <EmptyState>No billing records are available yet.</EmptyState>
        : <div className="dash-table-wrap">
          <table className="dash-table">
            <thead><tr><th>Invoice / booking</th><th>Guest / room</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{records.map(billing => {
              const booking = billing.booking || {};
              const balance = outstandingBalance(billing);
              const form = paymentForms[billing._id] || { amountPaid: '', paymentMethod: 'cash' };
              const chargeForm = chargeForms[billing._id] || { description: '', amount: '' };
              return <tr key={billing._id}>
                <td><strong>{billing.invoiceNumber || 'Invoice pending'}</strong><br />{booking.bookingReference || 'Booking'}<br />{dateLabel(booking.checkInDate)} – {dateLabel(booking.checkOutDate)}</td>
                <td>{booking.user?.name || 'Guest'}<br />Room {booking.room?.roomNumber || '—'}</td>
                <td>{money(billing.grandTotal)}</td>
                <td>{money(billing.paidAmount)}</td>
                <td>{money(balance)}</td>
                <td><Status value={billing.paymentStatus} /></td>
                <td><div className="dash-billing-actions">
                  <button className="dash-button-secondary" type="button" disabled={workingId === billing._id} onClick={() => downloadInvoice(billing)}><Download size={13} /> Download</button>
                  <button className="dash-button-secondary" type="button" disabled={workingId === billing._id} onClick={() => downloadInvoice(billing, true)}><Printer size={13} /> Print</button>
                  {allowEmail && <button className="dash-button-secondary" type="button" disabled={workingId === billing._id} onClick={() => emailInvoice(billing)}><Mail size={13} /> Email invoice</button>}
                  <details onToggle={event => { if (event.currentTarget.open) void showPayments(billing); }}>
                    <summary><Receipt size={13} /> Charges & payment history</summary>
                    <div className="dash-billing-details">
                      <div>Room subtotal <strong>{money(billing.subtotal)}</strong></div>
                      {(billing.additionalCharges || []).map((charge, index) => <div key={`${charge.code || charge.description}-${index}`}>{charge.description} <strong>{money(charge.amount)}</strong></div>)}
                      <div>Tax <strong>{money(billing.taxAmount)}</strong></div>
                      {allowCharges && booking.status === 'checked_in' && <form className="dash-billing-payment" onSubmit={event => addCharge(event, billing)}>
                        <label className="dash-field">Room / service charge<input required maxLength="200" value={chargeForm.description} onChange={event => setChargeForms(current => ({ ...current, [billing._id]: { ...chargeForm, description: event.target.value } }))} placeholder="Description" /></label>
                        <label className="dash-field">Amount<input required type="number" min="0.01" step="0.01" value={chargeForm.amount} onChange={event => setChargeForms(current => ({ ...current, [billing._id]: { ...chargeForm, amount: event.target.value } }))} /></label>
                        <button className="dash-button-secondary" type="submit" disabled={workingId === billing._id}>{workingId === billing._id ? 'Saving…' : 'Add charge'}</button>
                      </form>}
                      {allowPaymentRecording && balance > 0 && <form className="dash-billing-payment" onSubmit={event => recordPayment(event, billing)}>
                        <label className="dash-field">Amount received<input aria-label={`Amount received for ${booking.bookingReference || 'booking'}`} type="number" min="0.01" max={balance} step="0.01" required value={form.amountPaid} onChange={event => setPaymentForms(current => ({ ...current, [billing._id]: { ...form, amountPaid: event.target.value } }))} /></label>
                        <label className="dash-field">Method<select value={form.paymentMethod} onChange={event => setPaymentForms(current => ({ ...current, [billing._id]: { ...form, paymentMethod: event.target.value } }))}><option value="cash">Cash</option><option value="card">Card</option><option value="upi">UPI</option><option value="bank_transfer">Bank transfer</option></select></label>
                        <button className="dash-button" type="submit" disabled={workingId === billing._id}>{workingId === billing._id ? 'Saving…' : 'Record received payment'}</button>
                      </form>}
                      {!allowPaymentRecording && guestView && balance > 0 && <p className="dash-metric-note">Online payment is unavailable; no real payment gateway is configured.</p>}
                      {paymentHistory[billing._id]
                        ? paymentHistory[billing._id].length
                          ? paymentHistory[billing._id].map(payment => <div key={payment._id}>{dateLabel(payment.paymentDate)} · {payment.paymentMethod || 'Payment'} <strong>{money(payment.amount)}</strong></div>)
                          : <p>No payment transactions recorded.</p>
                        : <p>{workingId === billing._id ? 'Loading payment history…' : 'Open to load recorded payments.'}</p>}
                    </div>
                  </details>
                </div></td>
              </tr>;
            })}</tbody>
          </table>
        </div>}
      {pagination.pages > 1 && <div className="dash-panel-body dash-toolbar dash-billing-pagination">
        <button className="dash-button-secondary" type="button" disabled={loading || pagination.page <= 1} onClick={() => void load(pagination.page - 1)}>Previous</button>
        <span>Page {pagination.page} of {pagination.pages} · {pagination.total} invoices</span>
        <button className="dash-button-secondary" type="button" disabled={loading || pagination.page >= pagination.pages} onClick={() => void load(pagination.page + 1)}>Next</button>
      </div>}
      {guestView && <div className="dash-panel-body dash-metric-note">Online payment is unavailable because no payment gateway is configured.</div>}
    </Panel>
  );
};

export default BillingWorkflow;
