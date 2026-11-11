import { Link } from 'react-router-dom';

export default function QuizCard({ quiz, questionCount, latestAttempt }) {
  return (
    <article className="quiz-card">
      <div className="quiz-card-top">
        <span className={`level-badge level-${quiz.level.toLowerCase()}`}>{quiz.level}</span>
        <span className="muted">{questionCount} câu hỏi</span>
      </div>
      <h3>{quiz.title}</h3>
      <p>{quiz.description}</p>
      <div className="quiz-meta">
        <span>⏱ {quiz.durationMinutes} phút</span>
        <span>✓ Đạt từ {quiz.passingScore}%</span>
      </div>
      {latestAttempt && (
        <div className={`attempt-chip ${latestAttempt.passed ? 'passed' : 'failed'}`}>
          Lần gần nhất: {latestAttempt.percent}% · {latestAttempt.passed ? 'Đạt' : 'Chưa đạt'}
        </div>
      )}
      <Link className="button button-primary button-block" to={`/quizzes/${quiz.id}`}>
        Xem bài thi
      </Link>
    </article>
  );
}
