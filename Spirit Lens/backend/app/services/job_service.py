"""Job manager service for asynchronous astronomical image processing."""

import os
import time
import uuid
import logging
from concurrent.futures import ThreadPoolExecutor
from typing import Dict, Any, Optional

from backend.app.config import settings
from backend.app.core.errors import ResourceNotFoundError, JobBusyError
from backend.app.services.storage_service import storage_service
from worker.tasks import process_job

logger = logging.getLogger(__name__)


class JobService:
    def __init__(self):
        # In-process asynchronous thread pool for worker tasks
        self.executor = ThreadPoolExecutor(
            max_workers=settings.max_concurrent_jobs,
            thread_name_prefix="spirit_lens_worker"
        )
        self.active_jobs: Dict[str, float] = {}

    def create_job(self, image_id: str, operation: str, settings_dict: Dict[str, Any]) -> str:
        """Create and queue a new processing job."""
        # Check active capacity
        if len(self.active_jobs) >= (settings.max_concurrent_jobs * 4):
            raise JobBusyError("Processing queue is currently at capacity. Please retry shortly.")

        # Validate that image exists
        storage_service.get_image_metadata(image_id)

        job_id = str(uuid.uuid4())
        job_state = {
            "job_id": job_id,
            "image_id": image_id,
            "operation": operation,
            "status": "queued",
            "stage": "Job queued for server-side processing",
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "started_at": None,
            "completed_at": None,
            "duration_seconds": None,
            "settings": settings_dict,
            "error": None
        }

        storage_service.save_job_state(job_id, job_state)
        self.active_jobs[job_id] = time.time()

        # Submit to worker pool asynchronously (keeps FastAPI loop completely non-blocking)
        def _execute():
            try:
                process_job(job_id)
            finally:
                self.active_jobs.pop(job_id, None)

        self.executor.submit(_execute)
        return job_id

    def get_job_status(self, job_id: str) -> Dict[str, Any]:
        """Fetch status and current progress stage for a job."""
        return storage_service.load_job_state(job_id)


job_service = JobService()
