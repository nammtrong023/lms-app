import logging
from typing import Literal

import cloudinary
import cloudinary.uploader
from app.config import config
from fastapi import APIRouter, HTTPException, UploadFile, status

logger = logging.getLogger(__name__)

router = APIRouter()

cloudinary.config(
    cloud_name=config.CLOUD_NAME,
    api_key=config.CLOUD_API_KEY,
    api_secret=config.CLOUD_API_SECRET,
)

CHUNK_SIZE = 2 * 1024 * 1024


@router.post("/", status_code=201)
def upload_file(file: UploadFile, resource_type: Literal["image", "video"] = "image"):
    try:
        result = cloudinary.uploader.upload(
            file.file,
            chunk_size=CHUNK_SIZE,
            resource_type=resource_type,
        )
        url = result.get("secure_url")
    except Exception as e:
        logger.error(f"Error to upload file: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="There was an error uploading the file",
        )

    return url
