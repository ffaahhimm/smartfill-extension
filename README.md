# ⚡ SmartFill — Auto Form Filler Chrome Extension

> Fill any form in **one click**. Save your details once, auto-fill everywhere — Google Forms, college portals, job applications, company websites and more.

![SmartFill Banner](https://img.shields.io/badge/SmartFill-v1.2-7b4ecc?style=for-the-badge&logo=googlechrome&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Chrome-blue?style=for-the-badge)
![Open Source](https://img.shields.io/badge/Open%20Source-%E2%9D%A4-red?style=for-the-badge)

---

## 🎯 What is SmartFill?

SmartFill is a free, open-source Chrome extension that saves your personal details (name, email, phone, college info, etc.) and automatically fills them into any web form — in just one click.

No more typing the same information over and over again for every Google Form, internship application, or college registration!

---

## ✨ Features

- ⚡ **One-click form filling** — fills all matching fields instantly
- 🎓 **College-specific fields** — UID, Branch, Section, Semester, Year
- 👤 **Personal details** — Name, Gender, DOB, Phone, WhatsApp
- 🏢 **Works everywhere** — Google Forms, Internshala, LinkedIn, Naukri, company portals
- 📋 **Copy to clipboard** — click any saved field to copy it
- 💾 **Export / Import** — backup your profile as JSON
- 🔒 **100% Private** — all data stored locally in your browser, never uploaded
- 🎨 **Clean UI** — Divi-inspired design with purple theme
- ✅ **Fill counter** — shows exactly how many fields were filled
- 🕐 **Fill history** — remembers when you last filled a form

---

## 📸 Screenshots

| Fill Form | Profile | Settings |
|-----------|---------|----------|
| One-click fill with summary | All your details in one place | Toggle options & backup |

---

## 🚀 Installation (Manual / Developer Mode)

Since this extension is not on the Chrome Web Store yet, install it manually:

1. **Download** this repository as a ZIP → click **Code** → **Download ZIP**
2. **Extract** the ZIP folder on your computer
3. Open Chrome and go to `chrome://extensions/`
4. Turn on **Developer Mode** (toggle in top-right corner)
5. Click **"Load unpacked"**
6. Select the extracted `smartfill-extension` folder
7. ✅ SmartFill icon will appear in your Chrome toolbar!

---

## 📖 How to Use

### First Time Setup
1. Click the SmartFill icon in your toolbar
2. Go to the **👤 Profile** tab
3. Fill in all your details (UID, name, email, phone, college, etc.)
4. Click **💾 Save Profile**

### Filling a Form
1. Open any form (Google Form, job application, college portal, etc.)
2. Click the SmartFill icon
3. Click **⚡ Fill This Form**
4. Watch all fields fill instantly! ✨

### Tips
- **Copy any value** — on the Fill Form tab, click any row to copy that value
- **Export your profile** — Settings → Export Profile (saves as JSON backup)
- **Keyboard shortcut** — set one at `chrome://extensions/shortcuts`

---

## 🌐 Supported Websites

SmartFill works on most websites with standard HTML forms, including:

| Category | Examples |
|----------|---------|
| College Forms | Google Forms, Microsoft Forms, college portals |
| Job Applications | Internshala, LinkedIn, Naukri, Unstop |
| Company Portals | Workday, Lever, Greenhouse, custom career sites |
| Registration Forms | Event registrations, hackathons, workshops |
| Any HTML Form | If it has input fields, SmartFill can fill it |

---

## 🗂️ Project Structure

```
smartfill-extension/
│
├── manifest.json      # Chrome extension configuration (Manifest V3)
├── popup.html         # Extension UI — all tabs and layout
├── popup.js           # All logic — save, fill, export, import
└── icon.png           # Extension icon (hexagonal lightning bolt)
```

---

## 🔧 How It Works (Technical)

1. **Storage** — uses `chrome.storage.sync` to save your profile (syncs across devices if logged into Chrome)
2. **Scripting** — uses `chrome.scripting.executeScript` to inject the fill function into the active tab
3. **Label Detection** — scans every input using:
   - `aria-label`, `aria-labelledby`
   - `<label for="">` elements
   - Parent/sibling DOM text nodes (walks up 6 levels)
   - Google Forms question containers
   - `placeholder`, `name`, `id`, `title` attributes
4. **React/Angular support** — uses native input value setter + dispatches `input`, `change`, `keydown`, `keyup` events

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** this repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Commit: `git commit -m "Add: your feature description"`
5. Push: `git push origin feature/your-feature-name`
6. Open a **Pull Request**

### Ideas for Contribution
- [ ] Support for Firefox (WebExtensions API)
- [ ] Auto-detect form fields and suggest mappings
- [ ] Multiple profiles (e.g., switch between college and work profiles)
- [ ] Chrome Web Store submission
- [ ] Support for more Indian portals (IRCTC, DigiLocker, etc.)

---

## 📝 Fields Supported

| Category | Fields |
|----------|--------|
| Academic | UID/Enrollment, Branch, Section, Semester, Year, College |
| Personal | First Name, Last Name, Full Name, Gender, Date of Birth |
| Contact | Email, Phone, WhatsApp, City, State, Address, Pincode |
| Online | LinkedIn, GitHub, Portfolio/Website |

---

## 🔒 Privacy

- ✅ **No data is ever uploaded** to any server
- ✅ All data stored locally using `chrome.storage.sync`
- ✅ No analytics, no tracking, no ads
- ✅ Open source — you can verify the code yourself

---

## 📄 License

This project is licensed under the **MIT License** — free to use, modify, and share.

```
MIT License — Copyright (c) 2026 SmartFill Contributors
Permission is granted to use, copy, modify, and distribute this software freely.
```

---

## ⭐ Support

If SmartFill helped you, please consider:
- ⭐ **Starring this repository**
- 🍴 **Forking and contributing**
- 📢 **Sharing with your friends and classmates**

---

*Built with ❤️ for students tired of filling the same form over and over again.*
