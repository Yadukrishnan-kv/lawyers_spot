from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class SiteConfig(Base):
    __tablename__ = "site_config"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    name: Mapped[str] = mapped_column(String(255))
    tagline: Mapped[str] = mapped_column(String(512))
    url: Mapped[str] = mapped_column(String(512))
    description: Mapped[str] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Stat(Base):
    __tablename__ = "stats"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    label: Mapped[str] = mapped_column(String(255))
    value: Mapped[str] = mapped_column(String(64))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class PracticeArea(Base):
    __tablename__ = "practice_areas"

    slug: Mapped[str] = mapped_column(String(128), primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    icon: Mapped[str] = mapped_column(String(64))
    lawyers: Mapped[int] = mapped_column(Integer, default=0)


class State(Base):
    __tablename__ = "states"

    slug: Mapped[str] = mapped_column(String(128), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True)
    code: Mapped[str] = mapped_column(String(8))
    active: Mapped[bool] = mapped_column(Boolean, default=True)


class City(Base):
    __tablename__ = "cities"

    slug: Mapped[str] = mapped_column(String(128), primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    state_name: Mapped[str] = mapped_column(String(255))


class Lawyer(Base):
    __tablename__ = "lawyers"

    id: Mapped[str] = mapped_column(String(128), primary_key=True)
    slug: Mapped[str | None] = mapped_column(String(128), unique=True, nullable=True)
    name: Mapped[str] = mapped_column(String(255))
    image: Mapped[str] = mapped_column(Text)
    rating: Mapped[float] = mapped_column(Float, default=0)
    reviews: Mapped[int] = mapped_column(Integer, default=0)
    experience: Mapped[int] = mapped_column(Integer, default=0)
    fee: Mapped[int | None] = mapped_column(Integer, nullable=True)
    currency: Mapped[str | None] = mapped_column(String(8), nullable=True)
    location: Mapped[str] = mapped_column(String(512))
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    practice: Mapped[str] = mapped_column(String(128))
    phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    firm: Mapped[str | None] = mapped_column(String(255), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    online: Mapped[bool] = mapped_column(Boolean, default=True)
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    specialization: Mapped[list] = mapped_column(JSONB, default=list)
    languages: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    education: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    timeline: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    practice_groups: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    courts: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    awards: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    client_reviews: Mapped[list | None] = mapped_column(JSONB, nullable=True)


class QaPost(Base):
    __tablename__ = "qa_posts"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    slug: Mapped[str] = mapped_column(String(255), unique=True)
    title: Mapped[str] = mapped_column(String(512))
    excerpt: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(128))
    answers: Mapped[int] = mapped_column(Integer, default=0)
    views: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(32), default="published")


class Article(Base):
    __tablename__ = "articles"

    slug: Mapped[str] = mapped_column(String(255), primary_key=True)
    title: Mapped[str] = mapped_column(String(512))
    excerpt: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(128))
    author: Mapped[str] = mapped_column(String(255))
    date: Mapped[str] = mapped_column(String(64))
    read_time: Mapped[str] = mapped_column(String(32))
    image: Mapped[str] = mapped_column(Text)
    trending: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(String(32), default="published")


class TrendingTopic(Base):
    __tablename__ = "trending_topics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    topic: Mapped[str] = mapped_column(String(255))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class DefaultProfileReview(Base):
    __tablename__ = "default_profile_reviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    author: Mapped[str] = mapped_column(String(255))
    rating: Mapped[float] = mapped_column(Float)
    text: Mapped[str] = mapped_column(Text)
    date: Mapped[str] = mapped_column(String(64))
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    avatar: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class AdminUser(Base):
    __tablename__ = "admin_users"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255), unique=True)
    role: Mapped[str] = mapped_column(String(32))
    last_login: Mapped[str | None] = mapped_column(String(64), nullable=True)


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    lawyer_id: Mapped[str] = mapped_column(String(128))
    lawyer_name: Mapped[str] = mapped_column(String(255))
    client_name: Mapped[str] = mapped_column(String(255))
    client_email: Mapped[str] = mapped_column(String(255))
    date: Mapped[str] = mapped_column(String(32))
    time: Mapped[str] = mapped_column(String(32))
    type: Mapped[str] = mapped_column(String(64))
    status: Mapped[str] = mapped_column(String(32))
