#!/usr/bin/env python3
from pathlib import Path
import sys

pdf_path = Path(r"C:\temp\BWS 4-day Upper-Lower Workout Plan.pdf")
out = Path("images")
out.mkdir(exist_ok=True)
saved = 0

# Try pypdf extraction first
try:
    from pypdf import PdfReader
    from PIL import Image
    import io

    reader = PdfReader(str(pdf_path))
    for p_idx, page in enumerate(reader.pages):
        resources = page.get("/Resources")
        if not resources:
            continue
        xobject = resources.get("/XObject")
        if not xobject:
            continue
        for name in xobject:
            obj = xobject[name]
            try:
                data = obj.get_data()
            except Exception:
                continue
            try:
                img = Image.open(io.BytesIO(data))
                img = img.convert("RGBA")
                fname = out / f"page{p_idx+1}_{name.strip('/')}.png"
                img.save(fname)
                saved += 1
            except Exception:
                with open(out / f"page{p_idx+1}_{name.strip('/')}.bin", "wb") as f:
                    f.write(data)
                saved += 1
    print("pypdf saved", saved, "items")
except Exception as e:
    print("pypdf method failed:", e)

# If nothing saved, try PyMuPDF (fitz)
if saved == 0:
    try:
        import fitz
        doc = fitz.open(str(pdf_path))
        for i in range(len(doc)):
            imglist = doc.get_page_images(i)
            for img in imglist:
                xref = img[0]
                pix = fitz.Pixmap(doc, xref)
                if pix.n < 5:
                    fname = out / f"page{i+1}_{xref}.png"
                    pix.save(str(fname))
                else:
                    pix1 = fitz.Pixmap(fitz.csRGB, pix)
                    fname = out / f"page{i+1}_{xref}.png"
                    pix1.save(str(fname))
                    pix1 = None
                pix = None
                saved += 1
        print("fitz saved", saved, "images")
    except Exception as e:
        print("fitz method failed:", e)

print("done, total saved:", saved)
