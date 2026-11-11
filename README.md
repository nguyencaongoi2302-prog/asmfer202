# English Quiz Hub

Dự án web thi trắc nghiệm tiếng Anh sử dụng **ReactJS + Vite + React Router + JSON Server**. Dữ liệu được lưu trong `db.json` để phù hợp với đồ án học tập hoặc demo frontend.

## Chức năng

### Chung
- Đăng nhập và đăng xuất.
- Phân quyền route theo hai role: `admin` và `user`.
- Giao diện responsive cho máy tính, tablet và điện thoại.

### Học viên (`user`)
- Tự đăng ký tài khoản; role luôn được gán là `user`.
- Xem và tìm kiếm các bài thi đang công khai.
- Xem thông tin bài thi trước khi bắt đầu.
- Làm trắc nghiệm với đồng hồ đếm ngược và điều hướng câu hỏi.
- Tự động nộp khi hết thời gian.
- Chấm điểm, xác định đạt/chưa đạt và xem giải thích đáp án.
- Xem lịch sử các lần làm bài.

### Quản trị viên (`admin`)
- Xem dashboard thống kê.
- CRUD bài thi.
- Bật/tắt trạng thái công khai.
- CRUD câu hỏi, đáp án, đáp án đúng và giải thích.
- Sắp xếp thứ tự câu hỏi.
- Xem kết quả học viên theo từng bài thi.
- Khi xóa bài thi, ứng dụng xóa luôn câu hỏi và kết quả liên quan.

## Tài khoản mẫu

| Role | Email | Mật khẩu |
|---|---|---|
| Admin | `admin@example.com` | `admin123` |
| User | `user@example.com` | `user123` |

## Yêu cầu môi trường

- Node.js 22 trở lên được khuyến nghị.
- npm 10 trở lên.

## Chạy dự án

```bash
npm install
npm start
```

Lệnh `npm start` chạy đồng thời:
- React/Vite: `http://localhost:5173`
- JSON Server API: `http://localhost:3001`

Có thể chạy riêng từng phần:

```bash
npm run server
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Cấu trúc chính

```text
english-quiz-react/
├── db.json
├── package.json
├── vite.config.js
├── index.html
└── src/
    ├── components/
    ├── context/
    │   └── AuthContext.jsx
    ├── layouts/
    ├── pages/
    │   ├── admin/
    │   ├── auth/
    │   └── user/
    ├── routes/
    ├── services/
    │   └── api.js
    ├── styles/
    ├── utils/
    ├── App.jsx
    └── main.jsx
```

## Cấu trúc `db.json`

- `users`: tài khoản admin/user.
- `quizzes`: thông tin bài thi.
- `questions`: câu hỏi, liên kết bằng `quizId`.
- `attempts`: kết quả làm bài, câu trả lời và điểm số.

## Lưu ý bảo mật

Dự án dùng JSON Server nên chỉ phù hợp để học tập/prototype. Mật khẩu hiện được lưu dạng văn bản trong `db.json`, việc đăng nhập được kiểm tra ở phía client và JSON Server không có cơ chế authorization thực sự. Khi triển khai sản phẩm thật, cần thay bằng backend (Node.js/Express, NestJS, Java/Spring, .NET...) có hash mật khẩu, JWT/session, validation và kiểm tra quyền ở server.
