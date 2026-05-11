# UI/UX Design: The "Four-Pillar" App Structure

This is a Progressive Web App (PWA) and not a native iOS or Android binary. Therefore, please be careful with the UI libraries you use.

## Design Language: Monochrome & Uplifting Simplicity

To uphold **Tenet 5 (Radical Simplicity)** and **Tenet 7 (Destination, Not a Launcher)**, the application adopts a monochrome (grayscale-first) design palette. When implementing this color scheme, it is important to map back to a variable-lookup with `customLightTheme` or `customDarkTheme` in `app/_layout.tsx` instead of hard-coding hex-values to ensure consistency and maintainability. If any hex values in this spec does not exist in that custom theme file, it must be populated.

### Color Accents: Lapis Blue (light) and Steel Blue (dark)

Lapis Blue #3056D3 and Steel Blue #5E7BCB bridges the gap between a "Digital Sanctuary" and "Practical Utility." Lapis Blue functions as a "neutral plus"—it maintains authority and stability while providing the necessary contrast for accessibility, especially for elderly users.

Finally, Sanctuary Blue #3EA6FF is slightly brighter for contrast with modern tech branding and is useful for special cases where doubly "popping positive" visuals are needed, such as iconography.

### Key Principles & Exceptions:

1.  **Brand Neutrality:** Following YouTube's "Neutral Treatment" guidelines, third-party logos are generally rendered in monochrome variants. By standardizing external logos, we visually reinforce that the user remains within their "Digital Home," even when accessing external media.
    - **Exception:** YouTube and Spotify icons utilize their respective brand colors to aid immediate recognition and content surfacing, as mentioned below.
