from flask import Blueprint, request, current_app
from src.models.user import db, User
from src.models.friendship import Friendship
from src.utils.response import api_success, api_error
from src.utils.db_helpers import get_user_weekly_score
from src.models.exercise_record import ExerciseRecord
from datetime import datetime, timedelta

friends_bp = Blueprint('friends', __name__)

@friends_bp.route('/friends/request', methods=['POST'])
def send_friend_request():
    """
    한 사용자에게서 다른 사용자에게 친구 요청을 보냅니다.

    요청 본문에는 요청하는 `user_id`와 요청받는 `friend_username`이 포함되어야 합니다.
    자기 자신에게 요청하거나, 이미 친구 관계이거나, 사용자를 찾을 수 없는 경우 등
    다양한 예외 상황을 처리합니다.
    """
    try:
        data = request.get_json()
        if not data:
            return api_error(message="잘못된 요청입니다. JSON 본문이 필요합니다.")

        user_id = data.get('user_id')
        friend_username = data.get('friend_username')
        
        if not user_id or not friend_username:
            return api_error(message="사용자 ID와 친구 사용자명이 필요합니다.")
        
        friend = User.query.filter_by(username=friend_username).first()
        if not friend:
            return api_error(message="해당 사용자를 찾을 수 없습니다.", status_code=404)
        
        if int(user_id) == friend.id:
            return api_error(message="자기 자신에게는 친구 요청을 보낼 수 없습니다.")
        
        existing_friendship = Friendship.query.filter(
            ((Friendship.user_id == user_id) & (Friendship.friend_id == friend.id)) |
            ((Friendship.user_id == friend.id) & (Friendship.friend_id == user_id))
        ).first()
        
        if existing_friendship:
            return api_error(message=f"이미 친구 관계가 존재하거나 요청 대기 중입니다: {existing_friendship.status}", status_code=409)
        
        friendship = Friendship(user_id=user_id, friend_id=friend.id, status='pending')
        db.session.add(friendship)
        db.session.commit()
        
        current_app.logger.info(f"사용자 {user_id}가 {friend.id}에게 친구 요청을 보냈습니다.")
        return api_success(data=friendship.to_dict(), message="친구 요청이 성공적으로 전송되었습니다.", status_code=201)
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"친구 요청 처리 중 오류 발생: {e}", exc_info=True)
        return api_error(message="친구 요청 처리 중 서버 오류가 발생했습니다.", status_code=500)

@friends_bp.route('/friends/accept', methods=['POST'])
def accept_friend_request():
    """
    대기 중인 친구 요청을 수락합니다.

    요청 본문에는 수락할 `friendship_id`가 포함되어야 합니다.
    요청이 'pending' 상태가 아닐 경우 에러를 반환합니다.
    """
    try:
        data = request.get_json()
        if not data:
            return api_error(message="잘못된 요청입니다. JSON 본문이 필요합니다.")

        friendship_id = data.get('friendship_id')
        
        if not friendship_id:
            return api_error(message="친구 관계 ID가 필요합니다.")
        
        friendship = Friendship.query.get_or_404(friendship_id)
        
        if friendship.status != 'pending':
            return api_error(message="대기 중인 친구 요청이 아닙니다.")
        
        friendship.status = 'accepted'
        friendship.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        current_app.logger.info(f"친구 요청 {friendship.id}가 수락되었습니다.")
        return api_success(data=friendship.to_dict(), message="친구 요청이 수락되었습니다.")
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"친구 요청 수락 중 오류 발생: {e}", exc_info=True)
        return api_error(message="친구 요청 수락 중 서버 오류가 발생했습니다.", status_code=500)

