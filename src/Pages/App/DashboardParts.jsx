import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight, RefreshCw, TriangleAlert } from 'lucide-react';
import { dateLabel, titleCase } from './DashboardUtils';

export const PageHeading = ({ eyebrow, title, description, action, meta }) => (
  <div className="dash-page-head">
    <div>
      <div className="dash-head-top">
        <span className="dash-eyebrow">{eyebrow}</span>
        {meta}
      </div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
    {action}
  </div>
);

export const Metric = ({ label, value, note, icon: Icon, trend, trendLabel }) => {
  const hasTrend = typeof trend === 'number' && Number.isFinite(trend);
  const direction = !hasTrend ? null : trend > 0 ? 'up' : trend < 0 ? 'down' : 'flat';
  return (
    <article className="dash-metric">
      <div className="dash-metric-label"><span>{label}</span>{Icon && <Icon className="dash-metric-icon" size={17} aria-hidden="true" />}</div>
      <strong className="dash-metric-value">{value ?? '—'}</strong>
      {(note || direction) && (
        <div className="dash-metric-foot">
          {note && <span className="dash-metric-note">{note}</span>}
          {direction && (
            <span className={`dash-metric-trend dash-metric-trend--${direction}`} title={trendLabel ? `${trendLabel}` : undefined}>
              <span aria-hidden="true">{direction === 'up' ? '▲' : direction === 'down' ? '▼' : '–'}</span>
              {`${Math.abs(trend)}%${trendLabel ? ` ${trendLabel}` : ''}`}
            </span>
          )}
        </div>
      )}
    </article>
  );
};

/* ---------------------------------------------
   Loading skeletons
   --------------------------------------------- */
export const Skeleton = ({ width = '100%', height = 12, radius = 6, className = '' }) => (
  <span className={`dash-skeleton${className ? ` ${className}` : ''}`} style={{ width, height, borderRadius: radius }} aria-hidden="true" />
);

export const PanelSkeleton = ({ rows = 4 }) => (
  <div className="dash-skeleton-panel" aria-hidden="true">
    {Array.from({ length: rows }).map((_, index) => <Skeleton key={index} height={36} />)}
  </div>
);

export const LoadingState = ({ label = 'Loading records…' }) => (
  <div className="dash-skeleton-grid" role="status" aria-live="polite">
    <span className="dash-visually-hidden">{label}</span>
    {Array.from({ length: 4 }).map((_, index) => (
      <div className="dash-skeleton-card" key={`metric-${index}`}>
        <Skeleton width="52%" height={10} />
        <Skeleton width="68%" height={24} />
        <Skeleton width="80%" height={10} />
      </div>
    ))}
    <div className="dash-skeleton-card dash-skeleton-card--wide">
      <Skeleton width="28%" height={12} />
      <PanelSkeleton rows={5} />
    </div>
  </div>
);

export const EmptyState = ({ children = 'No records to show.' }) => <div className="dash-empty">{children}</div>;

export const ErrorState = ({ message, onRetry }) => (
  <div className="dash-error" role="alert">
    {message} {onRetry && <button className="dash-retry" type="button" onClick={onRetry}><RefreshCw size={13} /> Retry</button>}
  </div>
);

/* ---------------------------------------------
   Panel (supports its own loading / error / lazy states)
   --------------------------------------------- */
