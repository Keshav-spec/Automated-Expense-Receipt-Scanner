
import easyocr
import cv2
import numpy as np

# Load OCR model once
reader = easyocr.Reader(['en'], gpu=False)


def correct_perspective(img: np.ndarray) -> np.ndarray:
    """
    Detect receipt edges and flatten the image using perspective transform.
    """

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Blur image slightly to reduce noise
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    # Detect edges
    edged = cv2.Canny(blurred, 75, 200)

    # Find contours
    contours, _ = cv2.findContours(
        edged.copy(),
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    # Sort contours by area
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:5]

    receipt_contour = None

    # Find rectangle contour
    for c in contours:

        peri = cv2.arcLength(c, True)

        approx = cv2.approxPolyDP(
            c,
            0.02 * peri,
            True
        )

        # Receipt should have 4 corners
        if len(approx) == 4:
            receipt_contour = approx
            break

    # If no contour found, return original image
    if receipt_contour is None:
        return img

    # Reshape points
    pts = receipt_contour.reshape(4, 2).astype(np.float32)

    # Create rectangle points
    rect = np.zeros((4, 2), dtype=np.float32)

    s = pts.sum(axis=1)

    rect[0] = pts[np.argmin(s)]   # top-left
    rect[2] = pts[np.argmax(s)]   # bottom-right

    diff = np.diff(pts, axis=1)

    rect[1] = pts[np.argmin(diff)]  # top-right
    rect[3] = pts[np.argmax(diff)]  # bottom-left

    (tl, tr, br, bl) = rect

    # Compute width
    widthA = np.sqrt(
        ((br[0] - bl[0]) ** 2) +
        ((br[1] - bl[1]) ** 2)
    )

    widthB = np.sqrt(
        ((tr[0] - tl[0]) ** 2) +
        ((tr[1] - tl[1]) ** 2)
    )

    maxWidth = max(int(widthA), int(widthB))

    # Compute height
    heightA = np.sqrt(
        ((tr[0] - br[0]) ** 2) +
        ((tr[1] - br[1]) ** 2)
    )

    heightB = np.sqrt(
        ((tl[0] - bl[0]) ** 2) +
        ((tl[1] - bl[1]) ** 2)
    )

    maxHeight = max(int(heightA), int(heightB))

    # Safety check
    if maxWidth < 50 or maxHeight < 50:
        return img

    # Destination points
    dst = np.array([
        [0, 0],
        [maxWidth - 1, 0],
        [maxWidth - 1, maxHeight - 1],
        [0, maxHeight - 1]
    ], dtype=np.float32)

    # Perspective transform matrix
    M = cv2.getPerspectiveTransform(rect, dst)

    # Warp image
    warped = cv2.warpPerspective(
        img,
        M,
        (maxWidth, maxHeight)
    )

    return warped


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    Preprocess receipt image for better OCR accuracy.
    """

    # Convert bytes to numpy array
    nparr = np.frombuffer(image_bytes, np.uint8)

    # Decode image
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Safety check
    if img is None:
        raise ValueError("Invalid image file")

    # Save original image (debug)
    cv2.imwrite("debug_original.jpg", img)

    # Correct perspective
    img = correct_perspective(img)

    # Save warped image (debug)
    cv2.imwrite("debug_warped.jpg", img)

    # Resize image
    img = cv2.resize(img, None, fx=2, fy=2)

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Remove noise
    denoised = cv2.fastNlMeansDenoising(gray)

    # Sharpen image
    kernel = np.array([
        [0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0]
    ])

    sharpened = cv2.filter2D(
        denoised,
        -1,
        kernel
    )

    # Adaptive thresholding
    thresh = cv2.adaptiveThreshold(
        sharpened,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        11,
        2
    )

    # Save threshold image (debug)
    cv2.imwrite("debug_threshold.jpg", thresh)

    return thresh


def extract_text(image_bytes: bytes) -> str:
    """
    Extract text from receipt image.
    """

    # Preprocess image
    processed_img = preprocess_image(image_bytes)

    # OCR extraction
    results = reader.readtext(
        processed_img,
        detail=0,
        paragraph=True
    )

    # Convert list to string
    full_text = "\n".join(map(str, results))

    return full_text


def extract_text_with_details(image_bytes: bytes):
    """
    Returns full OCR details including:
    - bounding boxes
    - detected text
    - confidence scores
    """

    processed_img = preprocess_image(image_bytes)

    results = reader.readtext(
        processed_img,
        detail=1,
        paragraph=False
    )

    return results

