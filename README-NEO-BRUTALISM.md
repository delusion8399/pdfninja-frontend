# Neo-Brutalism Theme for PDFNinja

This project implements a neo-brutalism theme for the PDFNinja PDF utility website. The neo-brutalism design features bold colors, chunky elements, exaggerated shadows, and playful typography.

## Features

- Bold, high-contrast color palette
- Thick borders and chunky elements
- Exaggerated drop shadows
- Playful typography and rotated elements
- Asymmetric layouts

## Pages

The neo-brutalism theme has been implemented for the following pages:

- Home page: `/neo-brutalism`
- Merge PDF page: `/neo-brutalism/merge`

The original design is still accessible at the root path and `/merge` respectively.

## Design Elements

### Colors

- Primary Yellow: `#FFDE59`
- Primary Pink: `#FF3A5E`
- Primary Blue: `#4DCCFF`
- Black: `#000000`

### Typography

- Bold, black text for headings
- Slightly rotated text elements for playful appearance
- Medium weight for body text

### Borders & Shadows

- Thick black borders (3-4px)
- Offset shadows (8px by 8px)
- No border radius (sharp corners)

## CSS Utilities

Custom CSS utilities have been added to `globals.css` to support the neo-brutalism theme:

- `.border-3`: 3px border width
- `.neo-shadow`: Standard neo-brutalism shadow (8px offset)
- `.neo-shadow-sm`: Small neo-brutalism shadow (4px offset)
- `.neo-shadow-lg`: Large neo-brutalism shadow (12px offset)
- `.neo-hover`: Hover effect with transform and shadow change
- `.neo-bounce`: Bouncing animation for interactive elements

## Components

- `NeoBrutalismHeader`: Shared header component for neo-brutalism pages
- `NeoBrutalismPDFCard`: PDF card component with neo-brutalism styling

## Functionality

All functionality from the original design has been preserved, including:

- PDF file selection
- Drag and drop reordering
- PDF merging
- PDF preview

## Future Improvements

- Implement neo-brutalism theme for additional pages (Split, Compress, etc.)
- Add more interactive animations
- Create a theme toggle to switch between original and neo-brutalism themes
