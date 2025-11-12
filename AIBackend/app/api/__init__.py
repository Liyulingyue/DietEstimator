# API endpoints module

from fastapi import APIRouter
from .health import router as health_router
from .connection import router as connection_router
from .estimate import router as estimate_router
from .bowel_estimate import router as bowel_estimate_router
from .methods import router as methods_router

router = APIRouter()

router.include_router(health_router)
router.include_router(connection_router)
router.include_router(estimate_router)
router.include_router(bowel_estimate_router)
router.include_router(methods_router)
