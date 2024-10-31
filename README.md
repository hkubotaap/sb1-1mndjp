Try it here first
https://frabjous-chimera-e9aefe.netlify.app/

Warikan App (Split Bill App)
A simple and user-friendly split bill calculation application that makes it easy to manage and settle payments within groups.

Key Features
👥 Member Management: Easily add or remove group members
💰 Payment Record: Record who paid how much and for whom
🔄 Settlement Calculation: Automatically calculate the optimal settlement method
💾 Data Storage: Access settlement information later with payment codes
⚖️ Flexible Distribution: Supports two types of payments - equal split and per capita
🧮 Rounding Options: Choose from rounding down, up, or to the nearest unit
Tech Stack
React + TypeScript
Tailwind CSS
IndexedDB (for data persistence)
Lucide Icons
How to Use
Register Members

Enter and add the names of group members
Register at least two members to proceed to the next step
Record Payments

Select payment date, amount, and payer
Choose payment type (equal split/per capita)
Check the applicable members
Edit or delete payment details as needed
Settlement

View payment summary and optimal settlement method
Select rounding method (down/up/nearest)
Copy settlement results to clipboard
Access past records using payment information codes
Running Locally
bash

# Install dependencies
npm install

# Start development server
npm run dev

# Build
npm run build
