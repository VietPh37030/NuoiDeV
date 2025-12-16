# 🎮 NuoiDev - Nuôi Dev Sống Sót

> Ứng dụng donation vui nhộn với AI Avatar và hệ thống thanh toán tự động qua SePay

**Live Demo:** https://nuoidev.web.app

![NuoiDev](https://img.shields.io/badge/NuoiDev-Live-brightgreen)
![Firebase](https://img.shields.io/badge/Firebase-Hosting-orange)
![Vercel](https://img.shields.io/badge/Vercel-Webhook-black)

## ✨ Tính năng

- 🤖 **AI Avatar 3D** - Nhân vật dev thông minh với Gemini AI
- 💬 **Chat với Dev** - Giao tiếp real-time với AI
- 🎁 **Hệ thống Item** - Mua & tặng items cho dev (kiểu TikTok)
- 💰 **Thanh toán tự động** - VietQR + SePay Webhook
- 📦 **Inventory System** - Kho đồ cá nhân
- 🔥 **Real-time Updates** - Firestore real-time

## 🏗️ Tech Stack

| Frontend | Backend | Payment |
|----------|---------|---------|
| React + TypeScript | Firebase Firestore | SePay Webhook |
| Vite | Firebase Hosting | VietQR |
| Three.js (3D Avatar) | Vercel Serverless | MB Bank |
| Framer Motion | Gemini AI | |
| TailwindCSS | | |

## 💳 Sơ đồ Thanh toán

```mermaid
sequenceDiagram
    participant User
    participant NuoiDev App
    participant Firestore
    participant SePay
    participant Vercel Webhook
    
    User->>NuoiDev App: 1. Chọn gói nạp coins
    NuoiDev App->>Firestore: 2. Tạo pending transaction (code: NUOID...)
    NuoiDev App->>User: 3. Hiển thị QR VietQR
    User->>SePay: 4. Chuyển khoản với nội dung NUOID...
    SePay->>Vercel Webhook: 5. Bắn webhook (POST /api/sepay-webhook)
    Vercel Webhook->>Firestore: 6. Tìm pending transaction
    Vercel Webhook->>Firestore: 7. Cập nhật status = completed
    Vercel Webhook->>Firestore: 8. Cộng coins cho user
    NuoiDev App->>Firestore: 9. Poll trạng thái (mỗi 3s)
    Firestore->>NuoiDev App: 10. Status = completed
    NuoiDev App->>User: 11. Thông báo thành công! 🎉
```

## 🎯 Luồng Inventory & Donation

```mermaid
flowchart LR
    A[💰 Nạp Coins] --> B[🛒 Mua Item ở Store]
    B --> C[📦 Lưu vào Inventory]
    C --> D[🎁 Tặng Item cho Dev]
    D --> E[🤖 AI Phản hồi]
    D --> F[📊 Cập nhật Firestore]
    F --> G[📺 Hiển thị ở Recent Donations]
```

## 🚀 Cài đặt & Chạy

### 1. Clone repo

```bash
git clone https://github.com/VietPh37030/NuoiDeV.git
cd NuoiDeV
npm install
```

### 2. Cấu hình Firebase

Tạo file `.env` với nội dung:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

### 3. Chạy development

```bash
npm run dev
```

### 4. Build & Deploy

```bash
npm run build
firebase deploy --only hosting
```

## 🔧 Cấu hình SePay Webhook

### Webhook URL
```
https://nuoidev-webhook.vercel.app/api/sepay-webhook
```

### Cấu hình trong SePay

| Trường | Giá trị |
|--------|---------|
| Bắn WebHooks khi | Có tiền vào |
| Tài khoản | MBBank - 0378117461 |
| Bỏ qua nếu không có Code | Có |
| Là WebHooks xác thực thanh toán | Đúng |
| Kiểu chứng thực | Không cần |
| Content-Type | application/json |

### Cấu trúc mã thanh toán

- **Tiền tố:** `NUOID`
- **Độ dài:** 3-15 ký tự
- **Kiểu:** Số nguyên

## 📁 Cấu trúc Project

```
NuoiDev/
├── src/
│   ├── components/       # React components
│   │   ├── IanAvatar.tsx      # 3D Avatar với Three.js
│   │   ├── DonateModal.tsx    # Modal tặng quà
│   │   └── TopUpModal.tsx     # Modal nạp tiền
│   ├── hooks/            # Custom hooks
│   │   ├── useInventory.ts    # Quản lý kho đồ
│   │   └── useRecentDonations.ts
│   ├── pages/            # Các trang
│   └── lib/              # Utils & configs
│       ├── gemini.ts          # Gemini AI integration
│       └── firebase.ts        # Firebase config
├── nuoidev-webhook/      # Vercel webhook (submodule)
│   └── api/
│       └── sepay-webhook.js
├── public/models/        # 3D models & animations
└── firebase.json         # Firebase config
```

## 🎮 Items trong Store

| Item | Giá | Emoji | Mô tả |
|------|-----|-------|-------|
| Sextoy | 1 coin | 🔞 | Quà 18+ cho dev (joke) |
| Mì Gói | 5 coins | 🍜 | Món ăn cứu đói |
| Trà Sữa | 15 coins | 🧋 | Năng lượng code |
| Card Game | 50 coins | 🎴 | Giải trí sau giờ code |
| Server | 100 coins | 💻 | Host project |
| Tiền Cho Gái | 200 coins | 💸 | Để dev có người yêu 😂 |

## 👨‍💻 Tác giả

**Phạm Việt Anh (Ian Phạm)**

- GitHub: [@VietPh37030](https://github.com/VietPh37030)
- Live App: https://nuoidev.web.app

## 📄 License

MIT License - Tự do sử dụng, donate cho dev nếu thấy hay! 💪
