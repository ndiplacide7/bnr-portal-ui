export default function ErrorAlert({ message }) {
  return (
    <div className="alert alert-danger" role="alert">
      {message || 'An unexpected error occurred. Please try again.'}
    </div>
  );
}