2.  **Visual Hierarchy (The 90/10 Rule):** 90% of the interface remains monochrome to maintain a peaceful environment. 10% of the interface utilizes a **Lapis Blue** #3056D3 and Steel Blue #5E7BCB accent for most critical interactive elements (Primary buttons, "pop" utility) in light mode and dark mode. Sanctuary Blue #3EA6FF is reserved for extremely special cases, such as iconography.
3.  **Iconography:** Icons across all pillars utilize consistent stroke weights and monochrome styling. This provides a "premium" feel and ensures accessibility across both light and dark modes.
    - **Colors:** Generally use **Sanctuary Blue** #3EA6FF in Light Mode and **Pure White** #FFFFFF in Dark Mode for high visibility.
    - **Exceptions:**
      - **Top Search Bar:** See section below. Special case from [Material design](https://m3.material.io/components/app-bars/specs).
      - **Bottom Tab Bar:** See section below.

### Bottom Tab Bar Icon Edge Case (YouTube Treatment)

To ensure the focus remains entirely on the content within the sanctuary, the bottom navigation utilizes a strict neutral treatment. Selection is indicated by a "Fill" state (solid icon) rather than a change in brand color.

| Mode           | Active (Filled)        | Inactive (Outline)     | Rationale                                         |
| :------------- | :--------------------- | :--------------------- | :------------------------------------------------ |
| **Light Mode** | `#0F0F0F` (Deep Black) | `#0F0F0F` (Deep Black) | High contrast. Indicated by fill state only.      |
| **Dark Mode**  | `#FFFFFF` (Pure White) | `#FFFFFF` (Pure White) | Maximum visibility. Indicated by fill state only. |

### Core Monochrome Palette:

| Element                          | Light Mode Hex | Dark Mode Hex | Rationale                                                           |
| :------------------------------- | :------------- | :------------ | :------------------------------------------------------------------ |
| **Background**                   | #F8F9FA        | #121212       | Aligned with YouTube's background aesthetic to minimize eye strain. |
| **Surface (Cards/Containers)**   | #FFFFFF        | #1E1E1E       | Soft surfaces to distinguish content from the background.           |
| **Text**                         | #1A1A1A        | #F5F5F5       | High-contrast monochrome for core content.                          |
| **Primary Interaction (Accent)** | #3056D3        | #5E7BCB       | Lapis Blue (Light) and a desaturated variant for Dark.              |

### Extended Structural Palette

These colors provide the necessary elevation and boundary logic for Material Design 3 components without introducing secondary color palettes.

| Element                 | Light Mode Hex | Dark Mode Hex | Rationale                                                            |
| :---------------------- | :------------- | :------------ | :------------------------------------------------------------------- |
| **Selection Container** | #E3F2FD        | #2C2C2C       | Used for active/selected states and primary containers.              |
| **Surface Variant**     | #F1F3F4        | #2C2C2C       | Secondary surface color for subtle UI separation (e.g. Search Bar).  |
| **Boundary (Outline)**  | #CAC4D0        | #938F99       | Standard boundary color for components.                              |
| **Boundary (Subtle)**   | #E0E0E0        | #333333       | Used for subtle dividers and non-critical borders.                   |
| **Inverted Text**       | #FFFFFF        | #121212       | High-contrast text for use on brand accents (Lapis/Steel/Sanctuary). |

### Special External Brand Palette

These brand colors are used for third-party recognition in Light Mode and follow the "YouTube Treatment" (monochrome) in Dark Mode.

| Element           | Light Mode Hex | Dark Mode Hex | Rationale                                                   |
| :---------------- | :------------- | :------------ | :---------------------------------------------------------- |
| **YouTube Brand** | #FF0000        | #FFFFFF       | Official YouTube red in light; Monochrome in dark (Spec).   |
| **Spotify Brand** | #1DB954        | #FFFFFF       | Official Spotify green in light; Monochrome in dark (Spec). |

### Top Search Bar (M3 "Pill" Treatment)

To maintain the YouTube-style "content-first" aesthetic, the top search bar is rendered as a clean monochrome pill.

| Mode           | Background | Icon/Text | Rationale                                        |
| :------------- | :--------- | :-------- | :----------------------------------------------- |
| **Light Mode** | `#F1F3F4`  | `#606060` | Subtle contrast against the opaque header.       |
| **Dark Mode**  | `#1E1E1E`  | `#AAAAAA` | Recedes into the header to minimize distraction. |

### Bottom Tab Bar Icon Edge Case (YouTube Treatment)

To ensure the focus remains entirely on the content within the sanctuary, the bottom navigation utilizes a strict neutral treatment. Selection is indicated by a "Fill" state (solid icon) rather than a change in brand color.

| Mode           | Active (Filled)        | Inactive (Outline)     | Rationale                                         |
| :------------- | :--------------------- | :--------------------- | :------------------------------------------------ |
| **Light Mode** | `#0F0F0F` (Deep Black) | `#0F0F0F` (Deep Black) | High contrast. Indicated by fill state only.      |
| **Dark Mode**  | `#FFFFFF` (Pure White) | `#FFFFFF` (Pure White) | Maximum visibility. Indicated by fill state only. |

#### Elevation & Translucency (The "Glass" Rule)

To maintain a modern, native feel and satisfy **Tenet 5 (Radical Simplicity)**, the app utilizes translucent surfaces for persistent navigation and search elements.

- **Glassmorphism:** Blur (Intensity 50) for bottom navigation and search overlays.
- **Edge-to-Edge Immersive UI:** The app must blend seamlessly into the device's physical boundaries, extending the UI to the very edge of the screen at both the top (status bar) and bottom (home indicator/navigation bar).
  - **Immersive Canvas:** Eliminate "letterboxing" or hard-coded safe area gutters. The background content or translucent navigation bars should bleed into the system safe areas (using `viewport-fit=cover` for PWA).
  - **Hardware-Software Synergy:** Like the YouTube app, this design choice removes the visual separation between the app and the device hardware, reinforcing the "Digital Sanctuary" metaphor by making the interface feel like an integrated environment rather than a window inside a frame.
- **Header Opacity:** The top header is completely opaque (using the base background color) to provide a solid anchor for the "Digital Sanctuary."
- **Absolute Positioning & Offset:** Global navigation elements are positioned absolute. To prevent initial overlap, screens must apply a `paddingTop` equal to the total header height (Status Bar + 64px).
- **Boundary Definition:** Do not use any boundary definition for the bottom tab navigation bar so there will be a smooth transition from blurred tab bar to unblurred content.
- **Browser Fallback:** For browsers that do not support `backdrop-filter`, the high-opacity `rgba` background serves as a graceful fallback to ensure legibility.
- **Future-Proofing:** It shifts your design from "Standard App" to a custom "Digital Sanctuary." That blurred effect mimics light passing through a window, which is a subtle but powerful spiritual metaphor for a church app.

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
