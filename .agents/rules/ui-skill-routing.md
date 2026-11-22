# UI Skill Routing & Governance

This scoped rule governs how AI coding agents select and execute UI/UX-related skills in this repository.

**Core Invariant:** All UI implementations MUST adhere strictly to the visual identity in root `DESIGN.md`, the normative quality standards in `docs/04-standards/ui-quality.md`, and the motion design standards in `docs/04-standards/motion-design.md`. The design and handoff workflow is detailed in `docs/07-guides/ui-design-motion-workflow.md`. Skills are execution aids; they NEVER override repository design authority.

## Bối cảnh và quy trình thiết kế ứng dụng

- Khi làm UI, đọc PRODUCT đúng ứng dụng: [Customer Web](../../apps/customer-web/PRODUCT.md),
  [Customer Mobile](../../apps/customer-mobile/PRODUCT.md), [Organizer Web](../../apps/organizer-web/PRODUCT.md),
  [Organizer Mobile](../../apps/organizer-mobile/PRODUCT.md). Mobile theo iOS/Android, không dùng bối cảnh Web thay thế.
- Với thiết kế mới hoặc thiết kế lại cả bốn ứng dụng Customer/Organizer Web/Mobile, mặc định dựng
  trên Figma để người dùng xem và điều chỉnh trước, rồi mới chuyển thiết kế đã thống nhất thành code.
  Sửa nhỏ trong thiết kế hiện có
  tiếp tục theo phạm vi của tác vụ; không tự mở một vòng thiết kế mới.
- Figma kế thừa `DESIGN.md`; thay đổi bản sắc vẫn cần được thống nhất riêng. Dùng phiên bản/node
  Figma cụ thể của tác vụ làm nguồn đối chiếu khi triển khai.
- Lựa chọn Figma trước không phải `comp-first` bằng ảnh sinh tự động hay `code-first` của Impeccable.
  Giữ `buildPath` chưa đặt cho đến khi người dùng chọn rõ một trong hai giá trị đó; quy trình Figma
  ở đây là mặc định đã xác nhận, không tự chuyển sang sinh ảnh hoặc viết code trực tiếp.

---

## 1. The 4-Stage UI Execution Matrix

Agents MUST activate skills strictly according to the current stage of UI development. Do NOT stack multiple style or design skills simultaneously.

| Stage | Focus Area | Skills / Tools | Output / Milestone |
|---|---|---|---|
| **1. Layout & Identity** | Visual hierarchy, spacing scale, typographic contrast, component structure, design token adherence. | `impeccable`<br/>*or* `design-taste-frontend` | Structured component layout conforming to `DESIGN.md` tokens; zero "AI-slop" or generic templates. |
| **2. Interaction & Mechanics** | Micro-interactions, spring physics, click/press feedback, dropdowns/modals, non-blocking motion. | `emil-design-eng` or `animate` for Web; an available skill matching the chosen framework/platform for native. | High-craft interaction ergonomics, complete states (`Loading`, `Empty`, `Error`, `Success`). |
| **3. Live Verification & a11y** | Rendered UI, reflow, contrast, focus, screen reader and touch targets appropriate to the platform. | Available browser/DevTools tools for Web; simulator/emulator or device tools for native. | Rendered screenshot and task/a11y evidence with platform, size and evidence source stated. |
| **4. Performance Optimization** | Frame budget, layout work and motion measured on the target platform. | `animation-performance` for Web; available profiling tools for the chosen native framework. | Measured results; Core Web Vitals where applicable to Web, device/emulator limits disclosed for native. |

Chỉ dùng skill/công cụ thực sự có trong phiên và phù hợp nền tảng/framework đã chốt.
Không suy một skill Web thành yêu cầu chọn framework Mobile; thiếu công cụ thì ghi phần chưa kiểm chứng.

---

## 2. Invariant Guardrails (Hard Rules)

### 2.1 No Style Stacking (Không cộng dồn phong cách)
- **MUST NOT** activate `design-taste-frontend` and `emil-design-eng` at the same time.
- If both skills seem relevant, resolve by phase: use `design-taste-frontend` first to settle section art direction and layout; close that phase, then use `emil-design-eng` exclusively to polish component interaction physics.

### 2.2 Token Authority (Thẩm quyền Token tối cao)
- Personal taste or stylistic opinions from skill prompts (e.g., Emil Kowalski's personal palette or TasteSkill's curated gallery themes) **MUST NOT** override project colors, typography, border-radius, or surface ladders defined in root `DESIGN.md`.
- If an agent identifies a gap in `DESIGN.md`, propose the token addition explicitly in the PR rather than inventing arbitrary ad-hoc hex codes or CSS values.

### 2.3 Zero Unapproved Dependencies (Không tự kéo thư viện)
- **MUST NOT** install new icon libraries, external fonts, animation packages (e.g., Framer Motion), or CSS frameworks without explicit developer approval in the task Issue.
- Adhere to the existing icon family and styling infrastructure already present in the codebase.

### 2.4 Evidence Before Assertions (Bằng chứng thực tế)
- **MUST NOT** claim "UI looks great", "responsive is clean", or "animation is smooth" based solely on reading code.
- Prior to completing a UI task, agents MUST obtain platform-appropriate runtime evidence as mandated by `docs/04-standards/ui-quality.md`: browser evidence for Web; simulator/emulator or device evidence for native, with the source stated.
- If the target platform's inspection tools are unavailable, the agent MUST explicitly declare which visual/runtime layers remain unverified.
