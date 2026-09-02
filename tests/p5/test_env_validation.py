import pytest

from infrastructure.env_validation import MissingEnvironmentError, validate_critical_env

COMPLETE_ENV = {
    "DATABASE_URL": "postgresql://postgres:postgres@localhost:5432/contentforge",
    "REDIS_URL": "redis://localhost:6379/0",
    "STORAGE_ENDPOINT": "http://localhost:9000",
    "STORAGE_BUCKET": "contentforge-artifacts",
    "STORAGE_ACCESS_KEY": "minioadmin",
    "STORAGE_SECRET_KEY": "minioadmin",
    "JWT_SECRET": "dev-secret",
}


def test_complete_env_passes():
    validate_critical_env(COMPLETE_ENV)  # should not raise


def test_missing_single_var_is_caught():
    env = dict(COMPLETE_ENV)
    del env["JWT_SECRET"]
    with pytest.raises(MissingEnvironmentError) as exc_info:
        validate_critical_env(env)
    assert "JWT_SECRET" in exc_info.value.missing


def test_missing_multiple_vars_are_all_reported():
    env = dict(COMPLETE_ENV)
    del env["DATABASE_URL"]
    del env["STORAGE_BUCKET"]
    with pytest.raises(MissingEnvironmentError) as exc_info:
        validate_critical_env(env)
    assert set(exc_info.value.missing) == {"DATABASE_URL", "STORAGE_BUCKET"}


def test_empty_string_counts_as_missing():
    env = dict(COMPLETE_ENV)
    env["JWT_SECRET"] = ""
    with pytest.raises(MissingEnvironmentError):
        validate_critical_env(env)