export const Panel = ({ id, title, meta, action, loading, error, onRetry, lazy = false, children }) => {
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(!lazy);

  useEffect(() => {
    if (inView || !lazy) return undefined;
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setInView(true);
        observer.disconnect();
      }
    }, { rootMargin: '360px 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [inView, lazy]);

  let body;
  if (error) {
    body = (
      <div className="dash-panel-error" role="alert">
        <TriangleAlert size={15} aria-hidden="true" />
        <span>{error}</span>
        {onRetry && <button className="dash-retry" type="button" onClick={onRetry}><RefreshCw size={13} /> Retry</button>}
      </div>
    );
  } else if (loading || !inView) {
    body = <PanelSkeleton />;
  } else {
    body = children;
  }

  return (
    <section ref={sectionRef} className="dash-panel" id={id}>
      <div className="dash-panel-head"><h2>{title}</h2><div>{action || (meta && <span>{meta}</span>)}</div></div>
      {body}
    </section>
  );
};

export const Status = ({ value }) => (
  <span className={`dash-status dash-status--${String(value || '').toLowerCase()}`}>{titleCase(value)}</span>
);

/* ---------------------------------------------
   Table with client-side search, sort and pagination
   --------------------------------------------- */
export const Table = ({
  columns,
  rows,
  empty = 'No matching records.',
  searchable,
  sortable = true,
  pageSize = 8,
  searchPlaceholder = 'Search…'
}) => {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ label: '', direction: 'asc' });
  const [page, setPage] = useState(1);

  const cellValue = (row, column) => {
    if (column.sortValue) return column.sortValue(row);
    if (column.key) return row[column.key];
    return '';
  };
  const isSortable = column => sortable && Boolean(column.key || column.sortValue);

  const normalizedQuery = query.trim().toLowerCase();
  const searched = useMemo(() => {
    if (!normalizedQuery) return rows;
    return rows.filter(row => {
      try {
        return JSON.stringify(row).toLowerCase().includes(normalizedQuery);
      } catch {
        return false;
      }
    });
  }, [rows, normalizedQuery]);

  const sorted = useMemo(() => {
    const column = columns.find(item => item.label === sort.label);
    if (!column) return searched;
    const factor = sort.direction === 'asc' ? 1 : -1;
    return [...searched].sort((first, second) => {
      const left = cellValue(first, column);
      const right = cellValue(second, column);
      if (left === right) return 0;
      if (typeof left === 'number' && typeof right === 'number') return (left - right) * factor;
      return String(left ?? '').localeCompare(String(right ?? ''), undefined, { numeric: true }) * factor;
    });
  }, [searched, sort, columns]);

  useEffect(() => { setPage(1); }, [normalizedQuery, sort.label, sort.direction]);

  const showPagination = pageSize > 0 && sorted.length > pageSize;
  const pageCount = showPagination ? Math.ceil(sorted.length / pageSize) : 1;
  const currentPage = Math.min(page, pageCount);
  const visible = showPagination ? sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize) : sorted;
  const showSearch = (searchable ?? rows.length > 5) && rows.length > 0;

  const toggleSort = label => setSort(current => current.label === label
    ? { label, direction: current.direction === 'asc' ? 'desc' : 'asc' }
    : { label, direction: 'asc' });

  return (
    <div className="dash-table-wrap">
      {showSearch && (
        <div className="dash-table-toolbar">
          <input
            className="dash-table-search"
            type="search"
            value={query}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            onChange={event => setQuery(event.target.value)}
          />
          {normalizedQuery && <span className="dash-table-count">{sorted.length} of {rows.length}</span>}
        </div>
      )}
      {rows.length === 0 ? <EmptyState>{empty}</EmptyState> : visible.length === 0 ? (
        <EmptyState>No records match your search.</EmptyState>
      ) : (
        <table className="dash-table">
          <thead>
            <tr>
              {columns.map(column => (
                <th key={column.label} scope="col">
                  {isSortable(column) ? (
                    <button
                      className={`dash-sort${sort.label === column.label ? ' is-active' : ''}`}
                      type="button"
                      onClick={() => toggleSort(column.label)}
                      aria-label={`Sort by ${column.label}`}
                    >
                      {column.label}
                      {sort.label === column.label
                        ? <span aria-hidden="true">{sort.direction === 'asc' ? '▲' : '▼'}</span>
                        : <ArrowUpDown size={12} aria-hidden="true" />}
                    </button>
                  ) : column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{visible.map((row, index) => <tr key={row.id || row._id || index}>{columns.map(column => <td key={column.label}>{column.render ? column.render(row) : row[column.key]}</td>)}</tr>)}</tbody>
        </table>
      )}
      {showPagination && (
        <div className="dash-table-foot">
          <span>{sorted.length} records · page {currentPage} of {pageCount}</span>
          <div className="dash-toolbar">
            <button className="dash-button-secondary" type="button" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={13} /> Prev</button>
            <button className="dash-button-secondary" type="button" disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)}>Next <ChevronRight size={13} /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export const BookingTable = ({ bookings, actions }) => (
  <Table
    rows={bookings}
    empty="No reservations in this view."
    columns={[
      { label: 'Reference', key: 'bookingReference', render: booking => <strong>{booking.bookingReference}</strong> },
      { label: 'Guest', sortValue: booking => booking.user?.name, render: booking => booking.user?.name || 'Guest' },
      { label: 'Room', sortValue: booking => booking.room?.roomNumber, render: booking => booking.room?.roomNumber || booking.room?.roomType?.title || '—' },
      { label: 'Stay', sortValue: booking => booking.checkInDate, render: booking => `${dateLabel(booking.checkInDate)} - ${dateLabel(booking.checkOutDate)}` },
      { label: 'Status', key: 'status', render: booking => <Status value={booking.status} /> },
      ...(actions ? [{ label: 'Action', render: actions }] : [])
    ]}
  />
);

/* ---------------------------------------------
   Confirmation dialog + hook
   --------------------------------------------- */
const ConfirmContext = createContext(null);

export const useConfirm = () => {
  const confirm = useContext(ConfirmContext);
  return confirm || (async () => true);
};

export const ConfirmDialog = ({ open, title = 'Please confirm', message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', tone = 'danger', busy = false, onConfirm, onCancel }) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = event => { if (event.key === 'Escape') onCancel?.(); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div className="dash-dialog-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onCancel?.(); }}>
      <div className="dash-dialog" role="alertdialog" aria-modal="true" aria-label={title}>
        <h2>{title}</h2>
        {message && <p>{message}</p>}
        <div className="dash-dialog-actions">
          <button className="dash-button-secondary" type="button" onClick={onCancel} disabled={busy}>{cancelLabel}</button>
          <button className={tone === 'danger' ? 'dash-button-danger' : 'dash-button'} type="button" onClick={onConfirm} disabled={busy}>{busy ? 'Working…' : confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};

export const ConfirmProvider = ({ children }) => {
  const [request, setRequest] = useState(null);
  const requestRef = useRef(null);

  const confirm = useCallback(options => new Promise(resolve => {
    const next = { ...(typeof options === 'string' ? { message: options } : options), resolve };
    requestRef.current = next;
    setRequest(next);
  }), []);

  const settle = useCallback(answer => {
    requestRef.current?.resolve(answer);
    requestRef.current = null;
    setRequest(null);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        open={Boolean(request)}
        title={request?.title}
        message={request?.message}
        confirmLabel={request?.confirmLabel}
        cancelLabel={request?.cancelLabel}
        tone={request?.tone}
        onConfirm={() => settle(true)}
        onCancel={() => settle(false)}
      />
    </ConfirmContext.Provider>
  );
};
