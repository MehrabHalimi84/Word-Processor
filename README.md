# Word-Processor
“A cross-platform mobile app for numerical text analysis &amp; data processing. Built with Vanilla JS and Capacitor.js, featuring custom algorithms, light mode, and optimized performance.”


# 🔢 Persian Word Value Processor (Abjad Algorithm)

![Project Status](https://img.shields.io/badge/Status-Completed-success)
![Language](https://img.shields.io/badge/Language-Vanilla%20JS-yellow)
![Style](https://img.shields.io/badge/Style-Responsive%20%26%20Clean-blue)

> A specialized web application for processing Persian text, calculating numerical values based on custom algorithmic logic (Shifted Abjad), and handling complex data sanitization.

---

## 🚀 Overview

This project is a **text processing engine** built with pure JavaScript. It converts Persian words into numerical values based on a specific client-requested algorithm (Shifted Abjad: `Index + 2`).

Unlike simple counters, this application handles **linguistic nuances** such as:
*   Merging standalone conjunctions ("و" and "ز") with the following word.
*   "Zero-Free" mathematical logic (removing zeros from cumulative sums).
*   Data sanitization using Regex to clean Arabic diacritics and non-Persian characters.

## ✨ Key Features

### 1. Multi-Mode Processing
*   **Normal Mode:** Calculates the standard numerical value of words and character counts.
*   **Special Mode (Zero-Free):** Implements a recursive algorithm to strip zeros from the calculation results dynamically.
*   **Combined Mode:** A complex hybrid view that allows setting a custom "Start Index" for the list and calculates both raw and processed values simultaneously.

### 2. Advanced Text Sanitization (`O(n)` Complexity)
The app uses a robust `normalizePersian` function to:
*   Remove Arabic diacritics (Fatha, Kasra, etc.).
*   Map Arabic characters (like 'ك', 'ي') to their Persian equivalents ('ک', 'ی').
*   Filter out invisible control characters and emojis.

### 3. Smart Algorithm Logic
*   **Shifted Valuation:** The alphabet is mapped starting from 2 (`alef = 2`, `be = 3`, ...).
*   **Conjunction Merging:** Detects isolated "Va" or "Za" and logically attaches them to the next word before calculation.

### 4. User Experience (UX)
*   **Clipboard Integration:** Generates a formatted report (with emojis and structure) for easy sharing on social media/messengers.
*   **Responsive Design:** Fully responsive UI built with Flexbox and custom CSS variables.
*   **Web Share API:** Native sharing integration for mobile devices.

---

## 🛠️ Technical Implementation

### Core Logic Snippet (Sanitization)
I used Regex to ensure only valid Persian characters are processed, ensuring the algorithm remains accurate regardless of input "noise".
```javascript
function normalizePersian(ch) {
// Remove diacritics
if (/[\u064B-\u065F]/.test(ch)) return "";

// Standardize Arabic characters to Persian
const map = { "ك": "ک", "ي": "ی", ... };
return map[ch] || ch;
}

### The "Zero-Free" Recursive Logic
To meet the specific requirement of "removing zeros" from mathematical sums:

javascript
function removeZeros(num) {
// Converts number to string, removes '0', casts back to Number
return Number(String(num).replace(/0/g, ''));
}

---

## 📂 Project Structure


├── index.html      # Main UI structure and layout
├── style.css       # Custom styling (Yekan font, Flexbox, Responsive)
├── main.js         # Core algorithms (Alphabet mapping, Text cleaning)
├── front.js        # DOM manipulation, Event listeners, Copy/Share logic
└── fonts/          # Local font assets (B_Yekan)

---

## 🚀 How to Run

1.  **Clone the repository:**

```bash
    git clone https://github.com/MehrabHalimi84/word-processor.git
