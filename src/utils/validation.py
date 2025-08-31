from functools import wraps
from flask import request, jsonify, current_app, g
from pydantic import ValidationError

def validate_with(schema):
    """
    Pydantic 스키마를 사용하여 요청 본문을 검증하는 데코레이터입니다.

    이 데코레이터는 Flask 라우트 함수에 적용됩니다.
    요청의 JSON 본문을 주어진 Pydantic 스키마와 비교하여 검증합니다.

    검증에 성공하면, 검증된 데이터는 Flask의 `g` 객체 (`g.validated_data`)에 저장되어
    라우트 함수 내에서 안전하게 접근할 수 있습니다.

    검증에 실패하면, 400 Bad Request 응답과 함께 상세한 오류 메시지를 반환합니다.

    Args:
        schema: 검증에 사용할 Pydantic BaseModel 클래스.
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                # 요청 본문에서 JSON 데이터를 가져옵니다.
                data = request.get_json()
                if data is None:
                    return jsonify(error="잘못된 요청입니다. JSON 본문이 필요합니다."), 400

                # 스키마를 사용하여 데이터 검증하고 g 객체에 저장
                g.validated_data = schema(**data)

            except ValidationError as e:
                # Pydantic 검증 오류 처리
                current_app.logger.warning(f"입력값 검증 실패: {e.errors()}")
                return jsonify(error="입력값이 유효하지 않습니다.", details=e.errors()), 400

            except Exception as e:
                # 기타 예외 처리 (예: JSON 파싱 실패)
                current_app.logger.error(f"요청 처리 중 예기치 않은 오류 발생: {e}", exc_info=True)
                return jsonify(error="요청 처리 중 오류가 발생했습니다."), 400

            return f(*args, **kwargs)
        return decorated_function
    return decorator
