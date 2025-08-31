import os

class Config:
    """애플리케이션 설정 값을 담고 있는 클래스"""

    # Flask 시크릿 키
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'asdf#FGSgvasgf$5$WGT'

    # 데이터베이스 설정
    # os.path.dirname(__file__)는 현재 파일(config.py)의 디렉토리를 가리킵니다.
    # '..'를 사용하여 상위 디렉토리(프로젝트 루트)로 이동합니다.
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    DATABASE_DIR = os.path.join(BASE_DIR, 'database')

    # 데이터베이스 디렉토리가 없으면 생성
    if not os.path.exists(DATABASE_DIR):
        os.makedirs(DATABASE_DIR)

    SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(DATABASE_DIR, 'app.db')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
