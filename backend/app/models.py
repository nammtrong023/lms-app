from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(60))
    is_active = Column(Boolean, default=False)

    courses = relationship("Course", back_populates="owner")
    user_progress = relationship("UserProgress", back_populates="owner")
    purchases = relationship("Purchase", back_populates="owner")

    created_at = Column(DateTime(), default=datetime.now)
    updated_at = Column(DateTime(), default=datetime.now, onupdate=datetime.now)


class Course(Base):
    __tablename__ = 'courses'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String(255), nullable=True)
    image_url = Column(String(255), nullable=True)
    price = Column(Float, nullable=True)
    is_published = Column(Boolean, default=False)

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="courses")

    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    category = relationship("Category", back_populates="courses")

    chapters = relationship("Chapter", back_populates="course")
    purchases = relationship("Purchase", back_populates="course")

    created_at = Column(DateTime(), default=datetime.now)
    updated_at = Column(DateTime(), default=datetime.now, onupdate=datetime.now)


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)

    courses = relationship("Course", back_populates="category")

    created_at = Column(DateTime(), default=datetime.now)
    updated_at = Column(DateTime(), default=datetime.now, onupdate=datetime.now)


class Chapter(Base):
    __tablename__ = "chapters"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String(255), nullable=True)
    video_url = Column(String(255), nullable=True)
    position = Column(Integer)
    is_published = Column(Boolean, default=False)
    is_free = Column(Boolean, default=False)

    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"))
    course = relationship("Course", back_populates="chapters")

    user_progress = relationship("UserProgress", back_populates="chapter")

    created_at = Column(DateTime(), default=datetime.now)
    updated_at = Column(DateTime(), default=datetime.now, onupdate=datetime.now)


class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    is_completed = Column(Boolean, default=False)

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="user_progress")

    chapter_id = Column(Integer, ForeignKey("chapters.id", ondelete="CASCADE"))
    chapter = relationship("Chapter", back_populates="user_progress")

    created_at = Column(DateTime(), default=datetime.now)
    updated_at = Column(DateTime(), default=datetime.now, onupdate=datetime.now)


class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True)
    created_at = Column(DateTime(), default=datetime.now)
    updated_at = Column(DateTime(), default=datetime.now, onupdate=datetime.now)

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="purchases")

    course_id = Column(Integer, ForeignKey("courses.id"))
    course = relationship("Course", back_populates="purchases")


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    stripe_customer_id = Column(String(60), nullable=False)
    course_id = Column(Integer, nullable=False)
    created_at = Column(DateTime(), default=datetime.now)
    updated_at = Column(DateTime(), default=datetime.now, onupdate=datetime.now)
