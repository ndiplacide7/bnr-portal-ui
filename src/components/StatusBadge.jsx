const COLORS = {
  DRAFT:            'secondary',
  SUBMITTED:        'info',
  UNDER_REVIEW:     'warning',
  REVIEW_COMPLETED: 'primary',
  APPROVED:         'success',
  REJECTED:         'danger',
  WITHDRAWN:        'dark',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`badge bg-${COLORS[status] ?? 'secondary'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}
