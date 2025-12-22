# 🎨 Interactive 3D Particle System with Hand Gesture Control

A real-time interactive 3D particle system built with Three.js and MediaPipe Hands. Control particle behavior, colors, and templates using hand gestures captured through your webcam!

## ✨ Features

### Particle Templates
- **❤️ Hearts** - Romantic heart-shaped particle formation
- **🌸 Flowers** - Beautiful flower petal patterns
- **🪐 Saturn** - Planet with ring system
- **🎆 Fireworks** - Multiple explosion patterns
- **⭐ Stars** - Five-pointed star formations
- **🌀 Spiral** - Mesmerizing spiral helix

### Color Modes
- **🌈 Rainbow** - Smooth rainbow gradient
- **🔥 Fire** - Hot fire colors
- **🌊 Ocean** - Cool blue ocean tones
- **🌲 Forest** - Natural green shades
- **🌅 Sunset** - Warm sunset palette

### Hand Gestures
- **✋ Open Palm** - Expand particles outward
- **✊ Closed Fist** - Contract particles inward
- **✌️ Peace Sign** - Cycle through color modes
- **👍 Thumbs Up** - Increase rotation speed
- **☝️ Point** - Attract particles to hand position
- **🤟 Three Fingers** - Switch between particle templates

### Additional Controls

#### Keyboard Shortcuts
- **1-6** - Switch to specific particle template
- **C** - Cycle color modes
- **R** - Reset particles
- **Spacebar** - Cycle templates
- **+/-** - Increase/decrease expansion
- **Mouse Wheel** - Zoom in/out (expansion)

#### Mouse Controls
- **Click & Drag** - Attract particles to cursor
- **Scroll Wheel** - Adjust particle expansion

#### Touch Controls (Mobile)
- **Single Touch & Drag** - Attract particles
- **Pinch Gesture** - Expand/contract particles

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Webcam access for hand gesture control
- Local web server (for HTTPS requirement)

### Installation

1. **Clone or download** this project to your computer

2. **Set up a local web server** (required for camera access):

   **Option A: Using Python**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```

   **Option B: Using Node.js**
   ```bash
   npx http-server -p 8000
   ```

   **Option C: Using VS Code Live Server**
   - Install "Live Server" extension
   - Right-click `index.html` → "Open with Live Server"

3. **Open in browser**
   ```
   http://localhost:8000
   ```

4. **Allow camera access** when prompted

## 📖 Usage Guide

### First Launch
1. Grant camera permissions when prompted
2. Wait for "Hand tracking active" status
3. Position your hand in view of the camera
4. Try different gestures to control particles

### Tips for Best Results
- Ensure good lighting for hand detection
- Keep hand at a comfortable distance from camera
- Make gestures clear and deliberate
- Use UI controls if gesture recognition is difficult
- The small video feed shows your camera view

### Performance Optimization
- Close other browser tabs for better performance
- Reduce browser window size if experiencing lag
- Use a dedicated GPU if available
- Try different particle counts by modifying `particleCount` in `particles.js`

## 🎯 Use Cases

- **Live Performances** - Interactive visual art shows
- **Installations** - Museum or gallery exhibits
- **Education** - Teaching 3D graphics and gesture recognition
- **Entertainment** - Party visuals and interactive displays
- **Presentations** - Engaging tech demos
- **Therapy** - Relaxation and meditation visuals

## 🛠️ Technical Stack

- **Three.js** - 3D graphics rendering
- **MediaPipe Hands** - Real-time hand tracking
- **WebGL** - GPU-accelerated rendering
- **JavaScript ES6+** - Modern JavaScript features

## 📁 Project Structure

```
.
├── index.html          # Main HTML file with UI
├── particles.js        # Particle system implementation
├── gestures.js         # Hand gesture recognition
├── main.js            # Application logic and Three.js setup
└── README.md          # Documentation
```

## 🎨 Customization

### Modify Particle Count
Edit `particles.js`:
```javascript
this.particleCount = 5000; // Change this value
```

### Add New Color Modes
Edit the `getColorForParticle()` method in `particles.js`:
```javascript
case 'custom':
    return {
        r: your_red_value,
        g: your_green_value,
        b: your_blue_value
    };
```

### Create New Particle Templates
Add a new generation method in `particles.js`:
```javascript
generateCustomShape() {
    for (let i = 0; i < this.particleCount; i++) {
        // Your custom particle positioning logic
        this.positions[i * 3] = x;
        this.positions[i * 3 + 1] = y;
        this.positions[i * 3 + 2] = z;
    }
}
```

### Adjust Gesture Sensitivity
Modify detection thresholds in `gestures.js`:
```javascript
this.hands.setOptions({
    minDetectionConfidence: 0.7,  // Adjust 0.0 - 1.0
    minTrackingConfidence: 0.7    // Adjust 0.0 - 1.0
});
```

## 🐛 Troubleshooting

### Camera Not Working
- Ensure HTTPS or localhost
- Check browser permissions
- Try different browser
- Verify camera is not in use by another app

### Poor Hand Detection
- Improve lighting conditions
- Ensure hand contrast against background
- Move hand closer/farther from camera
- Try different angles

### Low Performance
- Reduce particle count
- Close other applications
- Use modern browser
- Update graphics drivers

### Particles Not Responding
- Check console for errors (F12)
- Verify JavaScript files loaded correctly
- Ensure proper file paths
- Test manual controls first

## 🌟 Future Enhancements

Potential additions:
- [ ] Two-hand gesture support
- [ ] Custom particle shapes from images
- [ ] Sound reactivity
- [ ] Recording and playback
- [ ] VR/AR integration
- [ ] Multiplayer interactions
- [ ] Physics simulations
- [ ] Particle trails and effects

## 📝 License

This project is open source and available for educational and personal use.

## 🤝 Contributing

Feel free to fork, modify, and enhance this project! Contributions are welcome.

## 📧 Support

For issues or questions, please check:
1. Browser console for error messages
2. Camera permissions are granted
3. Running on localhost or HTTPS
4. All files are in the same directory

---

**Enjoy creating beautiful interactive particle art with your hands! ✨🎨**
