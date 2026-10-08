from datetime import datetime, timezone
from pydantic import BaseModel, Field, field_validator


class MeetingCreate(BaseModel):
    title: str = Field(default='Ankit Sharma’s Zoom Meeting', min_length=1, max_length=120)
    description: str = Field(default='', max_length=2000)
    scheduled_at: datetime | None = None
    duration_minutes: int = Field(default=30, ge=15, le=480)

    @field_validator('title')
    @classmethod
    def clean_title(cls, value):
        if not value.strip():
            raise ValueError('A meeting topic is required.')
        return value.strip()

    @field_validator('scheduled_at')
    @classmethod
    def future_time(cls, value):
        if value:
            if value.tzinfo is None:
                raise ValueError('Include a timezone in the meeting time.')
            if value <= datetime.now(timezone.utc):
                raise ValueError('Choose a date and time in the future.')
        return value


class JoinRequest(BaseModel):
    display_name: str = Field(min_length=1, max_length=60)

    @field_validator('display_name')
    @classmethod
    def clean_name(cls, value):
        if not value.strip():
            raise ValueError('Enter your display name.')
        return value.strip()
