import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';

export const Breadcrumb = ({ items = [] }) => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

 const filteredSegments = pathSegments.filter(
  (segment) => !['student', 'recruiter', 'admin'].includes(segment.toLowerCase())
);

const defaultItems = filteredSegments.map((segment, index) => {
  const url = `/${filteredSegments.slice(0, index + 1).join('/')}`;
  const label = segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return { label, url };
});

  const list = items.length > 0 ? items : defaultItems;

  return (
    <nav aria-label="Breadcrumb" className="dashboard-breadcrumb">
      <ol style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', listStyle: 'none', margin: 0, padding: 0, fontSize: '0.8125rem', color: 'var(--color-muted)' }}>
        <li>
          <Link to="/" style={{ color: 'var(--color-muted)', display: 'flex', alignItems: 'center', textDecoration: 'none' }} title="Home">
            <FiHome style={{ fontSize: '0.9rem' }} />
          </Link>
        </li>
        {list.map((item, index) => (
          <React.Fragment key={item.url || index}>
            <li style={{ color: 'var(--color-subtle)', display: 'flex', alignItems: 'center' }}>
              <FiChevronRight style={{ fontSize: '0.8rem' }} />
            </li>
            <li>
              {index === list.length - 1 ? (
                <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{item.label}</span>
              ) : (
                <Link to={item.url} style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>
                  {item.label}
                </Link>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
