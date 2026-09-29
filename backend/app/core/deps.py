from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.core.security import decode_token
from app.database.session import get_db
from app.models.user import User, UserRole
from sqlalchemy import select
import uuid

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not credentials:
        raise credentials_exception

    payload = decode_token(credentials.credentials)
    if payload is None or payload.get("type") != "access":
        raise credentials_exception

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise credentials_exception

    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise credentials_exception

    result = await db.execute(select(User).where(User.id == user_id, User.is_active == True))
    user = result.scalar_one_or_none()
    if not user:
        raise credentials_exception
    return user


def require_roles(*roles: UserRole):
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {[r.value for r in roles]}",
            )
        return current_user
    return role_checker


# Convenience role dependencies
require_admin = require_roles(UserRole.ADMIN)
require_leadership = require_roles(UserRole.LEADERSHIP, UserRole.ADMIN)
require_pi = require_roles(UserRole.PRINCIPAL_INVESTIGATOR, UserRole.ADMIN)
require_coordinator = require_roles(UserRole.STUDY_COORDINATOR, UserRole.ADMIN)
require_monitor = require_roles(UserRole.MONITOR, UserRole.ADMIN)
require_ethics = require_roles(UserRole.ETHICS_COMMITTEE, UserRole.ADMIN)
require_pv = require_roles(UserRole.PHARMACOVIGILANCE_OFFICER, UserRole.ADMIN)
require_regulator = require_roles(UserRole.REGULATOR, UserRole.ADMIN)
