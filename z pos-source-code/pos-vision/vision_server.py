import cv2
import json
import asyncio
import websockets
from ultralytics import YOLO

# Load our CUSTOM trained model
model = YOLO('best.pt') 

# Connect to your local Webcam (0 is usually the default laptop/usb camera)
cap = cv2.VideoCapture(0)

# Set the resolution for faster processing
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

async def vision_checkout(websocket):
    print("✅ React POS Frontend connected to Vision Server!")
    
    # Keep track of recognized items in a session to avoid adding the same item 30x a second
    scanned_items = set()
    
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                await asyncio.sleep(0.1)
                continue
                
            # Pass the frame through the YOLO model
            # Note: We use the default 80 COCO classes for this demo (e.g., cell phone, cup, bottle)
            results = model(frame, stream=True, verbose=False)
            
            for result in results:
                boxes = result.boxes
                for box in boxes:
                    conf = float(box.conf[0])
                    cls_id = int(box.cls[0])
                    cls_name = model.names[cls_id]
                    
                    # If we have a high confidence detection (e.g. > 70%)
                    if conf > 0.70 and cls_name not in scanned_items:
                        # Construct an event to tell the Frontend to add the item to the cart
                        payload = {
                            "action": "ADD_ITEM",
                            "sku": f"SKU_{cls_name.replace(' ', '_').upper()}",
                            "name": cls_name.capitalize(),
                            "confidence": round(conf, 2)
                        }
                        
                        # Broadcast over WebSocket to React
                        await websocket.send(json.dumps(payload))
                        print(f"📸 Detected & Sent to Cart: {payload['name']} (Confidence: {payload['confidence']})")
                        
                        # Add to scanned items for this "checkout session"
                        scanned_items.add(cls_name)
                        
                # Draw the bounding boxes on the camera feed popup for debugging
                if SHOW_VIEWFINDER:
                    annotated_frame = result.plot()
                    cv2.imshow('AI-POS Vision ViewFinder', annotated_frame)
                    
                    # Press 'q' on your keyboard while focused on the Camera window to quit
                    if cv2.waitKey(1) & 0xFF == ord('q'):
                        break
                
            # Yield to the async event loop to keep the websocket alive
            await asyncio.sleep(0.01)
            
    except websockets.exceptions.ConnectionClosed:
        print("❌ React POS Frontend disconnected.")
        # If the cashier finishes checkout, we could clear the scanned_items here
        # scanned_items.clear()
    except Exception as e:
        print(f"⚠️ Error: {e}")

import os

# Configuration from environment variables
HOST = os.getenv('VISION_HOST', '0.0.0.0')
PORT = int(os.getenv('VISION_PORT', 8080))
SHOW_VIEWFINDER = os.getenv('SHOW_VIEWFINDER', 'false').lower() == 'true'

async def main():
    print(f"🤖 Starting AI-POS Vision Service...")
    print(f"🌐 Listening on ws://{HOST}:{PORT}")
    
    async with websockets.serve(vision_checkout, HOST, PORT):
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nShutting down AI-POS Vision Service.")
    finally:
        cap.release()
        cv2.destroyAllWindows()
