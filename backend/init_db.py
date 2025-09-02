#!/usr/bin/env python3
"""
Database initialization script for Synapse API
"""
import os
import sys
from sqlalchemy import create_engine
from app.database import Base
from app.config import settings

def init_db():
    """Initialize the database with all tables"""
    try:
        # Create engine
        engine = create_engine(settings.DATABASE_URL)
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
        
    except Exception as e:
        print(f"❌ Error creating database tables: {e}")
        sys.exit(1)

if __name__ == "__main__":
    init_db()
