"""Shared pytest fixtures for SmartCampus test suite."""
import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import create_app
from app.core.database import db as _db


@pytest.fixture(scope="function")
def app():
    """Create an application with in-memory SQLite for tests."""
    application = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
    })
    with application.app_context():
        _db.create_all()
        yield application
        _db.session.remove()
        _db.drop_all()


@pytest.fixture(scope="function")
def client(app):
    """Provide a test client for the Flask application."""
    return app.test_client()
