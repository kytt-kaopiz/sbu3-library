# 📖 SBU3 Library — Kaopiz

Thư viện sách online của Strategic Business Unit 3, Kaopiz.

## Stack
- **Frontend:** React + Vite + TailwindCSS + Zustand
- **Backend:** Vercel Serverless Functions (Node.js)
- **Auth:** Google OAuth 2.0
- **Books:** Project Gutenberg (full text) + Open Library (covers)
- **DB:** JSON files (easy to migrate to MongoDB/Postgres)

## Features
- 📖 Đọc full text từ Project Gutenberg (20 cuốn classic)
- 📥 Mượn sách vật lý (tối đa 3 cuốn, 14 ngày)
- 🔖 Bookmark, Highlight, Ghi chú khi đọc
- 📬 Đặt trước khi sách đang được mượn
- 📊 Dashboard: User + Admin
- 🔐 Đăng nhập bằng Google OAuth

## Setup

### 1. Clone & install
```bash
git clone https://github.com/kytt-kaopiz/-sbu3-library.git
cd -sbu3-library
npm install
```

### 2. Google OAuth Setup
1. Vào [Google Cloud Console](https://console.cloud.google.com)
2. Tạo project mới → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID → Web application
4. Authorized redirect URIs: `https://your-app.vercel.app/api/auth/google`
5. Copy Client ID và Client Secret

### 3. Environment Variables
```bash
cp .env.example .env
# Điền vào .env
```

### 4. Deploy lên Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Thêm env vars trên Vercel Dashboard:
# GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, APP_URL, ADMIN_EMAIL, JWT_SECRET, VITE_GOOGLE_CLIENT_ID
```

### 5. Cập nhật Redirect URI
Sau khi có Vercel URL, cập nhật lại trong Google Console:
`https://your-app.vercel.app/api/auth/google`

## Development
```bash
npm run dev        # Frontend only (port 5173)
vercel dev         # Full stack local (port 3000)
```

## Thêm sách mới
Tìm Gutenberg ID tại [gutenberg.org](https://www.gutenberg.org), sau đó thêm vào `data/books.json`:
```json
{
  "id": 21,
  "gutenbergId": 1234,
  "title": "Tên sách",
  "author": "Tác giả",
  "genre": "Thể loại",
  "year": 1900,
  "rating": 4.5,
  "hasOnline": true,
  "desc": "Mô tả ngắn",
  "coverUrl": "https://covers.openlibrary.org/b/id/COVER_ID-L.jpg"
}
```
