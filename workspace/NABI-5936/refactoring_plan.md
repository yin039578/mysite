# 呼叫鏈重構計劃

## 📋 規劃原則

1. **從簡單開始**: 先處理只有 1 處違規的模組
2. **一次處理完一個模組**: 確保該模組所有違規都解決
3. **優先處理 Task 違規**: Task -> Action 優先於 Service -> Action
4. **按模組完整性**: 同一個模組的所有違規一起處理

## 🎯 總體狀況

- **總違規數**: 72 處
- **涉及模組數**: 38 個
- **Task 相關違規**: 28 處
- **Service 相關違規**: 10 處
- **Action 相關違規**: 33 處
- **逆向呼叫**: 1 處

---

## 📝 Phase 1: 簡單模組 - 僅 Task 違規 (1 處)

優先處理只有單一 Task 違規的模組，建立重構模式。

### 1.1 api_event_log (1 處) ⭐ 最簡單
- **違規類型**: Task -> 同模組 Action
- **檔案**: `/api_event_log/tasks.py:10`
- **引用**: `from .actions import record_trade_event_log_batch, record_trade_event_log_field_batch`
- **修復方向**: 將批次處理邏輯移入 task
- **預估時間**: 30 分鐘
- **異動影響**:所有交易相關log，做新增/移除購物車log測試最快

### 1.2 api_activity (1 處)
- **違規類型**: Task -> 同模組 Action
- **檔案**: `/api_activity/tasks.py:13`
- **引用**: `from .actions import (...)`
- **修復方向**: 將 action 邏輯移入 task 或抽取到 service
- **預估時間**: 30 分鐘
- **異動影響**:
  - PUT /user/fill_in_log_pid > 已下線
  - POST /post/add_post

### 1.3 api_classroom (1 處)
- **違規類型**: Task -> 同模組 Action
- **檔案**: `/api_classroom/tasks.py:7`
- **引用**: `from api_classroom import actions`
- **修復方向**: task 改呼叫 service 或直接實作
- **預估時間**: 30 分鐘
- **異動影響**:
  - 
### 1.4 services/teams (1 處) ⚠️ 特殊
- **違規類型**: Task -> 同模組 Action
- **檔案**: `/services/teams/tasks.py:5`
- **引用**: `from .actions import notify_internal_error_to_teams`
- **修復方向**: 考慮合併或重新命名（因為是共用工具層）
- **預估時間**: 20 分鐘

### 1.5 api_purchase/order (1 處)
- **違規類型**: Task -> 同模組 Action
- **檔案**: `/api_purchase/order/tasks.py:11`
- **引用**: `from api_purchase.order import actions, service`
- **修復方向**: task 只呼叫 service
- **預估時間**: 30 分鐘

### 1.6 api_purchase/course (1 處)
- **違規類型**: Task -> 跨模組 Action
- **檔案**: `/api_purchase/course/tasks.py:7`
- **引用**: `from api_mail.actions import process_send_sync_course_resume`
- **修復方向**: 改呼叫 api_mail 的 service
- **預估時間**: 30 分鐘

### 1.7 api_ap/transfer (1 處)
- **違規類型**: Task -> 同模組 Action
- **檔案**: `/api_ap/transfer/tasks.py:10`
- **引用**: `from api_ap.transfer import actions`
- **修復方向**: task 改呼叫 service
- **預估時間**: 30 分鐘

### 1.8 api_ap/imports (1 處)
- **違規類型**: Task -> 同模組 Action
- **檔案**: `/api_ap/imports/tasks.py:8`
- **引用**: `from api_ap.imports import actions`
- **修復方向**: task 改呼叫 service
- **預估時間**: 30 分鐘

**Phase 1 小計**: 8 個模組, 8 處違規, 預估 4 小時

---

## 📝 Phase 2: 簡單模組 - 僅 Action/Service 違規 (1 處)

處理只有單一 Action 或 Service 違規的模組。

### 2.1 api_social (1 處)
- **違規類型**: Action -> 其他模組 Action
- **檔案**: `/api_social/actions.py:18`
- **引用**: `from api_user.actions import get_user`
- **修復方向**: 改呼叫 api_user 的 service
- **預估時間**: 30 分鐘
- **前置需求**: api_user 需先有 get_user 的 service

