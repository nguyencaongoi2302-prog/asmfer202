import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div>
        <span>404</span>
        <h1>Không tìm thấy trang</h1>
        <p>Đường dẫn bạn truy cập không tồn tại hoặc đã được thay đổi.</p>
        <Link className="button button-primary" to="/">
          Về trang chính
        </Link>
      </div>
    </div>
  );
}
