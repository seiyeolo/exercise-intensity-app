from flask import Blueprint, current_app
from ..models.exercise_record import ExerciseRecord
from ..utils.response import api_success, api_error

records_bp = Blueprint('records', __name__)

@records_bp.route('/records', methods=['GET'])
def get_records():
    """
    데이터베이스에 저장된 모든 운동 기록을 조회하여 반환합니다.

    Returns:
        Response: 성공 시 모든 운동 기록 리스트를 JSON 형식으로 반환합니다.
                  실패 시 500 에러와 함께 오류 메시지를 반환합니다.
    """
    try:
        records = ExerciseRecord.query.order_by(ExerciseRecord.created_at.desc()).all()
        record_list = [record.to_dict() for record in records]
        return api_success(data=record_list, message="운동 기록 조회 성공")
    except Exception as e:
        current_app.logger.error(f"운동 기록 조회 중 데이터베이스 오류 발생: {e}", exc_info=True)
        return api_error(message="운동 기록을 불러오는 중 서버 오류가 발생했습니다.", status_code=500)
