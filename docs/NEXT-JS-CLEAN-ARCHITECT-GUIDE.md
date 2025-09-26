# 📘 Next.js Clean Architecture Guide

## 1. Triết lý kiến trúc
- **Tách biệt concern**: UI, logic, dữ liệu không trộn lẫn.  
- **Tái sử dụng được**: Một module viết ra có thể tái dùng ở nơi khác.  
- **Dễ mở rộng & bảo trì**: Khi thêm tính năng, chỉ cần thêm module, không phá vỡ cái cũ.  

---

## Project Structure with Example

```
📁 src/
├── 📁 app/                  # Next.js App Router (pages only)
│   ├── page.tsx             # Example: Home Page
│   └── products/
│       └── [id]/page.tsx    # Example: Product Detail Page
├── 📁 shared/               # Shared components, utils, types
│   ├── 📁 ui/
│   │   └── Button.tsx
│   ├── 📁 hooks/
│   │   └── useDebounce.ts
│   ├── 📁 utils/
│   │   └── formatPrice.ts
│   └── 📁 types/
│       └── product.ts
├── 📁 entities/             # Domain layer (models + services)
│   ├── 📁 products/
│   │   ├── product.ts
│   │   └── productService.ts
│   └── 📁 auth/
│       └── auth.ts
├── 📁 features/             # Feature modules (UI + Logic)
│   ├── 📁 auth/
│   │   └── LoginForm.tsx
│   ├── 📁 products/
│   │   └── ProductList.tsx
│   └── 📁 orders/
│       └── CheckoutForm.tsx
├── 📁 core/                 # Infrastructure layer
│   ├── 📁 config/
│   │   └── routes.ts
│   ├── 📁 lib/
│   │   └── apiClient.ts
│   └── 📁 providers/
│       └── ThemeProvider.tsx
└── 📁 widgets/              # Composite components
    ├── 📁 layout/
    │   ├── Header.tsx
    │   └── Footer.tsx
    └── 📁 feedback/
        └── Toast.tsx
```

---

## 2. Thư mục chính

### 📁 `src/app`
- Next.js App Router, chứa **các route/page**.
- **Chỉ viết UI entry-point**, không để logic nặng ở đây.  
- Ví dụ:
  ```
  /app
    /products
      page.tsx   → Trang danh sách sản phẩm
      [id]/
        page.tsx → Trang chi tiết sản phẩm
    /auth
      login/page.tsx
      register/page.tsx
  ```

### 📁 `shared`
- Chứa **tài nguyên chung** cho toàn dự án.
- **Sub-folder:**
  - `ui/` → button, input, modal, card… (chỉ UI, không logic).  
  - `hooks/` → hooks dùng chung (`useDebounce`, `useMediaQuery`).  
  - `utils/` → hàm tiện ích (`formatPrice`, `dateFormat`).  
  - `types/` → định nghĩa type/interface dùng chung.

👉 Mục tiêu: không phụ thuộc vào domain cụ thể.

---

### 📁 `entities`
- Đại diện cho **domain entity** (đối tượng cốt lõi trong hệ thống).
- Mỗi entity = một thư mục.  
- Ví dụ: `products`, `auth`, `orders`, `users`.
- **Bên trong**:
  - `model.ts` → định nghĩa type/model (giống DTO map với API).  
  - `api.ts` → gọi API cho entity này (fetcher).  
  - `mapper.ts` → chuyển đổi từ API response sang model chuẩn.  
  - `index.ts` → barrel file, export public API của entity.

👉 Mục tiêu: gom toàn bộ logic liên quan tới entity.

---

### 📁 `features`
- Chứa **tính năng hoàn chỉnh** (ghép nhiều entities).  
- Ví dụ: `auth` (login form + gọi API), `products` (product list + filter), `checkout`.
- **Bên trong**:
  - Component UI đặc thù cho feature (`LoginForm.tsx`, `ProductFilter.tsx`).  
  - Hooks logic (`useLogin.ts`, `useCheckout.ts`).  
  - Có thể import từ `entities` để xử lý dữ liệu.

👉 Mục tiêu: kết hợp UI + logic thành một “feature có thể xài được ngay”.

---

### 📁 `core`
- Layer hạ tầng (infrastructure).  
- **Sub-folder:**
  - `config/` → cấu hình (env, routes, constants).  
  - `lib/` → wrapper cho library ngoài (axios client, fetch wrapper).  
  - `providers/` → App-level provider (theme, Zustand store, query client).  

👉 Mục tiêu: đóng gói third-party dependency, dễ thay thế khi đổi lib.

---

### 📁 `widgets`
- Composite component, ghép nhiều feature lại.  
- Ví dụ: `Header`, `Footer`, `Sidebar`, `ProductCarousel`, `CartDrawer`.  
- Đây là UI cấp cao, sử dụng `features` + `shared/ui`.

---

## 3. Dòng chảy dữ liệu

1. **Page (`app/`)** → gọi đến **Feature (`features/`)**  
2. Feature sử dụng **Entity (`entities/`)** để fetch và xử lý dữ liệu  
3. Entity sử dụng **Core (`core/lib/apiClient.ts`)** để gọi API  
4. Data trả về → render bằng **Shared/UI** hoặc **Widget**

---

## 4. Ví dụ minh họa

**entities/products/model.ts**
```ts
export interface Product {
  id: string
  name: string
  price: number
  imageUrl: string
}
```

**entities/products/api.ts**
```ts
import { apiClient } from "@/core/lib/apiClient"
import { Product } from "./model"

export async function fetchProducts(): Promise<Product[]> {
  const res = await apiClient.get("/products")
  return res.data
}
```

**entities/products/index.ts**
```ts
export * from "./model"
export * from "./api"
```

**features/products/ProductList.tsx**
```tsx
import { useEffect, useState } from "react"
import { fetchProducts, Product } from "@/entities/products"

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    fetchProducts().then(setProducts)
  }, [])

  return (
    <div>
      {products.map(p => (
        <div key={p.id}>{p.name} - ${p.price}</div>
      ))}
    </div>
  )
}
```

**app/products/page.tsx**
```tsx
import { ProductList } from "@/features/products/ProductList"

export default function ProductsPage() {
  return <ProductList />
}
```

---

## 5. Lời khuyên
- `shared/` và `core/` nên được giữ **tối giản**.  
- `entities/` là nơi bạn map API → model chuẩn.  
- `features/` là nơi kết hợp UI + logic.  
- `widgets/` chỉ là “xếp lego”, không viết logic nặng.  
