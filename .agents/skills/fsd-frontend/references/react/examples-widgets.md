# Widget Layer Examples (React)

Widgets = large, reusable UI blocks composing features/entities.

## Header Widget

```
src/widgets/header/
├── ui/
│   ├── header.tsx
│   ├── nav-menu.tsx
│   └── user-menu.tsx
├── lib/
│   └── menu-items.ts
└── index.ts
```

```tsx
// src/widgets/header/ui/header.tsx
import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { UserAvatar, useCurrentUser } from '@/entities/user';
import { LogoutButton, useAuthStore } from '@/features/auth';
import { NavMenu } from './nav-menu';
import { UserMenu } from './user-menu';
import { menuItems } from '../lib/menu-items';

export function Header() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: user } = useCurrentUser();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  return (
    <header className="header">
      <div className="header-left">
        <a href="/" className="logo">MyApp</a>
        <NavMenu items={menuItems} />
      </div>

      <div className="header-right">
        {isAuthenticated && user ? (
          <>
            <button onClick={() => setUserMenuOpen(!userMenuOpen)}>
              <UserAvatar user={user} size="sm" />
            </button>
            {userMenuOpen && (
              <UserMenu user={user} onClose={() => setUserMenuOpen(false)} />
            )}
          </>
        ) : (
          <>
            <Button href="/login" variant="ghost">Log In</Button>
            <Button href="/signup">Sign Up</Button>
          </>
        )}
      </div>
    </header>
  );
}
```

```tsx
// src/widgets/header/index.ts
export { Header } from './ui/header';
```

## Product List Widget

```
src/widgets/product-list/
├── ui/
│   └── product-list.tsx
├── model/
│   ├── hooks.ts
│   └── types.ts
└── index.ts
```

```tsx
// src/widgets/product-list/ui/product-list.tsx
import { useState } from 'react';
import { ProductCard, useProducts } from '@/entities/product';
import { AddToCartButton } from '@/features/add-to-cart';

export function ProductList() {
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const { data: products, isLoading, error } = useProducts({ category, sort });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Failed to load products</div>;

  return (
    <section className="product-list">
      <div className="filters">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      <div className="product-grid">
        {products?.map((product) => (
          <div key={product.id} className="product-item">
            <ProductCard product={product} />
            <AddToCartButton productId={product.id} />
          </div>
        ))}
      </div>
    </section>
  );
}
```

```tsx
// src/widgets/product-list/index.ts
export { ProductList } from './ui/product-list';
```

## Sidebar Widget

```tsx
// src/widgets/sidebar/ui/sidebar.tsx
import { useSidebarStore } from '../model/store';
import { sidebarItems } from '../lib/sidebar-items';
import { SidebarItem } from './sidebar-item';

export function Sidebar() {
  const collapsed = useSidebarStore((s) => s.collapsed);

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <nav className="sidebar-nav">
        {sidebarItems.map((item) => (
          <SidebarItem key={item.href} item={item} collapsed={collapsed} />
        ))}
      </nav>
    </aside>
  );
}
```

```tsx
// src/widgets/sidebar/model/store.ts
import { create } from 'zustand';

interface SidebarStore {
  collapsed: boolean;
  toggle: () => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  collapsed: false,
  toggle: () => set((s) => ({ collapsed: !s.collapsed })),
}));
```

```tsx
// src/widgets/sidebar/index.ts
export { Sidebar } from './ui/sidebar';
export { useSidebarStore } from './model/store';
```

## Key Points

- Widgets COMPOSE features and entities
- Self-contained with own state
- Reusable across multiple pages
- Export via public API
