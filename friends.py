from flask import Blueprint, request, jsonify
from src.models.user import db, User
from src.models.friendship import Friendship
from src.models.exercise_record import ExerciseRecord
from datetime import datetime, timedelta

friends_bp = Blueprint('friends', __name__)

@friends_bp.route('/friends/request', methods=['POST'])
def send_friend_request():
    """친구 요청 보내기"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        friend_username = data.get('friend_username')
        
        if not user_id or not friend_username:
            return jsonify({'error': '사용자 ID와 친구 사용자명이 필요합니다.'}), 400
        
        # 친구 사용자 찾기
        friend = User.query.filter_by(username=friend_username).first()
        if not friend:
            return jsonify({'error': '해당 사용자를 찾을 수 없습니다.'}), 404
        
        # 자기 자신에게 친구 요청 방지
        if user_id == friend.id:
            return jsonify({'error': '자기 자신에게는 친구 요청을 보낼 수 없습니다.'}), 400
        
        # 이미 친구 관계가 있는지 확인
        existing_friendship = Friendship.query.filter(
            ((Friendship.user_id == user_id) & (Friendship.friend_id == friend.id)) |
            ((Friendship.user_id == friend.id) & (Friendship.friend_id == user_id))
        ).first()
        
        if existing_friendship:
            return jsonify({'error': '이미 친구 관계가 존재합니다.'}), 400
        
        # 친구 요청 생성
        friendship = Friendship(
            user_id=user_id,
            friend_id=friend.id,
            status='pending'
        )
        
        db.session.add(friendship)
        db.session.commit()
        
        return jsonify({
            'message': '친구 요청이 성공적으로 전송되었습니다.',
            'friendship': friendship.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify(error=f"친구 요청 처리 중 오류 발생: {str(e)}"), 500

@friends_bp.route('/friends/accept', methods=['POST'])
def accept_friend_request():
    """친구 요청 수락"""
    try:
        data = request.get_json()
        friendship_id = data.get('friendship_id')
        
        if not friendship_id:
            return jsonify({'error': '친구 관계 ID가 필요합니다.'}), 400
        
        friendship = Friendship.query.get_or_404(friendship_id)
        
        if friendship.status != 'pending':
            return jsonify({'error': '대기 중인 친구 요청이 아닙니다.'}), 400
        
        friendship.status = 'accepted'
        friendship.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': '친구 요청이 수락되었습니다.',
            'friendship': friendship.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify(error=f"친구 요청 수락 중 오류 발생: {str(e)}"), 500

@friends_bp.route('/friends/<int:user_id>', methods=['GET'])
def get_friends(user_id):
    """사용자의 친구 목록 조회"""
    try:
        # 수락된 친구 관계만 조회
        friendships = db.session.query(Friendship).filter(
            ((Friendship.user_id == user_id) | (Friendship.friend_id == user_id)) &
            (Friendship.status == 'accepted')
        ).all()
        
        friends = []
        for friendship in friendships:
            # 친구 ID 결정
            friend_id = friendship.friend_id if friendship.user_id == user_id else friendship.user_id
            friend = User.query.get(friend_id)
            
            if friend:
                # 친구의 최근 운동 통계 계산
                week_ago = datetime.now() - timedelta(days=7)
                recent_records = ExerciseRecord.query.filter(
                    ExerciseRecord.user_id == friend_id,
                    ExerciseRecord.created_at >= week_ago
                ).all()
                
                weekly_score = sum(record.intensity for record in recent_records)
                
                friends.append({
                    'id': friend.id,
                    'username': friend.username,
                    'email': friend.email,
                    'weekly_score': weekly_score,
                    'friendship_since': friendship.created_at.isoformat()
                })
        
        return jsonify({
            'friends': friends,
            'total_count': len(friends)
        }), 200
        
    except Exception as e:
        return jsonify(error=f"친구 목록 조회 중 오류 발생: {str(e)}"), 500

@friends_bp.route('/friends/leaderboard/<int:user_id>', methods=['GET'])
def get_leaderboard(user_id):
    """친구들과의 리더보드 조회"""
    try:
        # 사용자의 친구들 ID 가져오기
        friendships = db.session.query(Friendship).filter(
            ((Friendship.user_id == user_id) | (Friendship.friend_id == user_id)) &
            (Friendship.status == 'accepted')
        ).all()
        
        friend_ids = []
        for friendship in friendships:
            friend_id = friendship.friend_id if friendship.user_id == user_id else friendship.user_id
            friend_ids.append(friend_id)
        
        # 사용자 본인도 포함
        all_user_ids = [user_id] + friend_ids
        
        # 최근 7일간의 운동 점수 계산
        week_ago = datetime.now() - timedelta(days=7)
        leaderboard = []
        
        for uid in all_user_ids:
            user = User.query.get(uid)
            if user:
                recent_records = ExerciseRecord.query.filter(
                    ExerciseRecord.user_id == uid,
                    ExerciseRecord.created_at >= week_ago
                ).all()
                
                weekly_score = sum(record.intensity for record in recent_records)
                
                leaderboard.append({
                    'user_id': uid,
                    'username': user.username,
                    'weekly_score': weekly_score,
                    'is_current_user': uid == user_id
                })
        
        # 점수 순으로 정렬
        leaderboard.sort(key=lambda x: x['weekly_score'], reverse=True)
        
        # 순위 추가
        for i, entry in enumerate(leaderboard):
            entry['rank'] = i + 1
        
        return jsonify({
            'leaderboard': leaderboard,
            'total_participants': len(leaderboard)
        }), 200
        
    except Exception as e:
        return jsonify(error=f"리더보드 조회 중 오류 발생: {str(e)}"), 500

@friends_bp.route('/friends/remove', methods=['DELETE'])
def remove_friend():
    """친구 관계 삭제"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        friend_id = data.get('friend_id')
        
        if not user_id or not friend_id:
            return jsonify({'error': '사용자 ID와 친구 ID가 필요합니다.'}), 400
        
        # 친구 관계 찾기
        friendship = Friendship.query.filter(
            ((Friendship.user_id == user_id) & (Friendship.friend_id == friend_id)) |
            ((Friendship.user_id == friend_id) & (Friendship.friend_id == user_id))
        ).first()
        
        if not friendship:
            return jsonify({'error': '친구 관계를 찾을 수 없습니다.'}), 404
        
        db.session.delete(friendship)
        db.session.commit()
        
        return jsonify({'message': '친구 관계가 성공적으로 삭제되었습니다.'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify(error=f"친구 삭제 처리 중 오류 발생: {str(e)}"), 500

