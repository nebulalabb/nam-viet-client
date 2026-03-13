# Cleanup Duplicate Reports Folder

## Vấn đề
Có 2 thư mục report trong `src/views/admin/`:
- `report/` (số ít) - ✅ ĐANG DÙNG - Mới, có API integration
- `reports/` (số nhiều) - ❌ CŨ - UI tĩnh, không dùng

## Xác nhận
Routes đang import từ `report/`:
```javascript
import RevenuePage from '../views/admin/report/RevenuePage'
import SalesReportPage from '../views/admin/report/SalesReportPage'
import InventoryReportPage from '../views/admin/report/InventoryReportPage'
import FinancialReportPage from '../views/admin/report/FinancialReportPage'
```

## Cách xóa an toàn

### Bước 1: Backup (nếu cần)
```bash
# Tạo backup trước khi xóa
cp -r src/views/admin/reports src/views/admin/reports.backup
```

### Bước 2: Xóa thư mục cũ
```bash
# Windows PowerShell
Remove-Item -Recurse -Force src/views/admin/reports

# hoặc Git (để Git track việc xóa)
git rm -r src/views/admin/reports
```

### Bước 3: Commit
```bash
git add .
git commit -m "chore: remove duplicate reports folder (old version)"
git push
```

## Lý do xóa `reports/` (số nhiều)

1. ❌ Không được import trong routes
2. ❌ Chỉ có UI tĩnh, không có API integration
3. ❌ Không có components riêng
4. ❌ Code cũ, không được maintain
5. ✅ Thư mục `report/` mới hơn và đầy đủ tính năng hơn

## Sau khi xóa

Chỉ còn 1 thư mục:
```
src/views/admin/report/  ✅
├── RevenuePage.jsx
├── SalesReportPage.jsx
├── InventoryReportPage.jsx
├── FinancialReportPage.jsx
└── components/
    └── (11 components)
```

## Nếu có lỗi sau khi xóa

Kiểm tra xem có file nào import từ `reports/` không:
```bash
# Tìm imports từ reports/
grep -r "from.*reports/" src/
```

Nếu có, sửa lại thành `report/`
