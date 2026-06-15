from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.tables import (
    AdminUser,
    Article,
    Booking,
    City,
    DefaultProfileReview,
    Lawyer,
    PracticeArea,
    QaPost,
    SiteConfig,
    Stat,
    State,
    TrendingTopic,
)
from app.schemas.cms import CmsDataSchema, LawyerSchema


def _lawyer_to_schema(row: Lawyer) -> dict:
    data = LawyerSchema(
        id=row.id,
        slug=row.slug,
        name=row.name,
        image=row.image,
        rating=row.rating,
        reviews=row.reviews,
        experience=row.experience,
        fee=row.fee,
        currency=row.currency,
        location=row.location,
        address=row.address,
        practice=row.practice,
        specialization=row.specialization or [],
        online=row.online,
        verified=row.verified,
        phone=row.phone,
        languages=row.languages,
        firm=row.firm,
        bio=row.bio,
        education=row.education,
        timeline=row.timeline,
        practiceGroups=row.practice_groups,
        courts=row.courts,
        awards=row.awards,
        clientReviews=row.client_reviews,
    )
    return data.model_dump(by_alias=True, exclude_none=False)


def load_cms(db: Session) -> CmsDataSchema:
    site = db.get(SiteConfig, 1)
    if not site:
        raise ValueError("Site not configured. Run seed script.")

    stats = db.query(Stat).order_by(Stat.sort_order).all()
    practice_areas = db.query(PracticeArea).order_by(PracticeArea.name).all()
    states = db.query(State).order_by(State.name).all()
    cities = db.query(City).order_by(City.name).all()
    lawyers = db.query(Lawyer).order_by(Lawyer.name).all()
    qa_posts = db.query(QaPost).all()
    articles = db.query(Article).all()
    topics = db.query(TrendingTopic).order_by(TrendingTopic.sort_order).all()
    reviews = db.query(DefaultProfileReview).order_by(DefaultProfileReview.sort_order).all()
    admin_users = db.query(AdminUser).all()
    bookings = db.query(Booking).all()

    return CmsDataSchema(
        siteConfig={
            "name": site.name,
            "tagline": site.tagline,
            "url": site.url,
            "description": site.description,
        },
        stats=[{"label": s.label, "value": s.value} for s in stats],
        practiceAreas=[
            {"slug": p.slug, "name": p.name, "icon": p.icon, "lawyers": p.lawyers}
            for p in practice_areas
        ],
        states=[
            {"slug": s.slug, "name": s.name, "code": s.code, "active": s.active}
            for s in states
        ],
        cities=[{"slug": c.slug, "name": c.name, "state": c.state_name} for c in cities],
        lawyers=[_lawyer_to_schema(l) for l in lawyers],
        qaPosts=[
            {
                "id": q.id,
                "title": q.title,
                "excerpt": q.excerpt,
                "category": q.category,
                "answers": q.answers,
                "views": q.views,
                "slug": q.slug,
                "status": q.status,
            }
            for q in qa_posts
        ],
        articles=[
            {
                "slug": a.slug,
                "title": a.title,
                "excerpt": a.excerpt,
                "category": a.category,
                "author": a.author,
                "date": a.date,
                "readTime": a.read_time,
                "image": a.image,
                "trending": a.trending,
                "status": a.status,
            }
            for a in articles
        ],
        trendingTopics=[t.topic for t in topics],
        defaultProfileReviews=[
            {
                "author": r.author,
                "rating": r.rating,
                "text": r.text,
                "date": r.date,
                "verified": r.verified,
                "avatar": r.avatar,
            }
            for r in reviews
        ],
        adminUsers=[
            {
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "role": u.role,
                "lastLogin": u.last_login,
            }
            for u in admin_users
        ],
        bookings=[
            {
                "id": b.id,
                "lawyerId": b.lawyer_id,
                "lawyerName": b.lawyer_name,
                "clientName": b.client_name,
                "clientEmail": b.client_email,
                "date": b.date,
                "time": b.time,
                "type": b.type,
                "status": b.status,
            }
            for b in bookings
        ],
        updatedAt=site.updated_at.isoformat() if site.updated_at else datetime.now(timezone.utc).isoformat(),
    )


