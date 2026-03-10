# StickerMe — Design System

> Dựa trên Apple Human Interface Guidelines (HIG) iOS.
> Mọi thay đổi UI đều phải tuân theo file này.

---

## 1. Nguyên tắc cốt lõi (HIG Principles)

- **Clarity** — Chữ dễ đọc, icon rõ ràng, không rối mắt
- **Deference** — UI phụ trợ nội dung, không lấn át
- **Depth** — Dùng shadow, blur, layer để tạo chiều sâu tự nhiên

---

## 2. Màu sắc (Colors)

### System Colors (tuân theo HIG — tự adapt Light/Dark mode)
```ts
// Dùng các màu hệ thống của iOS thay vì hardcode hex
colors: {
  // Accent / Primary action
  primary:        '#007AFF',   // iOS Blue

  // Backgrounds
  background:     '#FFFFFF',   // Light | '#000000' Dark
  secondaryBG:    '#F2F2F7',   // Light | '#1C1C1E' Dark
  tertiaryBG:     '#FFFFFF',   // Light | '#2C2C2E' Dark

  // Labels / Text
  label:          '#000000',   // Light | '#FFFFFF' Dark
  secondaryLabel: '#3C3C43',   // opacity 0.6
  tertiaryLabel:  '#3C3C43',   // opacity 0.3
  placeholderText:'#3C3C43',   // opacity 0.3

  // Separators
  separator:      '#3C3C43',   // opacity 0.29
  opaqueSeparator:'#C6C6C8',

  // Fills
  fill:           '#787880',   // opacity 0.2
  secondaryFill:  '#787880',   // opacity 0.16

  // System tones
  systemRed:      '#FF3B30',
  systemGreen:    '#34C759',
  systemYellow:   '#FFCC00',
  systemOrange:   '#FF9500',
  systemPurple:   '#AF52DE',
  systemTeal:     '#5AC8FA',
  systemGray:     '#8E8E93',
}
```

> ⚠️ Không hardcode màu cố định — luôn dùng `useColorScheme()` để support Dark mode.

---

## 3. Typography

> Font mặc định iOS: **SF Pro** (React Native tự dùng system font)

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Large Title | 34pt | Bold | 41pt |
| Title 1 | 28pt | Bold | 34pt |
| Title 2 | 22pt | Bold | 28pt |
| Title 3 | 20pt | Semibold | 25pt |
| Headline | 17pt | Semibold | 22pt |
| Body | 17pt | Regular | 22pt |
| Callout | 16pt | Regular | 21pt |
| Subheadline | 15pt | Regular | 20pt |
| Footnote | 13pt | Regular | 18pt |
| Caption 1 | 12pt | Regular | 16pt |
| Caption 2 | 11pt | Regular | 13pt |

```ts
typography: {
  largeTitle:    { fontSize: 34, fontWeight: '700', lineHeight: 41 },
  title1:        { fontSize: 28, fontWeight: '700', lineHeight: 34 },
  title2:        { fontSize: 22, fontWeight: '700', lineHeight: 28 },
  title3:        { fontSize: 20, fontWeight: '600', lineHeight: 25 },
  headline:      { fontSize: 17, fontWeight: '600', lineHeight: 22 },
  body:          { fontSize: 17, fontWeight: '400', lineHeight: 22 },
  callout:       { fontSize: 16, fontWeight: '400', lineHeight: 21 },
  subheadline:   { fontSize: 15, fontWeight: '400', lineHeight: 20 },
  footnote:      { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  caption1:      { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  caption2:      { fontSize: 11, fontWeight: '400', lineHeight: 13 },
}
```

---

## 4. Spacing & Layout (8pt Grid)

```ts
spacing: {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  xxl:  48,
}

// Screen margins
layout: {
  screenPadding:    16,   // margin ngang màn hình
  sectionSpacing:   24,   // khoảng cách giữa các section
  contentSpacing:   12,   // khoảng cách giữa các item trong list
}
```

---

## 5. Border Radius

```ts
borderRadius: {
  sm:     6,    // input nhỏ, badge
  md:     10,   // card, button thường
  lg:     14,   // modal, sheet, card lớn
  xl:     20,   // bottom sheet
  full:   999,  // pill button, avatar
}
```

---

## 6. Shadows

```ts
// Light mode
shadow: {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
}
```

---

## 7. Components

### Button
```
Primary:   backgroundColor #007AFF, text trắng, height 50, borderRadius 12, font Headline
Secondary: backgroundColor #F2F2F7, text #007AFF, height 50, borderRadius 12
Danger:    backgroundColor #FF3B30, text trắng
Disabled:  opacity 0.4
```
- Touch target tối thiểu: **44×44pt** (HIG bắt buộc)
- Luôn có feedback: `activeOpacity={0.7}` hoặc dùng `Pressable`

### Input / TextField
```
height: 50
borderRadius: 10
backgroundColor: #F2F2F7 (light) / #1C1C1E (dark)
padding: 12 16
font: Body (17pt)
focus: border 1.5px #007AFF
error: border 1.5px #FF3B30 + message Caption1 #FF3B30
```

### Card
```
backgroundColor: #FFFFFF (light) / #1C1C1E (dark)
borderRadius: 14
padding: 16
shadow: md
```

### Navigation Bar (Header)
```
Tuân theo HIG: Large Title trên đầu, collapse khi scroll
Title: Title 2 (22pt Bold)
Back button: SF Symbol "chevron.left" + tên trang trước
```

### Tab Bar
```
Tuân theo HIG: icon + label, active = #007AFF, inactive = #8E8E93
Dùng expo-router Tabs
```

### List / Cell
```
height tối thiểu: 44pt
separator: inset từ leading content (không full width)
disclosure indicator: "chevron.right" cho item có drill-down
```

---

## 8. Icons

- Dùng **SF Symbols** (via `@expo/vector-icons/Ionicons` — closest match)
- Size icon trong tab bar: 24pt
- Size icon inline: 20pt
- Size icon hero: 28pt

---

## 9. Animation & Motion

```
- Duration ngắn (feedback): 150ms
- Duration trung bình (transition): 300ms
- Duration dài (modal): 400ms
- Easing: spring hoặc ease-in-out
- Không dùng animation quá 500ms — gây cảm giác chậm
```

---

## 10. Dark Mode

- Mọi component PHẢI support Dark mode
- Dùng `useColorScheme()` từ React Native
- Không hardcode màu hex trực tiếp trong StyleSheet
- Test cả 2 mode trước khi commit

---

## 11. Accessibility

- Font hỗ trợ Dynamic Type (`allowFontScaling={true}` — default)
- Mọi button/touchable có `accessibilityLabel`
- Contrast ratio tối thiểu 4.5:1 (WCAG AA)
- Touch target tối thiểu 44×44pt

---

## TODO khi có style tham khảo thêm
- [ ] Cập nhật màu Primary nếu không dùng iOS Blue
- [ ] Thêm custom font nếu không dùng SF Pro
- [ ] Cập nhật vibe/mood (dark theme, colorful, minimal...)
- [ ] Thêm brand colors
