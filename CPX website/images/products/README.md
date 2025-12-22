# Product Images

This directory contains product screenshots and thumbnails for the Pixel Studio catalog.

## Directory Structure

```
images/products/
├── tms/
│   ├── tms-thumbnail.jpg (Main product card image)
│   ├── screen-1.jpg (Dashboard overview)
│   ├── screen-2.jpg (Shipment tracking)
│   ├── screen-3.jpg (Fleet management)
│   ├── screen-4.jpg (Route optimization)
│   └── screen-5.jpg (Analytics)
├── wms/
│   ├── wms-thumbnail.jpg (Main product card image)
│   ├── screen-1.jpg (Inventory dashboard)
│   ├── screen-2.jpg (Warehouse layout)
│   ├── screen-3.jpg (Order fulfillment)
│   ├── screen-4.jpg (Stock management)
│   └── screen-5.jpg (Reports)
├── pms/
│   ├── pms-thumbnail.jpg (Main product card image)
│   ├── screen-1.jpg (Employee directory)
│   ├── screen-2.jpg (Attendance tracking)
│   ├── screen-3.jpg (Payroll processing)
│   ├── screen-4.jpg (Performance reviews)
│   └── screen-5.jpg (Leave management)
└── pts/
    ├── pts-thumbnail.jpg (Main product card image)
    ├── screen-1.jpg (Route planner)
    ├── screen-2.jpg (Fleet tracking)
    ├── screen-3.jpg (Passenger info)
    ├── screen-4.jpg (Ticketing system)
    └── screen-5.jpg (Analytics dashboard)
```

## Image Specifications

### Thumbnail Images
- **Size**: 1200x750px (16:10 aspect ratio)
- **Format**: JPG (optimized for web)
- **Quality**: 85%
- **Usage**: Product card thumbnails on studio.html

### Screenshot Images
- **Size**: 1600x1000px (16:10 aspect ratio)
- **Format**: JPG (optimized for web)
- **Quality**: 90%
- **Usage**: Demo modal slideshow

## Adding Images

1. Take screenshots of your application
2. Resize to recommended dimensions
3. Optimize for web (compress without losing quality)
4. Save with appropriate naming convention
5. Place in corresponding product directory

## Placeholder Images

Until real screenshots are available, the system uses SVG placeholders with:
- Product-specific gradient backgrounds
- Screenshot number labels
- Proper aspect ratio maintained

## Notes

- Images are lazy-loaded for performance
- Auto-scrolling demo displays all 5 screenshots
- Fallback to placeholders if images don't exist
- Consider using WebP format for better compression (with JPG fallback)