### 2.2 api_supplier_crm (1 處)
- **違規類型**: Action -> 其他模組 Action
- **檔案**: `/api_supplier_crm/actions.py:24`
- **引用**: `from api_external.actions import exteral_certificate_create`
- **修復方向**: 改呼叫 api_external 的 service
- **預估時間**: 30 分鐘

### 2.3 api_certify (1 處)
- **違規類型**: Action -> 其他模組 Action
- **檔案**: `/api_certify/actions.py:41`
- **引用**: `from api_classroom.actions import get_user_favorite_rooms`
- **修復方向**: 改呼叫 api_classroom 的 service
- **預估時間**: 30 分鐘

### 2.4 api_webhook (1 處)
- **違規類型**: Service -> Action
- **檔案**: `/api_webhook/service.py:26`
- **引用**: `from api_purchase.providerapi import actions as providerapi_actions`
- **修復方向**: 將 providerapi.actions 提升為 service
- **預估時間**: 30 分鐘

### 2.5 api_notify (1 處)
- **違規類型**: Action -> 其他模組 Action
- **檔案**: `/api_notify/actions.py:15`
- **引用**: `from api_user.actions import get_user`
- **修復方向**: 改呼叫 api_user 的 service
- **預估時間**: 30 分鐘

### 2.6 api_comment (1 處)
- **違規類型**: Action -> 其他模組 Action
- **檔案**: `/api_comment/actions.py:22`
- **引用**: `from api_user.actions import get_user`
- **修復方向**: 改呼叫 api_user 的 service
- **預估時間**: 30 分鐘

### 2.7 api_comment/social (1 處)
- **違規類型**: Action -> 其他模組 Action
- **檔案**: `/api_comment/social/actions.py:12`
- **引用**: `from api_user.actions import get_user`
- **修復方向**: 改呼叫 api_user 的 service
- **預估時間**: 30 分鐘

### 2.8 api_certify/out (1 處)
- **違規類型**: Action -> 其他模組 Action
- **檔案**: `/api_certify/out/actions.py:14`
- **引用**: `from api_user.actions import get_user`
- **修復方向**: 改呼叫 api_user 的 service
- **預估時間**: 30 分鐘

### 2.9 api_apim/course (1 處)
- **違規類型**: Action -> 其他模組 Action
- **檔案**: `/api_apim/course/actions.py:17`
- **引用**: `from api_course.actions import get_all_course`
- **修復方向**: 改呼叫 api_course 的 service
- **預估時間**: 30 分鐘

### 2.10 api_apim/jobcat_classroom (1 處)
- **違規類型**: Action -> 其他模組 Action
- **檔案**: `/api_apim/jobcat_classroom/actions.py:13`
- **引用**: `from api_jobcat_classroom.actions import jobcat_classroom_detail`
- **修復方向**: 改呼叫 api_jobcat_classroom 的 service
- **預估時間**: 30 分鐘

### 2.11 api_crm/misc (1 處)
- **違規類型**: Action -> 其他模組 Action
- **檔案**: `/api_crm/misc/actions.py:12`
- **引用**: `from api_login.actions import check_blacklist`
- **修復方向**: 改呼叫 api_login 的 service
- **預估時間**: 30 分鐘

### 2.12 api_crm/user (1 處)
- **違規類型**: Action -> 其他模組 Action
- **檔案**: `/api_crm/user/actions.py:20`
- **引用**: `from api_user.actions import get_user`
- **修復方向**: 改呼叫 api_user 的 service
- **預估時間**: 30 分鐘

### 2.13 api_crm/ability (1 處)
- **違規類型**: Action -> 其他模組 Action
- **檔案**: `/api_crm/ability/actions.py:15`
- **引用**: `from api_ability.actions import get_ability_list`
- **修復方向**: 改呼叫 api_ability 的 service
- **預估時間**: 30 分鐘

### 2.14 api_chatbot (1 處)
- **違規類型**: Action -> 其他模組 Action
- **檔案**: `/api_chatbot/actions.py:19`
- **引用**: `from api_user.actions import get_user`
- **修復方向**: 改呼叫 api_user 的 service
- **預估時間**: 30 分鐘

**Phase 2 小計**: 14 個模組, 14 處違規, 預估 7 小時

---

## 📝 Phase 3: 中等模組 - 2-3 處違規

處理有 2-3 處違規的模組。

### 3.1 api_mail/mail_tasks.py (2 處)
- **違規類型**: Task -> 跨模組 Action (2 處)
- **檔案**: `/api_mail/mail_tasks.py`
  - L23: `from api_activity.actions import activity_hot_list`
  - L24: `from api_course.actions import get_center_course_hot`
