import React, { useState } from 'react';
import { FiSearch, FiLoader, FiInbox, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export const AdminDataTable = ({
  columns = [],
  data = [],
  loading = false,
  searchPlaceholder = 'Search records...',
  pageSize = 15,
  emptyTitle = 'No records found',
  emptySub = 'Try adjusting your filters or search term.',
  headerActions = null,
}) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filteredData = data.filter((row) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return columns.some((col) => {
      const val = col.accessor ? row[col.accessor] : col.searchValue ? col.searchValue(row) : null;
      return val ? String(val).toLowerCase().includes(term) : false;
    });
  });

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      {/* Top Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <FiSearch
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-muted)',
              fontSize: '0.9rem',
            }}
          />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.5rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface-sec)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              fontSize: '0.85rem',
              outline: 'none',
              transition: 'border-color var(--transition-fast)',
            }}
          />
        </div>

        {headerActions && <div style={{ display: 'flex', gap: '0.5rem' }}>{headerActions}</div>}
      </div>

      {/* Table Container */}
      <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
          <thead>
            <tr
              style={{
                background: 'var(--color-surface-sec)',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              {columns.map((col, idx) => (
                <th
                  key={col.header || idx}
                  style={{
                    padding: '0.85rem 1.1rem',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: 'var(--color-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                    width: col.width || 'auto',
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
                  <FiLoader
                    style={{
                      fontSize: '2rem',
                      color: 'var(--color-primary)',
                      animation: 'spin 1s linear infinite',
                      display: 'block',
                      margin: '0 auto 0.75rem',
                    }}
                  />
                  <span style={{ color: 'var(--color-muted)', fontWeight: 600, fontSize: '0.9rem' }}>
                    Loading data from Supabase...
                  </span>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
                  <FiInbox style={{ fontSize: '2.5rem', color: 'var(--color-subtle)', marginBottom: '0.5rem', opacity: 0.5 }} />
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>{emptyTitle}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: '0.2rem' }}>{emptySub}</div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-sec)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      style={{
                        padding: '0.9rem 1.1rem',
                        color: 'var(--color-text)',
                        verticalAlign: 'middle',
                      }}
                    >
                      {col.render ? col.render(row, rowIdx) : row[col.accessor] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            paddingTop: '0.5rem',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
            Showing {Math.min((currentPage - 1) * pageSize + 1, filteredData.length)} to{' '}
            {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
                padding: '0.4rem 0.8rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface-sec)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.4 : 1,
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              <FiChevronLeft /> Prev
            </button>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', padding: '0 0.4rem' }}>
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
                padding: '0.4rem 0.8rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface-sec)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.4 : 1,
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              Next <FiChevronRight />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AdminDataTable;
