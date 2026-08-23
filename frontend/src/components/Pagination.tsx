import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount?: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, totalCount, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = [];
  
  // Show at most 5 page buttons (e.g. 1 2 3 4 5, or 2 3 4 5 6)
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);
  
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        {totalCount !== undefined ? `Нийт илэрц: ${totalCount}` : `Нийт хуудас: ${totalPages}`}
      </div>
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '0.35rem 0.75rem',
            border: '1px solid var(--border-color)',
            background: currentPage === 1 ? '#f1f5f9' : 'white',
            color: currentPage === 1 ? '#94a3b8' : 'var(--text-color)',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            borderRadius: '0.25rem',
            fontSize: '0.875rem'
          }}
        >
          Өмнөх
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              style={{
                padding: '0.35rem 0.75rem',
                border: '1px solid var(--border-color)',
                background: 'white',
                color: 'var(--text-color)',
                cursor: 'pointer',
                borderRadius: '0.25rem',
                fontSize: '0.875rem'
              }}
            >
              1
            </button>
            {startPage > 2 && <span style={{ padding: '0.35rem 0.5rem', color: '#94a3b8' }}>...</span>}
          </>
        )}

        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            style={{
              padding: '0.35rem 0.75rem',
              border: `1px solid ${page === currentPage ? 'var(--primary-color)' : 'var(--border-color)'}`,
              background: page === currentPage ? 'var(--primary-color)' : 'white',
              color: page === currentPage ? 'white' : 'var(--text-color)',
              cursor: 'pointer',
              borderRadius: '0.25rem',
              fontWeight: page === currentPage ? 600 : 400,
              fontSize: '0.875rem'
            }}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span style={{ padding: '0.35rem 0.5rem', color: '#94a3b8' }}>...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              style={{
                padding: '0.35rem 0.75rem',
                border: '1px solid var(--border-color)',
                background: 'white',
                color: 'var(--text-color)',
                cursor: 'pointer',
                borderRadius: '0.25rem',
                fontSize: '0.875rem'
              }}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: '0.35rem 0.75rem',
            border: '1px solid var(--border-color)',
            background: currentPage === totalPages ? '#f1f5f9' : 'white',
            color: currentPage === totalPages ? '#94a3b8' : 'var(--text-color)',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            borderRadius: '0.25rem',
            fontSize: '0.875rem'
          }}
        >
          Дараах
        </button>
      </div>
    </div>
  );
}
