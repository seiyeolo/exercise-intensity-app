from flask import Blueprint, jsonify
from ..models.exercise_record import ExerciseRecord
from ..models.user import db

records_bp = Blueprint('records', __name__)

@records_bp.route('/records', methods=['GET'])
def get_records():
    """모든 운동 기록을 조회합니다."""
    try:
        records = ExerciseRecord.query.all()
        return jsonify([record.to_dict() for record in records]), 200
    except Exception as e:
        # 데이터베이스 오류나 기타 예외 처리
        # 실제 프로덕션 환경에서는 로깅을 추가하는 것이 좋습니다.
        return jsonify(error=f"운동 기록을 불러오는 중 오류가 발생했습니다: {str(e)}"), 500
