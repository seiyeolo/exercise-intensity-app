from flask import jsonify

def api_success(data=None, message="성공", status_code=200):
    """
    성공적인 API 응답을 위한 표준 형식을 생성합니다.

    Args:
        data: 클라이언트에게 전달할 데이터 (dict 또는 list).
        message: 응답 메시지.
        status_code: HTTP 상태 코드.

    Returns:
        Response: Flask Response 객체.
    """
    response = {
        'status': 'success',
        'message': message
    }
    if data is not None:
        response['data'] = data
    return jsonify(response), status_code

def api_error(message="오류가 발생했습니다.", status_code=400, error_code=None):
    """
    API 오류 응답을 위한 표준 형식을 생성합니다.

    Args:
        message: 클라이언트에게 전달할 오류 메시지.
        status_code: HTTP 상태 코드.
        error_code: 애플리케이션별 특정 에러 코드 (선택 사항).

    Returns:
        Response: Flask Response 객체.
    """
    response = {
        'status': 'error',
        'message': message
    }
    if error_code:
        response['error_code'] = error_code
    return jsonify(response), status_code
