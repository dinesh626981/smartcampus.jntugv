# Google Material 3 Design System Specification
**Project:** Smart College Issue Reporting & Management System  
**Visual Language:** Google Material 3 / Google Account Style  
**Target Environment:** React 18, Vite, Tailwind CSS v3, Chart.js  

---

## 1. Design Philosophy & Google Material 3 Identity

The user interface follows the modern **Google Material 3 (M3) and Google Account** visual identity:
1. **Light & Airy Typography:**
   - Primary Font: **Figtree** / Google Sans (`font-sans`), weights 400 (regular), 500 (medium), and 600 (semibold).
   - Monospace: **Roboto Mono** (`font-mono`) for ticket numbers, dates, tokens, and technical telemetry.
   - **Headings:** Always use regular or medium weights (400–500). Sentence case everywhere; avoid uppercase tracking and all-caps labels.
   - **Type Scale:** Display (45–57px), Headline Large (32px/400), Headline Medium (28px), Title Large (22px), Body Large (16px), Body Medium (14px), Label Medium (12px).
2. **Soft Rounded Surfaces & Elevation:**
   - **Dialogs & Modals:** 28px radius (`rounded-dialog` / `rounded-[28px]`), tonal surface elevation.
   - **Cards & Containers:** 16px radius (`rounded-card` / `rounded-2xl`), outlined with hairline border (`var(--md-sys-color-outline-variant)`).
   - **Buttons:** 40px height, full pill shape (`rounded-full`), sentence case text.
   - **Input Fields:** 56px height, 4px radius (`rounded-input` / `rounded-[4px]`), floating animated labels.
   - **Chips & Badges:** 8px radius (`rounded-chip` / `rounded-[8px]`), tonal backgrounds.
3. **Google Blue Actions & Floating Labels:**
   - Primary actions feature Google Blue (`#0B57D0`). Secondary actions are text buttons (`variant="text"`) with blue font and subtle hover overlays (`hover:bg-[#0B57D0]/0.08`).
   - Floating-label inputs animate up smoothly into the notch/border when focused or containing text.

---

## 2. Color Palette & Material 3 Semantic Tokens

All surfaces, borders, and typography utilize CSS variables mapped to `:root` (Light mode) and `[data-theme="dark"]` / `prefers-color-scheme`:

| Token | Light Theme | Dark Theme | Purpose |
| :--- | :--- | :--- | :--- |
| `--md-sys-color-primary` | `#0B57D0` | `#A8C7FA` | Primary buttons, active indicators, brand accent |
| `--md-sys-color-on-primary` | `#FFFFFF` | `#062E6F` | Text on primary surfaces |
| `--md-sys-color-primary-container` | `#D3E3FD` | `#0842A0` | Active navigation pills, badge highlights |
| `--md-sys-color-on-primary-container` | `#041E49` | `#D3E3FD` | Text on primary container |
| `--md-sys-color-surface` | `#FFFFFF` | `#1E1F20` | Card interiors, popup menus, input backgrounds |
| `--md-sys-color-surface-container` | `#F8FAFD` | `#2A2B2D` | Page background, cards, table striping |
| `--md-sys-color-surface-container-high` | `#EDF2F9` | `#333538` | Hover states, icon backgrounds, avatar circles |
| `--md-sys-color-outline` | `#747775` | `#8E918F` | Focused borders, active controls |
| `--md-sys-color-outline-variant` | `#C4C7C5` | `#444746` | Hairline dividers, card outlines, resting borders |
| `--md-sys-color-on-surface` | `#1F1F1F` | `#E3E3E3` | Main headings, primary body copy |
| `--md-sys-color-on-surface-variant` | `#444746` | `#C4C7C5` | Supporting labels, subtitles, placeholder text |
| `--md-sys-color-error` | `#BA1A1A` | `#FFB4AB` | Error banners, validation messages, destructive buttons |
| `--md-sys-color-error-container` | `#FFDAD6` | `#93000A` | Error badge containers |

---

## 3. UI Component Library (`src/components/ui/*`)

