from pydantic import BaseModel, ConfigDict


class PurchaseOut(BaseModel):
    id: int
    course_id: int
    owner_id: int

    model_config: ConfigDict(format_attributes=True)
