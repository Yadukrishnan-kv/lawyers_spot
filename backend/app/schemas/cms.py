from typing import Any, Literal

from pydantic import BaseModel, Field


class SiteConfigSchema(BaseModel):
    name: str
    tagline: str
    url: str
    description: str


class StatSchema(BaseModel):
    label: str
    value: str


class PracticeAreaSchema(BaseModel):
    slug: str
    name: str
    icon: str
    lawyers: int


class StateSchema(BaseModel):
    slug: str
    name: str
    code: str
    active: bool


class CitySchema(BaseModel):
    slug: str
    name: str
    state: str


class LawyerSchema(BaseModel):
    id: str
    slug: str | None = None
    name: str
    image: str
    rating: float
    reviews: int
    experience: int
    fee: int | None = None
    currency: str | None = None
    location: str
    address: str | None = None
    practice: str
    specialization: list[str] = Field(default_factory=list)
    online: bool
    verified: bool
    phone: str | None = None
    languages: list[str] | None = None
    firm: str | None = None
    bio: str | None = None
    education: list[dict[str, Any]] | None = None
    timeline: list[dict[str, Any]] | None = None
    practiceGroups: list[dict[str, Any]] | None = None
    courts: list[str] | None = None
    awards: list[dict[str, Any]] | None = None
    clientReviews: list[dict[str, Any]] | None = None

    class Config:
        populate_by_name = True


class QaPostSchema(BaseModel):
    id: str
    title: str
    excerpt: str
    category: str
    answers: int
    views: int
    slug: str
    status: Literal["published", "draft"] | None = "published"


class ArticleSchema(BaseModel):
    slug: str
    title: str
    excerpt: str
    category: str
    author: str
    date: str
    readTime: str
    image: str
    trending: bool
    status: Literal["published", "draft"] | None = "published"


class AdminUserSchema(BaseModel):
    id: str
    name: str
    email: str
    role: Literal["super_admin", "editor", "moderator"]
    lastLogin: str | None = None


class BookingSchema(BaseModel):
    id: str
    lawyerId: str
    lawyerName: str
    clientName: str
    clientEmail: str
    date: str
    time: str
    type: str
    status: Literal["pending", "confirmed", "cancelled"]


class LawyerReviewSchema(BaseModel):
    author: str
    rating: float
    text: str
    date: str
    verified: bool | None = False
    avatar: str | None = None


class CmsDataSchema(BaseModel):
    siteConfig: SiteConfigSchema
    stats: list[StatSchema]
    practiceAreas: list[PracticeAreaSchema]
    states: list[StateSchema]
    cities: list[CitySchema]
    lawyers: list[LawyerSchema]
    qaPosts: list[QaPostSchema]
    articles: list[ArticleSchema]
    trendingTopics: list[str]
    defaultProfileReviews: list[LawyerReviewSchema]
    adminUsers: list[AdminUserSchema]
    bookings: list[BookingSchema]
    updatedAt: str


class LoginRequest(BaseModel):
    email: str
    password: str
