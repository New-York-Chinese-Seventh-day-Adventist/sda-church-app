# UI/UX Design: The "Four-Pillar" App Structure

## Design Language: Monochrome & Simplicity

To uphold **Tenet 5 (Radical Simplicity)** and **Tenet 7 (Destination, Not a Launcher)**, the application adopts a monochrome (grayscale-first) design palette.

### Key Principles:

1.  **Brand Neutrality:** Following YouTube's "Neutral Treatment" guidelines, third-party logos are rendered in monochrome variants. This removes "brand noise" and ensures the app feels like a cohesive sanctuary rather than a collection of disparate services.
2.  **Visual Hierarchy (The 90/10 Rule):** 90% of the interface remains monochrome (White, Off-White, Grays) to maintain a peaceful environment. 10% of the interface utilizes a **Deep Cathedral Navy** accent for critical interactive elements (Active tabs, primary buttons, "pop" utility).
3.  **Iconography:** Icons across all pillars (Bible, Hymnal, Library) utilize consistent stroke weights and monochrome styling. This provides a "premium" feel and ensures accessibility across both light and dark modes.
4.  **Cohesive Sanctuary:** By standardizing external logos, we visually reinforce that the user remains within their "Digital Home," even when accessing external media. This reduces the psychological friction of switching between ecosystems.

### The Accent: Deep Cathedral Navy

This choice bridges the gap between a "Digital Sanctuary" and "Practical Utility." Navy functions as a "neutral plus"—it maintains authority and stability while providing the necessary contrast for accessibility, especially for elderly users.

### Core Monochrome Palette:

| Element                        | Light Mode Hex | Dark Mode Hex | Rationale                                                                             |
| :----------------------------- | :------------- | :------------ | :------------------------------------------------------------------------------------ |
| **Primary (Accent)**           | `#004B87`      | `#7FB5FF`     | "Deep Cathedral Navy" (Light) and a desaturated variant (Dark) for interactive "pop". |
| **Surface (Cards/Containers)** | `#FFFFFF`      | `#1E1E1E`     | Soft surfaces to distinguish content from the background.                             |
| **Background**                 | `#F8F9FA`      | `#121212`     | Aligned with YouTube's deep-dark aesthetic to minimize eye strain.                    |
| **Text / Base Icons**          | `#1A1A1A`      | `#F5F5F5`     | High-contrast monochrome for core content.                                            |

### Theme & Dark Mode:

Monochrome designs transition to Dark Mode elegantly. By using dark surfaces with off-white text and monochrome icons, the interface remains consistent and spiritually focused, minimizing distractions.

## 1. Home (The "Pulse")

**Purpose:** Immediate relevance.
**UI:** A scrolling dashboard of widgets.
**Content:**

- The latest banner ("Lack Nothing")
- A button for the current livestream
- "Happening This Week" (the barbecue)

**Tenet Alignment:**

- **Tenet 5 (Radical Simplicity):** A widget-based dashboard provides a "glanceable" interface where the most important information is surfaced immediately without digging through menus.
- **Tenet 7 (Destination, Not a 'Launcher'):** Featured content like the livestream keeps the spiritual experience internal to the app, protecting users from external algorithm distractions.

## 2. Community (The "In-Person" Hub)

**Purpose:** Moving people from the screen to the pew.
**UI:** Discovery Portal (Carousels and Grids).
**Content:**

- **Events:** Signups and calendar.
- **Small Groups:** Contact info for group leaders.
- **Service:** Volunteer roles.

**Tenet Alignment:**

- **Tenet 3 (Community Over Complexity):** This pillar's sole existence is to bridge the gap between digital interaction and physical presence ("moving people from the screen to the pew").
- **Tenet 4 (Anonymous Utility):** Information is provided to facilitate connection (e.g., group leader contact) without requiring user-side PII or tracking to view schedules.

## 3. Resources (The "Spiritual" Library)

**Purpose:** Deep, personal growth.
**UI:** Reader-focused (Immersive text).
**Content:**

- **The Bible:** Full text access via Bible.helloao.org.
- **Hymnal:** Lyrics and maybe MIDI/Audio clips.
- **Library:** PDFs and devotionals.

**Tenet Alignment:**

- **Tenet 6 (Spiritual Accessibility):** By unifying the Bible and Hymnal into a single, reader-focused interface, we lower the friction for daily devotion.
- **Tenet 5 (Radical Simplicity):** Immersive, text-heavy UI ensures that the content—not the chrome—is the focus for all age groups.

## 4. More (The "Utility" Drawer)

**Purpose:** Administrative tasks.
**UI:** Simple Vertical List (Matches current system settings).
**Content:**

- Giving/Tithing, Language settings, Dark Mode, Staff contact.

**Tenet Alignment:**

- **Tenet 1 (Sustainable & Accessible):** Giving features are placed here to ensure the "tower" remains funded and the app remains free to maintain.
- **Tenet 2 (Regulatory & Legal Safety):** Centralizes settings and staff contact to provide transparent access to privacy controls and leadership.
