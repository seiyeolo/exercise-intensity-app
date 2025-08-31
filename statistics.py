from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.exercise_record import ExerciseRecord
from datetime import datetime, timedelta
from sqlalchemy import func

statistics_bp = Blueprint('statistics', __name__)

@statistics_bp.route('/statistics/<int:user_id>', methods=['GET'])
def get_user_statistics(user_id):
    """사용자의 운동 통계 조회"""
    try:
        # 쿼리 파라미터
        period = request.args.get('period', 'week')  # day, week, month, year
        
        # 기간 설정
        now = datetime.now()
        if period == 'day':
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == 'week':
            start_date = now - timedelta(days=7)
        elif period == 'month':
            start_date = now - timedelta(days=30)
        elif period == 'year':
            start_date = now - timedelta(days=365)
        else:
            return jsonify({'error': '유효하지 않은 기간입니다. (day, week, month, year)'}), 400
        
        # 기간 내 운동 기록 조회
        records = ExerciseRecord.query.filter(
            ExerciseRecord.user_id == user_id,
            ExerciseRecord.created_at >= start_date
        ).all()
        
        if not records:
            return jsonify({
                'period': period,
                'total_workouts': 0,
                'average_intensity': 0,
                'max_intensity': 0,
                'total_intensity_score': 0,
                'consistency_score': 0,
                'time_of_day_distribution': {},
                'exercise_type_distribution': {},
                'daily_trends': []
            }), 200
        
        # 기본 통계 계산
        total_workouts = len(records)
        intensities = [record.intensity for record in records]
        average_intensity = sum(intensities) / len(intensities)
        max_intensity = max(intensities)
        total_intensity_score = sum(intensities)
        
        # 일관성 점수 계산 (최근 7일 중 운동한 날의 비율)
        if period == 'week':
            workout_dates = set(record.date for record in records)
            consistency_score = (len(workout_dates) / 7) * 100
        else:
            consistency_score = 0  # 다른 기간에 대해서는 별도 계산 로직 필요
        
        # 시간대별 분포
        time_of_day_distribution = {}
        for record in records:
            time_of_day = record.time_of_day
            time_of_day_distribution[time_of_day] = time_of_day_distribution.get(time_of_day, 0) + 1
        
        # 운동 종류별 분포
        exercise_type_distribution = {}
        for record in records:
            exercise_type = record.exercise_type
            exercise_type_distribution[exercise_type] = exercise_type_distribution.get(exercise_type, 0) + 1
        
        # 일별 추이 (최근 7일)
        daily_trends = []
        for i in range(7):
            date = (now - timedelta(days=6-i)).date()
            day_records = [r for r in records if r.date == date]
            
            if day_records:
                day_avg_intensity = sum(r.intensity for r in day_records) / len(day_records)
                day_workout_count = len(day_records)
            else:
                day_avg_intensity = 0
                day_workout_count = 0
            
            daily_trends.append({
                'date': date.isoformat(),
                'average_intensity': round(day_avg_intensity, 1),
                'workout_count': day_workout_count
            })
        
        return jsonify({
            'period': period,
            'total_workouts': total_workouts,
            'average_intensity': round(average_intensity, 1),
            'max_intensity': max_intensity,
            'total_intensity_score': total_intensity_score,
            'consistency_score': round(consistency_score, 1),
            'time_of_day_distribution': time_of_day_distribution,
            'exercise_type_distribution': exercise_type_distribution,
            'daily_trends': daily_trends
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@statistics_bp.route('/statistics/compare/<int:user_id>/<int:friend_id>', methods=['GET'])
def compare_with_friend(user_id, friend_id):
    """친구와의 운동 통계 비교"""
    try:
        period = request.args.get('period', 'week')
        
        # 기간 설정
        now = datetime.now()
        if period == 'week':
            start_date = now - timedelta(days=7)
        elif period == 'month':
            start_date = now - timedelta(days=30)
        else:
            return jsonify({'error': '비교는 week 또는 month 기간만 지원합니다.'}), 400
        
        # 두 사용자의 운동 기록 조회
        user_records = ExerciseRecord.query.filter(
            ExerciseRecord.user_id == user_id,
            ExerciseRecord.created_at >= start_date
        ).all()
        
        friend_records = ExerciseRecord.query.filter(
            ExerciseRecord.user_id == friend_id,
            ExerciseRecord.created_at >= start_date
        ).all()
        
        # 통계 계산 함수
        def calculate_stats(records):
            if not records:
                return {
                    'total_workouts': 0,
                    'average_intensity': 0,
                    'total_score': 0
                }
            
            intensities = [r.intensity for r in records]
            return {
                'total_workouts': len(records),
                'average_intensity': round(sum(intensities) / len(intensities), 1),
                'total_score': sum(intensities)
            }
        
        user_stats = calculate_stats(user_records)
        friend_stats = calculate_stats(friend_records)
        
        # 일별 비교 데이터
        comparison_data = []
        days = 7 if period == 'week' else 30
        
        for i in range(days):
            date = (now - timedelta(days=days-1-i)).date()
            
            user_day_records = [r for r in user_records if r.date == date]
            friend_day_records = [r for r in friend_records if r.date == date]
            
            user_day_avg = sum(r.intensity for r in user_day_records) / len(user_day_records) if user_day_records else 0
            friend_day_avg = sum(r.intensity for r in friend_day_records) / len(friend_day_records) if friend_day_records else 0
            
            comparison_data.append({
                'date': date.isoformat(),
                'user_intensity': round(user_day_avg, 1),
                'friend_intensity': round(friend_day_avg, 1)
            })
        
        return jsonify({
            'period': period,
            'user_stats': user_stats,
            'friend_stats': friend_stats,
            'comparison_data': comparison_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@statistics_bp.route('/statistics/global', methods=['GET'])
def get_global_statistics():
    """전체 사용자 통계 (익명화된 데이터)"""
    try:
        # 최근 30일간의 전체 통계
        thirty_days_ago = datetime.now() - timedelta(days=30)
        
        # 전체 운동 기록 수
        total_records = ExerciseRecord.query.filter(
            ExerciseRecord.created_at >= thirty_days_ago
        ).count()
        
        # 활성 사용자 수 (최근 30일간 운동 기록이 있는 사용자)
        active_users = db.session.query(ExerciseRecord.user_id).filter(
            ExerciseRecord.created_at >= thirty_days_ago
        ).distinct().count()
        
        # 평균 운동 강도
        avg_intensity_result = db.session.query(func.avg(ExerciseRecord.intensity)).filter(
            ExerciseRecord.created_at >= thirty_days_ago
        ).scalar()
        
        avg_intensity = round(avg_intensity_result, 1) if avg_intensity_result else 0
        
        # 인기 운동 종류 (상위 5개)
        popular_exercises = db.session.query(
            ExerciseRecord.exercise_type,
            func.count(ExerciseRecord.id).label('count')
        ).filter(
            ExerciseRecord.created_at >= thirty_days_ago
        ).group_by(ExerciseRecord.exercise_type).order_by(
            func.count(ExerciseRecord.id).desc()
        ).limit(5).all()
        
        popular_exercises_list = [
            {'exercise_type': exercise[0], 'count': exercise[1]}
            for exercise in popular_exercises
        ]
        
        return jsonify({
            'period': '30_days',
            'total_workout_records': total_records,
            'active_users': active_users,
            'average_intensity': avg_intensity,
            'popular_exercises': popular_exercises_list
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

