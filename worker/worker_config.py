"""Worker configuration and queue parameters."""

import os
from backend.app.config import settings

POLL_INTERVAL_SECONDS = float(os.getenv("WORKER_POLL_INTERVAL", "1.0"))
WORKER_CONCURRENCY = int(os.getenv("WORKER_CONCURRENCY", str(settings.max_concurrent_jobs)))
WORKER_ID = os.getenv("WORKER_ID", "spirit-lens-worker-01")
