import cv2
import os
import glob

# ==========================================
# SUPER SIMPLE YOLO ANNOTATOR (Mini-Roboflow)
# ==========================================
# HOW TO USE:
# 1. Put your raw images in the 'dataset/images/train' folder.
# 2. Run this script.
# 3. Click and drag to draw a box around your item.
# 4. Press a number key (0-9) to assign a class ID to that box.
#    e.g., Press '0' for Coke, '1' for Chips.
# 5. Press 'd' to move to the next image, 'a' for previous.
# 6. Press 'c' to clear all boxes on the current image.
# 7. Press 'q' to quit.
# This will automatically create YOLO format .txt files in the labels folder!

DATASET_ROOT = "dataset"
IMAGE_DIR = os.path.join(DATASET_ROOT, "images", "train")
LABEL_DIR = os.path.join(DATASET_ROOT, "labels", "train")

# Ensure directories exist
os.makedirs(IMAGE_DIR, exist_ok=True)
os.makedirs(LABEL_DIR, exist_ok=True)

# Try to find images
supported_formats = ['*.jpg', '*.jpeg', '*.png']
image_paths = []
for fmt in supported_formats:
    image_paths.extend(glob.glob(os.path.join(IMAGE_DIR, fmt)))

if not image_paths:
    print(f"⚠️  No images found in {IMAGE_DIR}!")
    print(f"Please place your store item photos inside the '{IMAGE_DIR}' folder and run this script again.")
    exit()

current_img_idx = 0
drawing = False
ix, iy = -1, -1
current_boxes = [] # List of tuples: (class_id, x_center, y_center, width, height)
img_display = None
img_copy = None

# Mouse callback function
def draw_rectangle(event, x, y, flags, param):
    global ix, iy, drawing, img_display, img_copy, current_boxes

    if event == cv2.EVENT_LBUTTONDOWN:
        drawing = True
        ix, iy = x, y

    elif event == cv2.EVENT_MOUSEMOVE:
        if drawing:
            img_display = img_copy.copy()
            cv2.rectangle(img_display, (ix, iy), (x, y), (0, 255, 0), 2)

    elif event == cv2.EVENT_LBUTTONUP:
        drawing = False
        # Ensure x and y are within bounds
        h, w = img_copy.shape[:2]
        x = max(0, min(x, w - 1))
        y = max(0, min(y, h - 1))
        ix = max(0, min(ix, w - 1))
        iy = max(0, min(iy, h - 1))

        if abs(x - ix) > 5 and abs(y - iy) > 5: # Ignore tiny clicks
            # Calculate YOLO format: x_center, y_center, width, height (normalized 0.0 to 1.0)
            x_min, x_max = min(ix, x), max(ix, x)
            y_min, y_max = min(iy, y), max(iy, y)
            
            box_w = x_max - x_min
            box_h = y_max - y_min
            x_center = x_min + (box_w / 2)
            y_center = y_min + (box_h / 2)
            
            norm_x = x_center / w
            norm_y = y_center / h
            norm_w = box_w / w
            norm_h = box_h / h
            
            # Temporary store with class_id = -1 (waiting for keyboard input)
            current_boxes.append([-1, norm_x, norm_y, norm_w, norm_h])
            cv2.rectangle(img_copy, (ix, iy), (x, y), (0, 255, 0), 2)
            img_display = img_copy.copy()


def parse_existing_labels(label_path, w, h):
    boxes = []
    if os.path.exists(label_path):
        with open(label_path, 'r') as f:
            for line in f.readlines():
                parts = line.strip().split()
                if len(parts) == 5:
                    boxes.append([int(parts[0]), float(parts[1]), float(parts[2]), float(parts[3]), float(parts[4])])
    return boxes

def save_labels(label_path, boxes):
    with open(label_path, 'w') as f:
        for box in boxes:
            if box[0] != -1: # Only save if a class ID was assigned
                f.write(f"{box[0]} {box[1]:.6f} {box[2]:.6f} {box[3]:.6f} {box[4]:.6f}\n")

