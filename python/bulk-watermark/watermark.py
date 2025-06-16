# Package used: pillow

from PIL import Image
import os

def add_watermark(input_folder, output_folder, watermark_path):
    # check output folder
    os.makedirs(output_folder, exist_ok=True)

    # watermark settings
    watermark = Image.open(watermark_path).convert("RGBA")
    watermark = watermark.resize((75, 75))
    watermark_data = watermark.getdata()
    new_data = []
    for pixel in watermark_data:
        r, g, b, a = pixel
        new_data.append((r, g, b, int(a * 0.5)))
    watermark.putdata(new_data)

    # iamge loop
    for filename in os.listdir(input_folder):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            input_path = os.path.join(input_folder, filename)
            output_path = os.path.join(output_folder, filename)

            # main image
            main_image = Image.open(input_path).convert("RGBA")

            # watermark placement
            margin = 20
            x = main_image.width - 75 - margin
            y = main_image.height - 75 - margin

            # placing watermark
            main_image.alpha_composite(watermark, (x, y))

            # save watermarked image
            main_image.convert("RGB").save(output_path)
            print(f"Success: {filename}")

if __name__ == "__main__":
    add_watermark(
        input_folder="input_images",
        output_folder="output_images",
        watermark_path="watermark.png"
    )
