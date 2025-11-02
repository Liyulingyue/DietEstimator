from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict


# 用户模式
class UserBase(BaseModel):
    username: str
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserUpdate(UserBase):
    password: Optional[str] = None


class UserInDBBase(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True
    
    # Pydantic v2 configuration
    model_config = ConfigDict(from_attributes=True)


# 饮食记录模式
class DietRecordBase(BaseModel):
    image_url: str
    food_description: Optional[str] = None
    calorie_estimate: Optional[int] = None
    ai_analysis: Optional[str] = None


class DietRecordCreate(DietRecordBase):
    user_id: int


class DietRecordUpdate(DietRecordBase):
    pass


class DietRecordInDB(DietRecordBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    # Pydantic v2 configuration
    model_config = ConfigDict(from_attributes=True)