def _clear_content_tables(db: Session) -> None:
    db.query(Booking).delete()
    db.query(AdminUser).delete()
    db.query(DefaultProfileReview).delete()
    db.query(TrendingTopic).delete()
    db.query(Article).delete()
    db.query(QaPost).delete()
    db.query(Lawyer).delete()
    db.query(City).delete()
    db.query(State).delete()
    db.query(PracticeArea).delete()
    db.query(Stat).delete()


def save_cms(db: Session, payload: CmsDataSchema) -> CmsDataSchema:
    _clear_content_tables(db)

    site = db.get(SiteConfig, 1)
    if not site:
        site = SiteConfig(id=1)
        db.add(site)
    site.name = payload.siteConfig.name
    site.tagline = payload.siteConfig.tagline
    site.url = payload.siteConfig.url
    site.description = payload.siteConfig.description
    site.updated_at = datetime.now(timezone.utc)

    for i, s in enumerate(payload.stats):
        db.add(Stat(label=s.label, value=s.value, sort_order=i))

    for p in payload.practiceAreas:
        db.add(PracticeArea(slug=p.slug, name=p.name, icon=p.icon, lawyers=p.lawyers))

    for s in payload.states:
        db.add(State(slug=s.slug, name=s.name, code=s.code, active=s.active))

    for c in payload.cities:
        db.add(City(slug=c.slug, name=c.name, state_name=c.state))

    for raw in payload.lawyers:
        l = raw if isinstance(raw, dict) else raw.model_dump()
        db.add(
            Lawyer(
                id=l["id"],
                slug=l.get("slug"),
                name=l["name"],
                image=l["image"],
                rating=l.get("rating", 0),
                reviews=l.get("reviews", 0),
                experience=l.get("experience", 0),
                fee=l.get("fee"),
                currency=l.get("currency"),
                location=l["location"],
                address=l.get("address"),
                practice=l["practice"],
                phone=l.get("phone"),
                firm=l.get("firm"),
                bio=l.get("bio"),
                online=l.get("online", True),
                verified=l.get("verified", False),
                specialization=l.get("specialization") or [],
                languages=l.get("languages"),
                education=l.get("education"),
                timeline=l.get("timeline"),
                practice_groups=l.get("practiceGroups"),
                courts=l.get("courts"),
                awards=l.get("awards"),
                client_reviews=l.get("clientReviews"),
            )
        )

    for q in payload.qaPosts:
        db.add(
            QaPost(
                id=q.id,
                slug=q.slug,
                title=q.title,
                excerpt=q.excerpt,
                category=q.category,
                answers=q.answers,
                views=q.views,
                status=q.status or "published",
            )
        )

    for a in payload.articles:
        db.add(
            Article(
                slug=a.slug,
                title=a.title,
                excerpt=a.excerpt,
                category=a.category,
                author=a.author,
                date=a.date,
                read_time=a.readTime,
                image=a.image,
                trending=a.trending,
                status=a.status or "published",
            )
        )

    for i, topic in enumerate(payload.trendingTopics):
        db.add(TrendingTopic(topic=topic, sort_order=i))

    for i, r in enumerate(payload.defaultProfileReviews):
        db.add(
            DefaultProfileReview(
                author=r.author,
                rating=r.rating,
                text=r.text,
                date=r.date,
                verified=r.verified or False,
                avatar=r.avatar,
                sort_order=i,
            )
        )

    for u in payload.adminUsers:
        db.add(
            AdminUser(
                id=u.id,
                name=u.name,
                email=u.email,
                role=u.role,
                last_login=u.lastLogin,
            )
        )

    for b in payload.bookings:
        db.add(
            Booking(
                id=b.id,
                lawyer_id=b.lawyerId,
                lawyer_name=b.lawyerName,
                client_name=b.clientName,
                client_email=b.clientEmail,
                date=b.date,
                time=b.time,
                type=b.type,
                status=b.status,
            )
        )

    db.commit()
    return load_cms(db)
