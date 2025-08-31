from pydantic import BaseModel, constr, PositiveInt

class FriendRequestSchema(BaseModel):
    """'친구 요청 보내기' API에 대한 검증 스키마"""
    user_id: PositiveInt
    friend_username: constr(min_length=3, max_length=50)

class AcceptFriendRequestSchema(BaseModel):
    """'친구 요청 수락' API에 대한 검증 스키마"""
    friendship_id: PositiveInt

class RemoveFriendSchema(BaseModel):
    """'친구 삭제' API에 대한 검증 스키마"""
    user_id: PositiveInt
    friend_id: PositiveInt
