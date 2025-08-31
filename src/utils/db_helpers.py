from datetime import datetime, timedelta
from ..models.user import db
from ..models.exercise_record import ExerciseRecord

def get_user_weekly_score(user_id):
    """
    특정 사용자의 최근 7일간의 운동 강도 총합(주간 점수)을 계산합니다.

    Args:
        user_id: 점수를 계산할 사용자의 ID.

    Returns:
        int: 계산된 주간 점수. 기록이 없으면 0을 반환합니다.
    """
    week_ago = datetime.now() - timedelta(days=7)

    weekly_score = db.session.query(
        db.func.sum(ExerciseRecord.intensity)
    ).filter(
        ExerciseRecord.user_id == user_id,
        ExerciseRecord.created_at >= week_ago
    ).scalar() or 0

    return weekly_score