@friends_bp.route('/friends/<int:user_id>', methods=['GET'])
def get_friends(user_id):
    """
    특정 사용자의 모든 친구 목록을 조회합니다.

    'accepted' 상태인 친구 관계만 조회하여, 각 친구의 정보와
    최근 7일간의 운동 점수를 계산하여 함께 반환합니다.
    """
    try:
        friendships = db.session.query(Friendship).filter(
            ((Friendship.user_id == user_id) | (Friendship.friend_id == user_id)) &
            (Friendship.status == 'accepted')
        ).all()
        
        friends_list = []
        for friendship in friendships:
            friend_id = friendship.friend_id if friendship.user_id == user_id else friendship.user_id
            friend = User.query.get(friend_id)
            
            if friend:
                weekly_score = get_user_weekly_score(friend_id)
                
                friends_list.append({
                    'id': friend.id,
                    'username': friend.username,
                    'email': friend.email,
                    'weekly_score': weekly_score,
                    'friendship_since': friendship.created_at.isoformat()
                })
        
        return api_success(data={'friends': friends_list, 'total_count': len(friends_list)}, message="친구 목록 조회 성공")
        
    except Exception as e:
        current_app.logger.error(f"사용자 {user_id}의 친구 목록 조회 중 오류 발생: {e}", exc_info=True)
        return api_error(message="친구 목록 조회 중 서버 오류가 발생했습니다.", status_code=500)

@friends_bp.route('/friends/leaderboard/<int:user_id>', methods=['GET'])
def get_leaderboard(user_id):
    """
    사용자와 친구들의 주간 운동 점수를 기반으로 리더보드를 생성합니다.

    사용자 본인과 모든 친구의 최근 7일간 운동 강도 총합을 계산하여
    점수가 높은 순으로 정렬된 리더보드를 반환합니다.
    """
    try:
        friendships = db.session.query(Friendship).filter(
            ((Friendship.user_id == user_id) | (Friendship.friend_id == user_id)) &
            (Friendship.status == 'accepted')
        ).all()
        
        friend_ids = [f.friend_id if f.user_id == user_id else f.user_id for f in friendships]
        all_user_ids = [user_id] + friend_ids
        
        leaderboard = []
        
        for uid in all_user_ids:
            user = User.query.get(uid)
            if user:
                weekly_score = get_user_weekly_score(uid)
                
                leaderboard.append({
                    'user_id': uid,
                    'username': user.username,
                    'weekly_score': weekly_score,
                    'is_current_user': uid == user_id
                })
        
        leaderboard.sort(key=lambda x: x['weekly_score'], reverse=True)
        
        for i, entry in enumerate(leaderboard):
            entry['rank'] = i + 1
        
        return api_success(
            data={'leaderboard': leaderboard, 'total_participants': len(leaderboard)},
            message="리더보드 조회 성공"
        )
        
    except Exception as e:
        current_app.logger.error(f"사용자 {user_id}의 리더보드 조회 중 오류 발생: {e}", exc_info=True)
        return api_error(message="리더보드 조회 중 서버 오류가 발생했습니다.", status_code=500)

@friends_bp.route('/friends/remove', methods=['DELETE'])
def remove_friend():
    """
    두 사용자 간의 친구 관계를 삭제합니다.

    요청 본문에는 `user_id`와 `friend_id`가 포함되어야 합니다.
    해당하는 친구 관계를 찾아 데이터베이스에서 삭제합니다.
    """
    try:
        data = request.get_json()
        if not data:
            return api_error(message="잘못된 요청입니다. JSON 본문이 필요합니다.")

        user_id = data.get('user_id')
        friend_id = data.get('friend_id')
        
        if not user_id or not friend_id:
            return api_error(message="사용자 ID와 친구 ID가 필요합니다.")
        
        friendship = Friendship.query.filter(
            ((Friendship.user_id == user_id) & (Friendship.friend_id == friend_id)) |
            ((Friendship.user_id == friend_id) & (Friendship.friend_id == user_id))
        ).first()
        
        if not friendship:
            return api_error(message="친구 관계를 찾을 수 없습니다.", status_code=404)
        
        friendship_id_log = friendship.id
        db.session.delete(friendship)
        db.session.commit()
        
        current_app.logger.info(f"친구 관계 {friendship_id_log} (사용자 {user_id}와 {friend_id} 사이)가 삭제되었습니다.")
        return api_success(message="친구 관계가 성공적으로 삭제되었습니다.")
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"친구 삭제 처리 중 오류 발생: {e}", exc_info=True)
        return api_error(message="친구 삭제 처리 중 서버 오류가 발생했습니다.", status_code=500)

