"""Error definitions and HTTP exception helpers for Tsukuyomi Watch."""

from fastapi import HTTPException, status


class AstronomicalProcessingError(Exception):
    """Base exception for astronomical processing failures."""
    pass


class ImageValidationError(HTTPException):
    def __init__(self, detail: str):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class ResourceNotFoundError(HTTPException):
    def __init__(self, detail: str = "Requested astronomical resource was not found"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class JobBusyError(HTTPException):
    def __init__(self, detail: str = "Server queue is currently saturated. Please retry shortly."):
        super().__init__(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=detail)


class PayloadTooLargeError(HTTPException):
    def __init__(self, detail: str = "Uploaded file exceeds maximum configured size."):
        super().__init__(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=detail)
