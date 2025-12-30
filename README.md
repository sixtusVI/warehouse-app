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

## How to Use

1. **Open the App**: Simply open `index.html` in a web browser
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
