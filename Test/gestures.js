// gestures.js - Hand Gesture Recognition System

class GestureRecognizer {
    constructor() {
        this.hands = null;
        this.camera = null;
        this.videoElement = null;
        this.currentGesture = 'none';
        this.handPosition = { x: 0, y: 0, z: 0 };
        this.callbacks = {
            onGestureChange: null,
            onHandMove: null
        };
    }

    async initialize(videoElement, onResults) {
        this.videoElement = videoElement;
        
        // Initialize MediaPipe Hands
        this.hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        this.hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7
        });

        this.hands.onResults((results) => {
            this.processResults(results);
            if (onResults) onResults(results);
        });

        // Setup camera
        this.camera = new Camera(videoElement, {
            onFrame: async () => {
                await this.hands.send({ image: videoElement });
            },
            width: 640,
            height: 480
        });

        await this.camera.start();
    }

    processResults(results) {
        if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
            this.currentGesture = 'none';
            return;
        }

        const landmarks = results.multiHandLandmarks[0];
        
        // Get hand position (using wrist as reference)
        const wrist = landmarks[0];
        this.handPosition = {
            x: (wrist.x - 0.5) * 200,  // Scale to Three.js coordinates
            y: -(wrist.y - 0.5) * 150,
            z: wrist.z * 100
        };

        // Recognize gesture
        const gesture = this.recognizeGesture(landmarks);
        
        if (gesture !== this.currentGesture) {
            this.currentGesture = gesture;
            if (this.callbacks.onGestureChange) {
                this.callbacks.onGestureChange(gesture);
            }
        }

        if (this.callbacks.onHandMove) {
            this.callbacks.onHandMove(this.handPosition, gesture);
        }
    }

    recognizeGesture(landmarks) {
        // Calculate finger states
        const fingers = {
            thumb: this.isFingerExtended(landmarks, 4, 3, 2),
            index: this.isFingerExtended(landmarks, 8, 7, 6),
            middle: this.isFingerExtended(landmarks, 12, 11, 10),
            ring: this.isFingerExtended(landmarks, 16, 15, 14),
            pinky: this.isFingerExtended(landmarks, 20, 19, 18)
        };

        const extendedCount = Object.values(fingers).filter(v => v).length;

        // Open Palm (all fingers extended)
        if (extendedCount === 5) {
            return 'open_palm';
        }

        // Closed Fist (no fingers extended)
        if (extendedCount === 0) {
            return 'fist';
        }

        // Peace Sign (index and middle extended)
        if (fingers.index && fingers.middle && !fingers.ring && !fingers.pinky) {
            return 'peace';
        }

        // Thumbs Up
        if (fingers.thumb && !fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky) {
            return 'thumbs_up';
        }

        // Point (only index extended)
        if (!fingers.thumb && fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky) {
            return 'point';
        }

        // Three fingers (rock gesture or OK)
        if (extendedCount === 3) {
            return 'three_fingers';
        }

        return 'unknown';
    }

    isFingerExtended(landmarks, tipIdx, pipIdx, mcpIdx) {
        const tip = landmarks[tipIdx];
        const pip = landmarks[pipIdx];
        const mcp = landmarks[mcpIdx];

        // Check if tip is above pip (for most fingers) or extended (for thumb)
        if (tipIdx === 4) { // Thumb
            const thumbTip = landmarks[4];
            const thumbIp = landmarks[3];
            return Math.abs(thumbTip.x - thumbIp.x) > 0.05;
        } else {
            return tip.y < pip.y && pip.y < mcp.y;
        }
    }

    onGestureChange(callback) {
        this.callbacks.onGestureChange = callback;
    }

    onHandMove(callback) {
        this.callbacks.onHandMove = callback;
    }

    getGestureName(gesture) {
        const names = {
            'open_palm': 'Open Palm',
            'fist': 'Closed Fist',
            'peace': 'Peace Sign',
            'thumbs_up': 'Thumbs Up',
            'point': 'Pointing',
            'three_fingers': 'Three Fingers',
            'none': 'No Hand Detected',
            'unknown': 'Unknown Gesture'
        };
        return names[gesture] || gesture;
    }
}