- **修復方向**: 改呼叫對應模組的 service
- **預估時間**: 45 分鐘

### 3.2 api_crm/classroom (2 處)
- **違規類型**: Task -> 跨模組 Action (1) + Action -> 跨模組 Action (1)
- **檔案**: 
  - `/api_crm/classroom/tasks.py:5` - `from api_crm.activity.actions import ...`
  - `/api_crm/classroom/actions.py:18` - `from api_classroom.actions import ...`
- **修復方向**: 建立或使用 service 中間層
- **預估時間**: 1 小時

### 3.3 api_ap/activity (2 處)
- **違規類型**: Task -> Action (1) + Action -> Action (1)
- **檔案**:
  - `/api_ap/activity/tasks.py:7` - `from api_ap.activity import actions`
  - `/api_ap/activity/actions.py:14` - `from api_activity.actions import ...`
- **修復方向**: 重構為呼叫 service
- **預估時間**: 1 小時

### 3.4 api_user (2 處)
- **違規類型**: Action -> 跨模組 Action (2)
- **檔案**: `/api_user/actions.py`
  - L11: `from api_classroom.actions import ...`
  - L17: `from api_course.actions import ...`
- **修復方向**: 改呼叫對應的 service
- **預估時間**: 45 分鐘

### 3.5 api_crm/activity (2 處)
- **違規類型**: Action -> 跨模組 Action (2)
- **檔案**: `/api_crm/activity/actions.py`
  - L15: `from api_activity.actions import ...`
  - L18: `from api_classroom.actions import ...`
- **修復方向**: 改呼叫對應的 service
- **預估時間**: 45 分鐘

### 3.6 api_crm/top10 (2 處)
- **違規類型**: Action -> 跨模組 Action (2)
- **檔案**: `/api_crm/top10/actions.py`
  - L14: `from api_activity.actions import ...`
  - L16: `from api_course.actions import ...`
- **修復方向**: 改呼叫對應的 service
- **預估時間**: 45 分鐘

### 3.7 api_ap/cache (3 處)
- **違規類型**: Task -> Action (1) + Action -> Action (2)
- **檔案**:
  - `/api_ap/cache/tasks.py:7` - Task 違規
  - `/api_ap/cache/actions.py` - 2 處 Action 違規
- **修復方向**: 重構為使用 service
- **預估時間**: 1.5 小時

### 3.8 api_ap/top10 (3 處)
- **違規類型**: Task -> Action (1) + Action -> Action (2)
- **檔案**:
  - `/api_ap/top10/tasks.py:7` - Task 違規
  - `/api_ap/top10/actions.py` - 2 處 Action 違規
- **修復方向**: 重構為使用 service
- **預估時間**: 1.5 小時

### 3.9 api_ap/stats (3 處)
- **違規類型**: Task -> Action (3)
- **檔案**: `/api_ap/stats/tasks.py`
  - L9: `from api_ap.recommend import actions`
  - L10: `from api_ap.stats import actions`
  - L11: `from api_ap.stats.actions import ...`
- **修復方向**: 建立 api_ap/stats/service.py
- **預估時間**: 1.5 小時

### 3.10 api_external (3 處)
- **違規類型**: Action -> 跨模組 Action (3)
- **檔案**: `/api_external/actions.py`
  - L19: `from api_certify.actions import ...`
  - L21: `from api_classroom.actions import ...`
  - L23: `from api_course.actions import ...`
- **修復方向**: 改呼叫對應的 service
- **預估時間**: 1.5 小時

### 3.11 services/profile (3 處)
- **違規類型**: Action -> 跨模組 Action (3)
- **檔案**: 多個檔案
- **修復方向**: 重構為 service 呼叫
- **預估時間**: 1.5 小時

**Phase 3 小計**: 11 個模組, 26 處違規, 預估 12 小時

---

## 📝 Phase 4: 複雜模組 - 4+ 處違規

處理複雜度較高的模組。

### 4.1 api_mail (4 處)
- **違規類型**: 
  - Task -> Action (1)
  - Service -> Action (1)
  - Action -> Action (2)
- **檔案**: 多個檔案
- **修復方向**: 大規模重構，建立統一 service 層
- **預估時間**: 3 小時

### 4.2 api_ap/purchase (4 處)
- **違規類型**: Task -> Action (4) ⚠️ 金流敏感
- **檔案**: `/api_ap/purchase/tasks.py`
- **修復方向**: 建立 service 中間層，謹慎處理
- **預估時間**: 3 小時

