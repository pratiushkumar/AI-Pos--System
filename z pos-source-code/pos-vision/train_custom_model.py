from ultralytics import YOLO

# 1. Load a pretrained model (recommended for training on top of it)
model = YOLO('yolov8n.pt') # Use Nano model for ultra-low RAM usage

if __name__ == '__main__':
    print("🚀 Starting ultra-light training process on your machine...")
    # Train the model with safe settings for low-resource laptops
    results = model.train(
        data='dataset/dataset.yaml',   
        epochs=50,            # 50 epochs is plenty for 7 images
        imgsz=416,            # Reduced image size for speed and RAM
        batch=4,              # Low batch size to prevent OOM
        workers=0,            
        project='runs/train', 
        name='pos_custom_model' 
    )

    print("✅ Training complete! The new custom model weights are saved in:")
    print("   runs/train/pos_custom_model/weights/best.pt")
    print("\nTo use your new model, update vision_server.py to use:")
    print("model = YOLO('runs/train/pos_custom_model/weights/best.pt')")
