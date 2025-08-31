import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, jsonify
from werkzeug.exceptions import NotFound, InternalServerError
from flask_cors import CORS
from src.models.user import db
from src.models.exercise_record import ExerciseRecord
from src.models.friendship import Friendship
from src.routes.user import user_bp
from src.routes.exercise import exercise_bp
from src.routes.friends import friends_bp
from src.routes.statistics import statistics_bp
from src.routes.records import records_bp
from config import Config

import logging

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config.from_object(Config)

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]')
app.logger.info("애플리케이션 시작")

# CORS 설정 - 모든 도메인에서 접근 허용
CORS(app)

# 블루프린트 등록
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(exercise_bp, url_prefix='/api')
app.register_blueprint(friends_bp, url_prefix='/api')
app.register_blueprint(statistics_bp, url_prefix='/api')
app.register_blueprint(records_bp, url_prefix='/api')

# 데이터베이스 초기화
db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    """
    React 애플리케이션의 정적 파일들을 제공합니다.
    요청된 경로에 파일이 존재하면 해당 파일을, 그렇지 않으면 index.html을 반환하여
    클라이언트 사이드 라우팅을 지원합니다.
    """
    static_folder_path = app.static_folder
    if static_folder_path is None:
        app.logger.error("정적 폴더가 설정되지 않았습니다.")
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            app.logger.error("index.html 파일을 찾을 수 없습니다.")
            return "index.html not found", 404

# 공통 에러 핸들러
@app.errorhandler(NotFound)
def handle_not_found(e):
    """404 Not Found 에러를 처리합니다."""
    app.logger.warning(f"요청한 리소스를 찾을 수 없습니다: {e.description}")
    return jsonify(error=f"리소스를 찾을 수 없습니다: {e.description}"), 404

@app.errorhandler(InternalServerError)
def handle_internal_server_error(e):
    """500 Internal Server Error를 처리합니다."""
    app.logger.error(f"서버 내부 오류 발생: {e}")
    return jsonify(error="서버 내부 오류가 발생했습니다."), 500

@app.errorhandler(Exception)
def handle_general_exception(e):
    """처리되지 않은 모든 예외를 처리합니다."""
    app.logger.error(f"예상치 못한 오류 발생: {e}", exc_info=True)
    return jsonify(error=f"예상치 못한 오류가 발생했습니다: {str(e)}"), 500

@app.route('/api/health')
def health_check():
    """API 서버의 상태를 확인하는 엔드포인트입니다."""
    return {'status': 'healthy', 'message': '운동 강도 측정 API 서버가 정상 작동 중입니다.'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

