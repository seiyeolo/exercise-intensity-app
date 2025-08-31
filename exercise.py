from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.exercise_record import ExerciseRecord
from datetime import datetime, date

exercise_bp = Blueprint('exercise', __name__)

@exercise_bp.route('/exercises', methods=['POST'])
def create_exercise_record():
    """운동 기록 생성"""
    try:
        data = request.get_json()
        
        # 필수 필드 검증
        required_fields = ['user_id', 'date', 'time_of_day', 'intensity', 'exercise_type']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field}는 필수 필드입니다.'}), 400
        
        # 강도 값 검증 (0-10)
        if not (0 <= data['intensity'] <= 10):
            return jsonify({'error': '운동 강도는 0-10 사이의 값이어야 합니다.'}), 400
        
        # 날짜 파싱
        try:
            exercise_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': '날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)'}), 400
        
        # 운동 기록 생성
        exercise_record = ExerciseRecord(
            user_id=data['user_id'],
            date=exercise_date,
            time_of_day=data['time_of_day'],
            intensity=data['intensity'],
            exercise_type=data['exercise_type'],
            memo=data.get('memo', '')
        )
        
        db.session.add(exercise_record)
        db.session.commit()
        
        return jsonify({
            'message': '운동 기록이 성공적으로 생성되었습니다.',
            'exercise_record': exercise_record.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@exercise_bp.route('/exercises/<int:user_id>', methods=['GET'])
def get_exercise_records(user_id):
    """사용자의 운동 기록 조회"""
    try:
        # 쿼리 파라미터
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        exercise_type = request.args.get('exercise_type')
        limit = request.args.get('limit', type=int)
        
        # 기본 쿼리
        query = ExerciseRecord.query.filter_by(user_id=user_id)
        
        # 날짜 필터
        if start_date:
            try:
                start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
                query = query.filter(ExerciseRecord.date >= start_date_obj)
            except ValueError:
                return jsonify({'error': '시작 날짜 형식이 올바르지 않습니다.'}), 400
        
        if end_date:
            try:
                end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
                query = query.filter(ExerciseRecord.date <= end_date_obj)
            except ValueError:
                return jsonify({'error': '종료 날짜 형식이 올바르지 않습니다.'}), 400
        
        # 운동 종류 필터
        if exercise_type:
            query = query.filter(ExerciseRecord.exercise_type.ilike(f'%{exercise_type}%'))
        
        # 정렬 및 제한
        query = query.order_by(ExerciseRecord.created_at.desc())
        if limit:
            query = query.limit(limit)
        
        records = query.all()
        
        return jsonify({
            'exercise_records': [record.to_dict() for record in records],
            'total_count': len(records)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@exercise_bp.route('/exercises/<int:record_id>', methods=['PUT'])
def update_exercise_record(record_id):
    """운동 기록 수정"""
    try:
        record = ExerciseRecord.query.get_or_404(record_id)
        data = request.get_json()
        
        # 수정 가능한 필드들
        if 'date' in data:
            try:
                record.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': '날짜 형식이 올바르지 않습니다.'}), 400
        
        if 'time_of_day' in data:
            record.time_of_day = data['time_of_day']
        
        if 'intensity' in data:
            if not (0 <= data['intensity'] <= 10):
                return jsonify({'error': '운동 강도는 0-10 사이의 값이어야 합니다.'}), 400
            record.intensity = data['intensity']
        
        if 'exercise_type' in data:
            record.exercise_type = data['exercise_type']
        
        if 'memo' in data:
            record.memo = data['memo']
        
        record.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': '운동 기록이 성공적으로 수정되었습니다.',
            'exercise_record': record.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@exercise_bp.route('/exercises/<int:record_id>', methods=['DELETE'])
def delete_exercise_record(record_id):
    """운동 기록 삭제"""
    try:
        record = ExerciseRecord.query.get_or_404(record_id)
        
        db.session.delete(record)
        db.session.commit()
        
        return jsonify({'message': '운동 기록이 성공적으로 삭제되었습니다.'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

