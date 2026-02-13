"""Diagram API Routes — PlantUML diagram generation."""
from fastapi import APIRouter, HTTPException

from services.plantuml_service import PlantUMLService

router = APIRouter(prefix="/api/diagrams", tags=["diagrams"])


@router.get("/")
async def list_diagrams():
    """List all available diagram types."""
    service = PlantUMLService()
    return {"diagrams": service.list_available_diagrams()}


@router.get("/{diagram_type}")
async def get_diagram(diagram_type: str):
    """Get a specific diagram URL by type."""
    service = PlantUMLService()
    url = service.get_diagram(diagram_type)

    if not url:
        available = service.list_available_diagrams()
        types = [d["type"] for d in available]
        raise HTTPException(
            status_code=404,
            detail=f"Diagram type '{diagram_type}' not found. Available: {types}",
        )

    return {
        "type": diagram_type,
        "diagram_url": url,
    }
