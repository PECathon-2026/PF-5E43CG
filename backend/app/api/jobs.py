"""API endpoints for job status inspection, result metadata, and catalog downloads."""

from fastapi import APIRouter, Response, status
from fastapi.responses import FileResponse, JSONResponse, PlainTextResponse

from backend.app.schemas.job_schemas import JobStatusResponse, JobResultsResponse
from backend.app.services.job_service import job_service
from backend.app.services.storage_service import storage_service
from backend.app.services.result_service import result_service

router = APIRouter()


@router.get("/jobs/{job_id}", response_model=JobStatusResponse, tags=["Jobs"])
async def get_job_status(job_id: str):
    """Retrieve current job execution status, progress stage, and timing."""
    state = job_service.get_job_status(job_id)
    return JobStatusResponse(
        job_id=state["job_id"],
        image_id=state["image_id"],
        status=state["status"],
        stage=state.get("stage", ""),
        operation=state["operation"],
        created_at=state["created_at"],
        started_at=state.get("started_at"),
        completed_at=state.get("completed_at"),
        duration_seconds=state.get("duration_seconds"),
        error=state.get("error")
    )


@router.get("/jobs/{job_id}/results", response_model=JobResultsResponse, tags=["Jobs"])
async def get_job_results(job_id: str):
    """Retrieve full result payload with measurements, statistics, and resource URLs."""
    results = result_service.get_job_results(job_id)
    return results


@router.get("/jobs/{job_id}/restored", tags=["Jobs"])
async def get_restored_image(job_id: str):
    """Download or stream the restored astronomical output image."""
    path = storage_service.get_restored_image_path(job_id)
    return FileResponse(
        path=path,
        media_type="image/png",
        filename=f"tsukuyomi_restored_{job_id}.png"
    )


@router.get("/jobs/{job_id}/catalog.csv", tags=["Export"])
async def export_catalog_csv(job_id: str):
    """Export detected celestial sources as a standard astronomical CSV catalog."""
    csv_content = result_service.generate_csv_catalog(job_id)
    return PlainTextResponse(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="tsukuyomi_catalog_{job_id}.csv"'
        }
    )


@router.get("/jobs/{job_id}/catalog.json", tags=["Export"])
async def export_catalog_json(job_id: str):
    """Export detected celestial sources and background statistics as JSON."""
    json_data = result_service.generate_json_catalog(job_id)
    return JSONResponse(
        content=json_data,
        headers={
            "Content-Disposition": f'attachment; filename="tsukuyomi_catalog_{job_id}.json"'
        }
    )
