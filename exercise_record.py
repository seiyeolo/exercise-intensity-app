from src.models.user import db
from datetime import datetime

class ExerciseRecord(db.Model):
    __tablename__ = 'exercise_records'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time_of_day = db.Column(db.String(20), nullable=False)  # 오전, 오후, 야간, 틈틈이
    intensity = db.Column(db.Integer, nullable=False)  # 0-10
    exercise_type = db.Column(db.String(100), nullable=False)
    memo = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계 설정
    user = db.relationship('User', backref=db.backref('exercise_records', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'date': self.date.isoformat() if self.date else None,
            'time_of_day': self.time_of_day,
            'intensity': self.intensity,
            'exercise_type': self.exercise_type,
            'memo': self.memo,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<ExerciseRecord {self.id}: {self.exercise_type} - {self.intensity}>'