| Component | File Path | Shape & Material 3 Characteristics |
| :--- | :--- | :--- |
| `TextField` / `Input` | `components/ui/TextField.jsx`, `Input.jsx` | 56px height, 4px radius, floating animated label on focus/filled, error/helper text, character counter. |
| `Select` | `components/ui/Select.jsx` | 56px height, 4px radius, floating label, custom Google chevron icon. |
| `Textarea` | `components/ui/Textarea.jsx` | Outlined multi-line field with floating label and character counter. |
| `Button` | `components/ui/Button.jsx` | 40px height, `rounded-full` pill shape, variants: `filled`, `tonal`, `outlined`, `text`, `danger`. |
| `Dialog` / `Modal` | `components/ui/Dialog.jsx`, `Modal.jsx` | 28px radius (`rounded-dialog`), tonal surface, headline-small title, body-large subtitle, right-aligned text buttons, scrim `rgba(0,0,0,0.32)`. |
| `Chip` & `Badge` | `components/ui/Chip.jsx`, `Badge.jsx` | 8px radius (`rounded-chip`), tonal colors. Includes `StatusBadge` & `PriorityBadge`. |
| `Tabs` | `components/ui/Tabs.jsx` | Material 3 underline tabs with 3px primary indicator. |
| `Card` | `components/ui/Card.jsx` | 16px radius (`rounded-card`), outline-variant hairline border. |
| `PageHeader` | `components/ui/PageHeader.jsx` | Headline Large (32px, 400 weight), body-medium/large subtitle, breadcrumb slot, and action slot. |
| `DataTable` | `components/ui/DataTable.jsx` | 52px row height, no outer border, 1px row dividers, empty state integration. |
| `StatCard` | `components/ui/StatCard.jsx` | 16px radius card, 32px regular metric, label, and tonal circular icon container. |
| `Topbar` & `Navbar` | `components/ui/Topbar.jsx`, `components/Navbar.jsx` | 64px height, "Smart College" in Figtree 500 at 22px, avatar menu, notification bell. |
| `Sidebar` | `components/ui/Sidebar.jsx` | 72 width (18rem) navigation drawer with pill-shaped active items (`bg-[var(--md-sys-color-primary-container)]`, `rounded-full`). |
| `Footer` | `components/Footer.jsx` | M3 surface-container layout with Figtree typography and pill navigation links. |
| `Chatbot` | `components/Chatbot.jsx` | 56px FAB, 16px card, suggestion chips, clean input. |
| `ToastContainer` | `src/index.css` | Material 3 snackbar styling: dark surface (`#303030`), 4px radius, white typography. |

---

## 4. Chart.js & Analytics Styling Standard

Administrative and operational analytics charts adhere to Material 3 principles:
- **Typography:** Font family set to `Figtree, 'Google Sans', system-ui, sans-serif`, weight 400–500.
- **Palette:** Google Blue `#0B57D0`, Teal `#007A6C`, Amber `#E37400`, Coral `#D93025`.
- **Grid Lines:** Hairline borders using `rgba(0, 0, 0, 0.06)`.
- **Tooltips:** 8px rounded card with tonal surface background and crisp typography.

---

## 5. Page Inventory & Redesign Summary

1. **Public & Informational:**
   - `Landing.jsx`: Hero display typography (45/52), 4-stage workflow chips, 16px role entry cards, pill buttons.
   - `About.jsx`: Headline Large (32px), 16px cards, Figtree typography.
   - `Contact.jsx`: Headline Large, 16px cards, floating-label contact form, pill submit button.
2. **Authentication & Identity:**
   - `Login.jsx`: Centered Google sign-in card (max-w-md, 16px radius), floating-label inputs, blue text action.
   - `Register.jsx`: Centered card, underline tabs, floating labels, blue text action.
   - `ForgotPassword.jsx`: Centered Google account recovery card, floating label input.
3. **Student Portal:**
   - `StudentDashboard.jsx`: PageHeader, 4 StatCards, 52px table rows, notification feed.
   - `RaiseComplaint.jsx`: Floating-label fields, AI text action button, 16px card.
   - `ComplaintHistory.jsx`: Search & filter bar with floating fields, DataTable with 52px rows and status chips.
   - `ComplaintDetails.jsx`: Headline Large, timeline with clean dots, star ratings, floating feedback field.
   - `Notifications.jsx`: Headline Large, unread indicators, text actions.
   - `Profile.jsx`: Summary card, Google avatar, floating label inputs, pill buttons.
4. **Technician & Staff Portal:**
   - `StaffDashboard.jsx`: Credentials strip, StatCards, Tabs, 52px table, 28px Dialog with photo upload.
   - `AssignedComplaints.jsx`: Dispatch queue DataTable, 28px Dialog for task updates.
5. **Administrative Operations:**
   - `AdminDashboard.jsx`: StatCards, Chart.js using Figtree and M3 colors, recent queue table.
   - `ManageComplaints.jsx`: Global search & filter bar card, DataTable, 28px triage Dialog.
   - `ManageStudents.jsx`: Underline tabs, 52px table rows, role chips.
   - `ManageStaff.jsx`: 8/4 grid: 52px table + floating-label technician registration form.
   - `ManageDepartments.jsx`: 8/4 grid: 52px table + floating-label division creation form.
   - `Reports.jsx`: Metric cards, star ratings, division satisfaction breakdown, CSV export.
   - `Settings.jsx`: 16px cards for security policies, storage cache, and notification dispatches.
   - `FeedbackPage.jsx`: StatCards and 16px review cards with star ratings.
   - `NotFound.jsx`: 404 display heading, body-medium text, pill return home button.
