# Warehouse In/Out Storage Management Web App

A web application for managing warehouse inventory with Excel import/export capabilities.

## Features

- ✅ **Track Inventory**: Manage items with Start Storage, In, Out, and auto-calculated End Storage
- 📥 **Import Excel**: Load data from existing Excel files (.xlsx, .xls)
- 📤 **Export Excel**: Export current data to Excel format
- ➕ **Add/Delete Items**: Easily add new items or remove existing ones
- 💾 **Real-time Calculation**: Automatically calculates End Storage (Start + In - Out)
- 🎨 **Modern UI**: Clean, responsive design that works on desktop and mobile
- ⌨️ **Keyboard Shortcuts**: 
  - Ctrl + N: Add new item
  - Ctrl + E: Export to Excel
  - Ctrl + I: Import from Excel

## Getting Started - Terminal Commands

If you open this project in Visual Studio Code (or any terminal), here are the commands to run it locally:

### Option 1: Direct Browser Opening (Easiest - No Installation Required)

Simply double-click `index.html` from your file explorer, or use these terminal commands:

```bash
# On Windows
start index.html

# On macOS
open index.html

# On Linux
xdg-open index.html
```

**Note:** This method works immediately but may have limitations with some browser features due to CORS restrictions.

### Option 2: Using VS Code Live Server Extension (Recommended for Development)

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"
4. The app will automatically open in your default browser at `http://127.0.0.1:5500`

### Option 3: Using Python HTTP Server

**If Python is installed on your system** (pre-installed on macOS/Linux, may need installation on Windows):

**Python 3.x:**
```bash
python -m http.server 8000
```
Or:
```bash
python3 -m http.server 8000
```

**Python 2.x:**
```bash
python -m SimpleHTTPServer 8000
```

Then open your browser and go to: `http://localhost:8000`

**To check if Python is installed:** Run `python --version` or `python3 --version` in your terminal.

### Option 4: Using Node.js http-server

**If Node.js/npm is installed on your system:**

**First, install http-server globally (one-time setup):**
```bash
npm install -g http-server
```

**Then run:**
```bash
http-server
```

The app will be available at: `http://localhost:8080`

**To check if Node.js is installed:** Run `node --version` in your terminal.

## How to Use

1. **Open the App**: Use one of the methods above to open it in a web browser
2. **Enter Warehouse Info**: Fill in warehouse name and date
3. **Manage Items**: 
   - Click "Add Item" to add new entries
   - Edit values directly in the table
   - Click "Delete" to remove items
4. **Import Data**: Click "Import Excel" to load data from an Excel file
5. **Export Data**: Click "Export Excel" to save current data

## Excel File Format

When importing, the Excel file should have these columns (in order):
1. NO
2. Name
3. Classification
4. Unit
5. Start Storage
6. In
7. Out
8. End Storage (calculated automatically)
9. Note

## Technology Stack

- **HTML5**: Structure
- **CSS3**: Styling with modern gradients and animations
- **JavaScript**: Functionality and data management
- **SheetJS (xlsx)**: Excel file handling

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Installation

No installation required! Just open `index.html` in your browser.

For local development:
1. Download all files (index.html, styles.css, script.js)
2. Keep them in the same folder
3. Open index.html in your browser

## Sample Data

The app comes with sample data showing:
- Tool (Electric Drill): 100 start, 50 in, 70 out = 80 end
- Visual Studio 2 (IDE): 200 start, 40 in, 80 out = 160 end

## Future Enhancements

- Database integration for persistent storage
- User authentication
- Advanced filtering and search
- Data visualization and reports
- Multi-warehouse support
- Barcode scanning integration
