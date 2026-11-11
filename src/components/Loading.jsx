export default function Loading({ text = 'Đang tải dữ liệu...' }) {
  return (
    <div className="loading-state" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>{text}</p>
    </div>
  );
}
