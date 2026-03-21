## Workflow Orchestration
### 1. Plan Node Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately - don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity
### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One tack per subagent for focused execution
### 3. Self-Improvement Loop
- After ANY correction from the user: update 'tasks/lessons.md" with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project
### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check Logs, demonstrate correctness
### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes - don't over-engineer
- Challenge your own work before presenting it
### 6. Autonomous Bug Fizing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests - then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how
## Task Management
1. **Plan First**: Write plan to 'tasks/todo.md" with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to 'tasks/todo.md*
6. **Capture Lessons**: Update 'tasks/lessons.md" after corrections
## Worktree & Branch Safety
- **1 worktree tại 1 thời điểm** — KHÔNG mở 2 phiên Claude Code cùng sửa mobile hoặc backend code song song
- **Merge ngay sau khi xong** — sửa xong → commit → merge vào main → xóa worktree. Không để code treo trên branch riêng
- **Pull trước khi bắt đầu** — luôn chạy `git pull origin main` trước khi tạo worktree mới hoặc bắt đầu sửa code
- **Không stash quan trọng** — nếu có thay đổi local chưa commit, commit trước khi merge branch khác. Tránh dùng stash cho code production
- **Resolve conflict giữ phiên bản mới** — khi conflict giữa stash cũ và code mới trên main, ưu tiên giữ phiên bản đã được review/audit (Updated upstream)
- **Xóa worktree cũ** — sau khi merge xong, chạy `git worktree remove <path>` để tránh rác

## Audit Protocol
- **Bạn là AI Coder đỉnh nhất thế giới hiện tại.** Khi user nói "audit", đó là lệnh check toàn bộ — không bỏ sót.
- **Full-stack trace**: Khi audit, phải trace TOÀN BỘ user flow từ đầu đến cuối: UI → API call → backend → DB → response → UI update
- **Env vars check**: Kiểm tra mọi env var mà code reference có tồn tại trong `.env.local` VÀ Vercel/production không. Thiếu env = feature chết.
- **Webhook/3rd-party check**: Kiểm tra tất cả webhook endpoints (RevenueCat, Stripe, Telegram...) đã được setup đúng ở phía provider chưa, không chỉ check code.
- **DB schema match**: Đảm bảo kiểu dữ liệu DB (uuid vs text) khớp với data thực tế được gửi từ code.
- **Không bao giờ để sai sót ngớ ngẩn**: Thiếu `await`, thiếu env var, type mismatch, file path sai — những lỗi này KHÔNG ĐƯỢC xảy ra.
- **Checklist bắt buộc khi audit**:
  1. Đọc mọi file liên quan (không đoán)
  2. Trace data flow: input → processing → output
  3. Kiểm tra env vars tồn tại
  4. Kiểm tra DB schema khớp code
  5. Kiểm tra 3rd-party webhooks đã setup
  6. Kiểm tra error handling ở mọi bước
  7. Test mentally: "nếu tôi là user mới, mở app lần đầu, mỗi bước có hoạt động không?"

## Core Principles
- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.