from fastapi import FastAPI
from exam_routes import router
from database import Base, engine

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(router)