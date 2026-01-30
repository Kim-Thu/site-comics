# 📚 Site Comics - Nền tảng Đọc Truyện Tranh

Một nền tảng đọc truyện tranh full-stack hiện đại được xây dựng với NestJS, Next.js và React, hỗ trợ quản lý nội dung mạnh mẽ và trải nghiệm người dùng tuyệt vời.

![Tech Stack](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

## 📋 Mục Lục

- [Tổng Quan](#-tổng-quan)
- [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Yêu Cầu Hệ Thống](#-yêu-cầu-hệ-thống)
- [Hướng Dẫn Cài Đặt](#-hướng-dẫn-cài-đặt)
- [Hướng Dẫn Sử Dụng](#-hướng-dẫn-sử-dụng)
- [Tính Năng](#-tính-năng)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

## 🎯 Tổng Quan

**Site Comics** là một hệ thống quản lý và đọc truyện tranh trực tuyến bao gồm:

- **Backend API** - Server NestJS với MongoDB, xử lý logic nghiệp vụ và lưu trữ dữ liệu
- **Frontend Website** - Giao diện người dùng Next.js với SSR/SSG để SEO tối ưu
- **CMS Dashboard** - Bảng điều khiển quản trị React để quản lý nội dung

## 📁 Cấu Trúc Dự Án

```
site-comics/
├── backend/                 # NestJS API Server
│   ├── src/
│   │   ├── auth/           # Xác thực & phân quyền
│   │   ├── comics/         # Quản lý truyện
│   │   ├── chapters/       # Quản lý chương
│   │   ├── categories/     # Quản lý thể loại
│   │   ├── tags/           # Quản lý tags
│   │   ├── users/          # Quản lý người dùng
│   │   ├── media/          # Quản lý file upload
│   │   ├── menus/          # Quản lý menu
│   │   ├── settings/       # Cài đặt hệ thống
│   │   └── layout/         # Header/Footer động
│   ├── prisma/             # Database schema
│   └── uploads/            # Thư mục lưu file upload
│
├── frontend/               # Next.js Website
│   ├── src/
│   │   ├── app/           # App Router (Next.js 14)
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities & helpers
│   └── public/            # Static assets
│
└── cms/                    # React Admin Dashboard
    ├── src/
    │   ├── presentation/  # UI Components & Pages
    │   ├── infrastructure/# API Services
    │   └── core/          # Business Logic
    └── public/            # Static assets
```

## 🛠 Công Nghệ Sử Dụng

### Backend
- **NestJS** - Framework Node.js enterprise-grade
- **Prisma ORM** - Type-safe database client
- **MongoDB** - NoSQL database
- **JWT** - Authentication & Authorization
- **Passport.js** - Authentication middleware
- **Multer** - File upload handling
- **Helmet** - Security headers
- **Class Validator** - DTO validation

### Frontend
- **Next.js 14** - React framework với App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **React Query** - Data fetching & caching
- **Zustand** - State management
- **Lucide Icons** - Icon library

### CMS
- **React 18** - UI library
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing
- **React Hot Toast** - Notifications
- **@dnd-kit** - Drag & drop functionality

## 💻 Yêu Cầu Hệ Thống

Trước khi bắt đầu, đảm bảo máy tính của bạn đã cài đặt:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **npm** >= 9.0.0 hoặc **yarn** >= 1.22.0
- **MongoDB** >= 6.0 ([Download](https://www.mongodb.com/try/download/community))
- **Git** ([Download](https://git-scm.com/downloads))

### Kiểm tra phiên bản đã cài đặt:

```bash
node --version    # v18.x.x trở lên
npm --version     # 9.x.x trở lên
mongo --version   # 6.x.x trở lên
```

## 🚀 Hướng Dẫn Cài Đặt

### Bước 1: Clone Repository

```bash
git clone https://github.com/Kim-Thu/site-comics.git
cd site-comics
```

### Bước 2: Cài Đặt MongoDB

#### Windows:
1. Download MongoDB Community Server từ [trang chính thức](https://www.mongodb.com/try/download/community)
2. Cài đặt và chạy MongoDB như một service
3. Mặc định MongoDB sẽ chạy tại `mongodb://localhost:27017`

#### macOS (với Homebrew):
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Bước 3: Cấu Hình Backend

```bash
cd backend
npm install
```

Tạo file `.env` trong thư mục `backend/`:

```env
# Database
DATABASE_URL="mongodb://127.0.0.1:27017/site-comics"

# JWT Secret (thay đổi thành chuỗi bí mật của bạn)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# API URL
API_URL="http://localhost:3001"

# Redis (Optional - nếu sử dụng cache)
REDIS_HOST="localhost"
REDIS_PORT=6379

# Email Configuration (Optional - cho tính năng gửi email)
MAIL_USER="your-email@gmail.com"
MAIL_PASSWORD="your-app-password"

# CORS Origins
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3002,http://localhost:5173"
```

Khởi tạo database:

```bash
npx prisma generate
npx prisma db push
```

Seed dữ liệu mẫu (optional):

```bash
npx prisma db seed
```

### Bước 4: Cấu Hình Frontend

```bash
cd ../frontend
npm install
```

Tạo file `.env.local` trong thư mục `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Bước 5: Cấu Hình CMS

```bash
cd ../cms
npm install
```

Tạo file `.env` trong thư mục `cms/`:

```env
VITE_API_URL=http://localhost:3001
```

### Bước 6: Khởi Động Các Services

Mở 3 terminal riêng biệt:

#### Terminal 1 - Backend (Port 3001):
```bash
cd backend
npm run start:dev
```

#### Terminal 2 - Frontend (Port 3000):
```bash
cd frontend
npm run dev
```

#### Terminal 3 - CMS (Port 5173):
```bash
cd cms
npm run dev
```

### Bước 7: Truy Cập Ứng Dụng

- **Frontend Website**: http://localhost:3000
- **CMS Dashboard**: http://localhost:5173
- **Backend API**: http://localhost:3001

## 📖 Hướng Dẫn Sử Dụng

### Đăng Nhập CMS

Sau khi seed database, sử dụng tài khoản mặc định:

```
Email: admin@example.com
Password: admin123
```

**⚠️ Quan trọng**: Thay đổi mật khẩu ngay sau lần đăng nhập đầu tiên!

### Quản Lý Truyện

#### 1. Thêm Truyện Mới

1. Truy cập CMS tại http://localhost:5173
2. Đăng nhập với tài khoản admin
3. Vào menu **"Quản lý Truyện"** → **"Thêm truyện"**
4. Điền thông tin:
   - Tên truyện
   - Tác giả
   - Mô tả
   - Thể loại
   - Tags
   - Ảnh bìa (upload từ Thư viện ảnh)
5. Click **"Lưu"**

#### 2. Thêm Chương

1. Trong danh sách truyện, click vào icon **"Quản lý chương"**
2. Click **"Thêm chương"**
3. Nhập số chương và tiêu đề
4. Upload ảnh cho chương (có thể upload nhiều ảnh cùng lúc)
5. Sắp xếp thứ tự ảnh bằng drag & drop
6. Click **"Lưu"**

### Quản Lý Thể Loại & Tags

#### Thể Loại (Categories)
- Vào **"Quản lý Thể loại"**
- Click **"Thêm thể loại"**
- Nhập tên và slug (tự động tạo từ tên)
- Có thể tạo thể loại con bằng cách chọn thể loại cha

#### Tags (Nhãn)
- Vào **"Tags (Nhãn)"**
- Click **"Thêm Tag"**
- Nhập tên tag (ví dụ: #Fantasy, #Action)
- Slug tự động tạo

### Quản Lý Header/Footer Động

#### Header Builder
1. Vào **"Header Builder"**
2. Kéo thả các block từ thanh bên trái vào 3 vùng:
   - **Top Row**: Vùng trên cùng
   - **Center Row**: Vùng giữa (chính)
   - **Bottom Row**: Vùng dưới
3. Các block có sẵn:
   - **Logo**: Logo website
   - **Menu**: Menu điều hướng
   - **Search**: Thanh tìm kiếm
   - **User Menu**: Menu người dùng
   - **Banner Slider**: Slider quảng cáo
   - **HTML**: Tùy chỉnh HTML
4. Click vào block để chỉnh sửa cấu hình
5. Click **"Lưu Header"** để áp dụng

#### Menu Builder
1. Vào **"Menu Builder"**
2. Click **"Tạo Menu mới"**
3. Thêm các menu item:
   - Nhập label và URL
   - Kéo thả để sắp xếp
   - Indent/Outdent để tạo submenu
4. Click **"Lưu"**

### Quản Lý Media (Thư Viện Ảnh)

1. Vào **"Thư viện ảnh"**
2. Click **"Tải lên"** để upload ảnh mới
3. Click vào ảnh để xem chi tiết và chỉnh sửa:
   - Caption (tiêu đề)
   - Alt text (văn bản thay thế)
4. Click **"Sao chép URL"** để lấy đường dẫn ảnh
5. Sử dụng Shift + Click để chọn nhiều ảnh
6. Ctrl/Cmd + Click để chọn từng ảnh riêng lẻ

### Cài Đặt Hệ Thống

#### SEO Settings
1. Vào **"Cấu hình SEO"**
2. Cấu hình:
   - Site Title
   - Meta Description
   - Keywords
   - Open Graph tags
   - Twitter Card

#### General Settings
1. Vào **"Cài đặt chung"**
2. Cấu hình:
   - Tên website
   - Logo
   - Favicon
   - Thông tin liên hệ
   - Social media links

## ✨ Tính Năng

### Frontend (Website)
- ✅ Giao diện responsive, tối ưu mobile
- ✅ Server-Side Rendering (SSR) cho SEO
- ✅ Đọc truyện với trải nghiệm mượt mà
- ✅ Tìm kiếm truyện nâng cao
- ✅ Lọc theo thể loại, tags
- ✅ Lịch sử đọc truyện
- ✅ Bookmark/Theo dõi truyện
- ✅ Bình luận & đánh giá
- ✅ Dark mode
- ✅ Header/Footer động

### CMS (Admin Dashboard)
- ✅ Dashboard với thống kê
- ✅ Quản lý truyện & chương
- ✅ Upload & quản lý media
- ✅ Quản lý thể loại & tags
- ✅ Header/Footer builder với drag & drop
- ✅ Menu builder
- ✅ Quản lý người dùng & phân quyền
- ✅ Cấu hình SEO
- ✅ Cài đặt hệ thống
- ✅ Multi-select với Shift/Ctrl
- ✅ Bulk actions (xóa hàng loạt)

### Backend (API)
- ✅ RESTful API
- ✅ JWT Authentication
- ✅ Role-based Access Control (RBAC)
- ✅ File upload với validation
- ✅ Database với Prisma ORM
- ✅ API documentation
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Security headers (Helmet)
- ✅ Input validation

## 📚 API Documentation

### Authentication

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Comics

#### Get All Comics
```http
GET /comics?page=1&limit=20&search=keyword
```

#### Get Comic by ID
```http
GET /comics/id/:id
```

#### Create Comic (Admin only)
```http
POST /comics
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Comic Title",
  "author": "Author Name",
  "description": "Description",
  "thumbnail": "image-url",
  "categoryIds": ["cat-id-1", "cat-id-2"],
  "tagIds": ["tag-id-1"]
}
```

#### Update Comic (Admin only)
```http
PATCH /comics/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title"
}
```

### Media

#### Upload Image
```http
POST /media/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [binary]
```

#### Get Media List
```http
GET /media?page=1&limit=24&search=keyword
Authorization: Bearer {token}
```

## 🔧 Troubleshooting

### Lỗi kết nối MongoDB

**Vấn đề**: `MongoServerError: connect ECONNREFUSED`

**Giải pháp**:
```bash
# Kiểm tra MongoDB đang chạy
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl status mongod

# Nếu chưa chạy, khởi động:
sudo systemctl start mongod
```

### Lỗi Port đã được sử dụng

**Vấn đề**: `Error: listen EADDRINUSE: address already in use :::3001`

**Giải pháp**:
```bash
# Windows - Tìm và kill process
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3001 | xargs kill -9
```

### Lỗi Prisma Generate

**Vấn đề**: `Error: @prisma/client did not initialize yet`

**Giải pháp**:
```bash
cd backend
npx prisma generate
npm run start:dev
```

### Lỗi CORS

**Vấn đề**: `Access to fetch at 'http://localhost:3001' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Giải pháp**: Kiểm tra file `backend/.env` có đúng cấu hình:
```env
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3002,http://localhost:5173"
```

### Hình ảnh không hiển thị

**Vấn đề**: Uploaded images return 404

**Giải pháp**:
1. Kiểm tra thư mục `backend/uploads` tồn tại
2. Kiểm tra cấu hình Helmet trong `backend/src/main.ts`:
```typescript
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
```

### Build Production

#### Backend
```bash
cd backend
npm run build
npm run start:prod
```

#### Frontend
```bash
cd frontend
npm run build
npm start
```

#### CMS
```bash
cd cms
npm run build
npm run preview
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Kim Thu** - [GitHub](https://github.com/Kim-Thu)

## 🙏 Acknowledgments

- NestJS Team
- Next.js Team
- React Team
- Prisma Team
- All contributors and users of this project

---

**⭐ Nếu project này hữu ích, đừng quên cho một star nhé!**
