import os

label_dir = r"c:\Users\Pratiush\Downloads\pos-source-code-CashFree\z pos-source-code\pos-vision\dataset\labels\train"
files = [f for f in os.listdir(label_dir) if f.endswith(".txt")]

# YOLO format: <class_id> <x_center> <y_center> <width> <height>
# Assuming the product (Comfort bottle) is centered and fills most of the frame.
annotation = "0 0.5 0.5 0.8 0.9"

for file in files:
    file_path = os.path.join(label_dir, file)
    with open(file_path, "w") as f:
        f.write(annotation)
    print(f"Annotated {file}")

print("Successfully annotated all training items!")
