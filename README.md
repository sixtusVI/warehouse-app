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

**If Python is installed on your system** (check installation status below):

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

**To install Python if not available:**
- **Windows:** Download from [python.org/downloads](https://www.python.org/downloads/) and run the installer (check "Add Python to PATH")
- **macOS:** Install using Homebrew: `brew install python3` or download from [python.org/downloads](https://www.python.org/downloads/)
- **Linux:** Use your package manager:
  - Ubuntu/Debian: `sudo apt-get install python3`
  - Fedora: `sudo dnf install python3`
  - Arch: `sudo pacman -S python`

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

## Running with HTTPS (Optional)

For local development with HTTPS (useful for testing secure features):

### Option 1: Using http-server with SSL

**If you have Node.js installed:**

1. Install http-server globally (if not already installed):
```bash
npm install -g http-server
```

2. Generate a self-signed certificate (one-time setup):
```bash
# Install mkcert for creating local certificates
npm install -g mkcert

# Create local certificate authority
mkcert -install

# Generate certificate for localhost
mkcert localhost 127.0.0.1 ::1
```

3. Run with SSL:
```bash
http-server -S -C localhost+2.pem -K localhost+2-key.pem
```

The app will be available at: `https://localhost:8080`

**Note:** Your browser may show a security warning for self-signed certificates. Click "Advanced" and "Proceed" to continue.

### Option 2: Using Python with SSL

**For Python 3.x with SSL:**

1. Create a simple HTTPS server script (`https_server.py`):
```python
import http.server
import ssl

server_address = ('localhost', 4443)
httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)

# Create self-signed certificate (run once):
# openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365

httpd.socket = ssl.wrap_socket(httpd.socket,
                                server_side=True,
                                certfile='cert.pem',
                                keyfile='key.pem',
                                ssl_version=ssl.PROTOCOL_TLS)

print("Server running on https://localhost:4443")
httpd.serve_forever()
```

2. Generate self-signed certificate:
```bash
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365
```

3. Run the HTTPS server:
```bash
python3 https_server.py
```

The app will be available at: `https://localhost:4443`

### Option 3: Using VS Code Live Server with HTTPS

The Live Server extension supports HTTPS through settings:

1. Open VS Code Settings (File > Preferences > Settings)
2. Search for "Live Server"
3. Find "Live Server > Settings: Https" and configure:
   - Enable: `liveServer.settings.https.enable: true`
   - Cert: Path to your certificate file
   - Key: Path to your key file

**Important Notes:**
- HTTPS is typically not required for local development of this static app
- Self-signed certificates will show browser warnings
- For production deployment, use proper SSL certificates from a certificate authority
- These instructions are for development purposes only

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
