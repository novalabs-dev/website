"""Generate OG images for Nova Labs website."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

WIDTH = 1200
HEIGHT = 630

def create_og_image(title, subtitle, filename):
    """Create a professional OG image with gradient background."""
    img = Image.new('RGB', (WIDTH, HEIGHT), '#0f172a')
    draw = ImageDraw.Draw(img)

    # Background gradient effect (dark blue to purple-ish)
    for y in range(HEIGHT):
        r = int(15 + (y / HEIGHT) * 20)
        g = int(23 + (y / HEIGHT) * 10)
        b = int(42 + (y / HEIGHT) * 40)
        draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))

    # Decorative blurred circles (subtle, like the website)
    circle_layer = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    circle_draw = ImageDraw.Draw(circle_layer)
    circle_draw.ellipse([250, 50, 950, 580], fill=(99, 102, 241, 18))
    circle_draw.ellipse([550, 250, 1150, 650], fill=(6, 182, 212, 12))
    circle_layer = circle_layer.filter(ImageFilter.GaussianBlur(radius=60))

    # Composite circles onto background
    bg_rgba = img.convert('RGBA')
    bg_rgba = Image.alpha_composite(bg_rgba, circle_layer)
    img = bg_rgba.convert('RGB')
    draw = ImageDraw.Draw(img)

    # Top accent line (indigo to cyan gradient)
    for x in range(WIDTH):
        progress = x / WIDTH
        r = int(99 + progress * (6 - 99))
        g = int(102 + progress * (182 - 102))
        b = int(241 + progress * (212 - 241))
        for y_offset in range(3):
            draw.point((x, y_offset), fill=(r, g, b))

    # Try to use a good font, fall back to default
    try:
        font_title = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 64)
        font_subtitle = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 28)
        font_brand = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
    except (IOError, OSError):
        try:
            font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 64)
            font_subtitle = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 28)
            font_brand = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 24)
        except (IOError, OSError):
            font_title = ImageFont.load_default()
            font_subtitle = ImageFont.load_default()
            font_brand = ImageFont.load_default()

    # Brand name top-left
    draw.text((60, 40), "Nova Labs", fill=(129, 140, 248), font=font_brand)

    # Title - center
    title_bbox = draw.textbbox((0, 0), title, font=font_title)
    title_w = title_bbox[2] - title_bbox[0]
    title_x = (WIDTH - title_w) // 2
    title_y = HEIGHT // 2 - 80
    draw.text((title_x, title_y), title, fill=(255, 255, 255), font=font_title)

    # Subtitle - center
    sub_bbox = draw.textbbox((0, 0), subtitle, font=font_subtitle)
    sub_w = sub_bbox[2] - sub_bbox[0]
    sub_x = (WIDTH - sub_w) // 2
    sub_y = title_y + 90
    draw.text((sub_x, sub_y), subtitle, fill=(148, 163, 184), font=font_subtitle)

    # Bottom-right URL
    tag = "nova-labs.dev"
    tag_bbox = draw.textbbox((0, 0), tag, font=font_brand)
    draw.text((WIDTH - (tag_bbox[2] - tag_bbox[0]) - 60, HEIGHT - 60), tag, fill=(100, 116, 139), font=font_brand)

    output_dir = os.path.join(os.path.dirname(__file__), '..', 'public')
    img.save(os.path.join(output_dir, filename), 'PNG', quality=95)
    print(f"Created {filename}")


if __name__ == '__main__':
    create_og_image(
        "Stop chatting. Start automating.",
        "Build your own AI-powered business with Claude Code.",
        "og-image.png"
    )
    create_og_image(
        "Skills that do the work.",
        "Production-ready Claude Code skills. Install once, automate forever.",
        "og-skills.png"
    )
    print("Done!")
