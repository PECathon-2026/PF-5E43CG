"""Standalone worker process for Tsukuyomi Watch astronomical tasks.

Can be run independently of the FastAPI server to offload heavy image processing.
"""

import os
import sys
import time
import glob
import json
import logging
from concurrent.futures import ThreadPoolExecutor

# Ensure project root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.config import settings
from worker.tasks import process_job
from worker.worker_config import POLL_INTERVAL_SECONDS, WORKER_CONCURRENCY, WORKER_ID

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [Worker] %(message)s"
)
logger = logging.getLogger("worker")


def run_worker_loop():
    logger.info(f"Starting Tsukuyomi Watch worker '{WORKER_ID}' (concurrency={WORKER_CONCURRENCY})...")
    executor = ThreadPoolExecutor(max_workers=WORKER_CONCURRENCY)
    active_jobs = set()

    try:
        while True:
            # Look for queued job files in jobs directory
            job_pattern = os.path.join(settings.jobs_dir, "*.json")
            for job_file in glob.glob(job_pattern):
                job_id = os.path.splitext(os.path.basename(job_file))[0]
                if job_id in active_jobs:
                    continue

                try:
                    with open(job_file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    
                    if data.get("status") == "queued":
                        active_jobs.add(job_id)
                        logger.info(f"Worker claimed queued job: {job_id} ({data.get('operation')})")
                        
                        def task_wrapper(jid=job_id):
                            try:
                                process_job(jid)
                            finally:
                                active_jobs.discard(jid)

                        executor.submit(task_wrapper)
                except Exception as e:
                    logger.debug(f"Error checking job file {job_file}: {e}")

            time.sleep(POLL_INTERVAL_SECONDS)
    except KeyboardInterrupt:
        logger.info("Worker shutting down gracefully...")
        executor.shutdown(wait=True)


if __name__ == "__main__":
    run_worker_loop()