### 4.3 api_ap/sync (4 處)
- **違規類型**: 
  - Task -> Action (1)
  - Action -> Action (2)
  - Action -> Task 逆向 (1) ⚠️
- **檔案**: 多個檔案
- **修復方向**: 複雜重構，需處理逆向呼叫
- **預估時間**: 3 小時

### 4.4 api_search (4 處)
- **違規類型**: Action -> 跨模組 Action (4)
- **檔案**: `/api_search/actions.py`
  - 依賴 api_activity, api_certify, api_classroom, api_course
- **修復方向**: 改呼叫各模組的 service
- **預估時間**: 2 小時

### 4.5 api_ap/mail (7 處) ⚠️ 最複雜
- **違規類型**:
  - Task -> Action (1)
  - Service -> Action (6)
- **檔案**: `/api_ap/mail/service.py` (6 處違規)
- **修復方向**: 大規模重構，需要設計資料聚合策略
- **預估時間**: 4 小時

**Phase 4 小計**: 5 個模組, 23 處違規, 預估 15 小時

---

## 📊 總結

### 處理順序建議

根據你的需求（從簡單開始 + 優先 Task + 一次處理完一個模組），建議順序：

**Week 1: Phase 1 (8 個模組)**
1. api_event_log (最簡單)
2. api_activity
3. api_classroom
4. services/teams (特殊案例)
5. api_purchase/order
6. api_purchase/course
7. api_ap/transfer
8. api_ap/imports

**Week 2: Phase 2 前半 (7 個模組)**
9. api_social
10. api_supplier_crm
11. api_certify
12. api_webhook
13. api_notify
14. api_comment
15. api_comment/social

**Week 3: Phase 2 後半 + Phase 3 前段 (10 個模組)**
16. api_certify/out
17. api_apim/course
18. api_apim/jobcat_classroom
19. api_crm/misc
20. api_crm/user
21. api_crm/ability
22. api_chatbot
23. api_mail/mail_tasks.py (2 處)
24. api_crm/classroom (2 處)
25. api_ap/activity (2 處)

**Week 4: Phase 3 後段 (8 個模組)**
26. api_user (2 處)
27. api_crm/activity (2 處)
28. api_crm/top10 (2 處)
29. api_ap/cache (3 處)
30. api_ap/top10 (3 處)
31. api_ap/stats (3 處)
32. api_external (3 處)
33. services/profile (3 處)

**Week 5-6: Phase 4 (5 個模組，最複雜)**
34. api_search (4 處)
35. api_mail (4 處)
36. api_ap/purchase (4 處，金流敏感)
37. api_ap/sync (4 處，有逆向呼叫)
38. api_ap/mail (7 處，最複雜)

### 總工作量估算

- **Phase 1**: 4 小時
- **Phase 2**: 7 小時
- **Phase 3**: 12 小時
- **Phase 4**: 15 小時
- **總計**: 約 38 小時

### 關鍵依賴項

以下模組被多處引用，建議在 Phase 2 開始前優先建立 service：

1. **api_user.service** - 提供 `get_user` (被 8+ 處引用)
2. **api_classroom.service** - 提供 room 相關功能
3. **api_activity.service** - 提供 activity 相關功能
4. **api_course.service** - 提供 course 相關功能
5. **api_mail.service** - 提供郵件相關功能

---

## ✅ 立即開始：前三個模組

建議從以下三個模組開始練習：

### 1. api_event_log ⭐ 
- **理由**: 最獨立，邏輯簡單，不依賴其他模組
- **學習重點**: Task 如何不呼叫 Action

### 2. api_classroom
- **理由**: Task 違規，邏輯清晰，有現成 service
- **學習重點**: Task 改呼叫 service 的 pattern

### 3. api_activity
- **理由**: 需要建立 service，建立後續參考模式
- **學習重點**: 如何將 action 邏輯抽取到 service

這三個完成後，你就能建立明確的重構 pattern 供後續 35 個模組參考。

---

## 🔍 檢查清單（每個模組完成後）

- [ ] 所有違規的 import 已移除
- [ ] 新的 service 函式已建立（如需要）
- [ ] Task/Action 已改呼叫 service
- [ ] 執行 `ruff check` 無錯誤
- [ ] 相關功能測試通過
- [ ] 提交 commit 並記錄變更

