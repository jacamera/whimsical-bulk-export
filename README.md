# Whimsical Bulk Data Export Tools

## Description
I wrote these scripts to automate the process of exporting data from Whimsical since a built-in bulk export option is not available.

**Warning:** This is a very brittle browser automation implementation that simulates clicking through every document in the navigation pane and printing it. This means two things:
- This script will break when Whimsical updates their app design. (Pull requests welcome if you have a fix!)
- Any documents not displayed in the navigation pane and hidden behind a "+X More..." link will not be exported.

## Instructions

### Notes

- I've noticed that exported PDFs are sometimes incomplete, even when exporting manually. Seems to be a Whimsical bug and printing again seems to fix it. You may want to run a few exports and archive multiple copies of the PDFs just to be safe.
- Keep the browser window visible. If you minimize or hide the window the export script does not work properly.

### Configure Chrome for Automated Printing

Some Whimsical documents can be exported as text, a PNG image, or an SVG file (experimental), but the only common way to export every type of document is by printing a PDF.

Scripts, and even browser automation tools like Selenium, cannot interact interact with print dialog so you'll need to launch Chrome with a special flag that bypasses the dialog and prints automatically using the default settings instead.

1. Launch Chrome normally and print a single document using the settings that you want to use for the bulk export. Chrome will remember the printer and orientation that you choose.
2. Relaunch Chrome using the `--kiosk-printing` flag.

   Windows:

        C:\Program Files (x86)\Google\Chrome\Application\chrome.exe --kiosk-printing
        
   macOS:

        /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --kiosk-printing

   The path to your Chrome executable may vary.

### Run the Export Script

1. Load the Whimsical web app and copy and paste all the text in the `export.js` file into the developer tools console to run the script.
2. The script will log a bunch of actions and you should see the documents loading and printing in the browser window. When the process completes a list of processed files will be generated for the next step.

### Run the Organize Script

1. Save the output from the export script to a text file.
2. Run the organize script to move all the exported PDF files into their proper directories.

        node organize.js path/to/pdf/files path/to/text/file.txt
