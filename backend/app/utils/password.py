import re

PASSWORD_MIN_LENGTH = 8


def validate_password_strength(password: str) -> str | None:
    """Return an error message if password is weak, else None."""
    if len(password) < PASSWORD_MIN_LENGTH:
        return "Password must be at least 8 characters"
    if not re.search(r"[A-Z]", password):
        return "Password must include an uppercase letter"
    if not re.search(r"[a-z]", password):
        return "Password must include a lowercase letter"
    if not re.search(r"\d", password):
        return "Password must include a number"
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>_\-+=[\]\\;/]", password):
        return "Password must include a special character"
    return None
