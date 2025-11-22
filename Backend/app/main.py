from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.core.config import settings
from app.api.endpoints import router as api_router
import logging
from fastapi.responses import JSONResponse

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s %(levelname)s [%(name)s] %(message)s')

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# 设置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins,  # 生产环境使用精确白名单
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.on_event("startup")
def _log_registered_routes():
    logger = logging.getLogger("uvicorn")
    logger.info("Registered routes:")
    for r in app.routes:
        try:
            logger.info(f"  {getattr(r, 'methods', '')} {r.path}")
        except Exception:
            logger.info(f"  {r}")


@app.get("/debug/routes")
def debug_routes():
    """Return list of registered routes (path and methods)."""
    routes = []
    for r in app.routes:
        methods = list(getattr(r, 'methods', []) or [])
        routes.append({"path": getattr(r, 'path', str(r)), "methods": methods})
    return JSONResponse(routes)

@app.get("/")
def root():
    return {"message": "Welcome to DietEstimator Backend API"}
