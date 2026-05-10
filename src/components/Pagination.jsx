export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <nav className="mt-3">
      <ul className="pagination pagination-sm justify-content-end mb-0">
        <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(page - 1)}>Previous</button>
        </li>
        {Array.from({ length: totalPages }, (_, i) => (
          <li key={i} className={`page-item ${i === page ? 'active' : ''}`}>
            <button className="page-link" onClick={() => onPageChange(i)}>{i + 1}</button>
          </li>
        ))}
        <li className={`page-item ${page === totalPages - 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(page + 1)}>Next</button>
        </li>
      </ul>
    </nav>
  );
}