cv2.namedWindow('Mini Roboflow Annotator')
cv2.setMouseCallback('Mini Roboflow Annotator', draw_rectangle)

while True:
    img_path = image_paths[current_img_idx]
    base_name = os.path.basename(img_path)
    label_name = os.path.splitext(base_name)[0] + '.txt'
    label_path = os.path.join(LABEL_DIR, label_name)
    
    img = cv2.imread(img_path)
    if img is None:
        print(f"Error loading {img_path}")
        current_img_idx = (current_img_idx + 1) % len(image_paths)
        continue

    h, w = img.shape[:2]
    
    # Resize window if it's too large
    if h > 800 or w > 1200:
        scale = min(800/h, 1200/w)
        img = cv2.resize(img, (int(w*scale), int(h*scale)))
        h, w = img.shape[:2]

    img_copy = img.copy()
    current_boxes = parse_existing_labels(label_path, w, h)
    
    # Draw existing boxes
    for box in current_boxes:
        if box[0] != -1: # It has a class
            cx, cy, bw, bh = box[1] * w, box[2] * h, box[3] * w, box[4] * h
            x1 = int(cx - bw / 2)
            y1 = int(cy - bh / 2)
            x2 = int(cx + bw / 2)
            y2 = int(cy + bh / 2)
            cv2.rectangle(img_copy, (x1, y1), (x2, y2), (255, 0, 0), 2)
            cv2.putText(img_copy, f"Class: {box[0]}", (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)

    img_display = img_copy.copy()

    while True:
        # Instruction Text overlay
        display_with_text = img_display.copy()
        cv2.putText(display_with_text, f"Image {current_img_idx+1}/{len(image_paths)}: {base_name}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        cv2.putText(display_with_text, "Drag to draw box. Press 0-9 to assign class ID to last box.", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
        cv2.putText(display_with_text, "[D]=Next, [A]=Prev, [C]=Clear, [Q]=Quit", (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
        
        # If there's an unassigned box, show a warning
        if len(current_boxes) > 0 and current_boxes[-1][0] == -1:
            cv2.putText(display_with_text, "Awaiting Class ID! Press 0-9", (10, 130), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 165, 255), 2)

        cv2.imshow('Mini Roboflow Annotator', display_with_text)
        key = cv2.waitKey(10) & 0xFF

        if key == ord('q'):
            save_labels(label_path, current_boxes)
            cv2.destroyAllWindows()
            exit()
        elif key == ord('d'):
            save_labels(label_path, current_boxes)
            current_img_idx = (current_img_idx + 1) % len(image_paths)
            break
        elif key == ord('a'):
            save_labels(label_path, current_boxes)
            current_img_idx = (current_img_idx - 1) % len(image_paths)
            break
        elif key == ord('c'):
            current_boxes = []
            img_copy = img.copy()
            img_display = img.copy()
            if os.path.exists(label_path):
                os.remove(label_path)
            print("Cleared boxes for this image.")
        elif ord('0') <= key <= ord('9'):
            if len(current_boxes) > 0 and current_boxes[-1][0] == -1:
                class_id = key - ord('0')
                current_boxes[-1][0] = class_id
                print(f"Assigned Class {class_id} to box.")
                # Redraw to show class
                img_copy = img.copy()
                for box in current_boxes:
                    if box[0] != -1:
                        cx, cy, bw, bh = box[1] * w, box[2] * h, box[3] * w, box[4] * h
                        x1 = int(cx - bw / 2)
                        y1 = int(cy - bh / 2)
                        x2 = int(cx + bw / 2)
                        y2 = int(cy + bh / 2)
                        cv2.rectangle(img_copy, (x1, y1), (x2, y2), (255, 0, 0), 2)
                        cv2.putText(img_copy, f"Class: {box[0]}", (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)
                img_display = img_copy.copy()
                save_labels(label_path, current_boxes)
