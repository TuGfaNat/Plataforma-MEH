import requests
from fastapi import APIRouter, HTTPException, Query
from typing import Optional

router = APIRouter(prefix="/ms-learning", tags=["Microsoft Learning"])

BASE_URL = "https://learn.microsoft.com/api/catalog/"

@router.get("/catalog")
def get_ms_catalog(
    locale: str = "es-es",
    last_modified: Optional[str] = None
):
    """
    Proxy para la Microsoft Learn Catalog API.
    Obtiene módulos y rutas de aprendizaje oficiales.
    """
    params = {"locale": locale}
    if last_modified:
        params["last_modified"] = last_modified
        
    try:
        response = requests.get(BASE_URL, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Opcional: Podríamos filtrar o transformar los datos aquí
        # Por ahora devolvemos el catálogo completo para que el frontend decida
        return data
        
    except requests.exceptions.RequestException as e:
        print(f"Error calling MS Learn API: {str(e)}")
        raise HTTPException(
            status_code=502, 
            detail="Error al comunicarse con el catálogo de Microsoft Learn"
        )

@router.get("/catalog/modules")
def get_ms_modules(locale: str = "es-es"):
    """Retorna solo los módulos del catálogo"""
    catalog = get_ms_catalog(locale)
    return {"modules": catalog.get("modules", [])}

@router.get("/catalog/learning-paths")
def get_ms_learning_paths(locale: str = "es-es"):
    """Retorna solo las rutas de aprendizaje del catálogo"""
    catalog = get_ms_catalog(locale)
    return {"learningPaths": catalog.get("learningPaths", [])}
