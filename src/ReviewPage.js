import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { getProgramName } from './config';
import './ReviewPage.css';

export default function ReviewPage({ program, onGoBack }) {
  const [schoolName, setSchoolName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!teacherName.trim()) {
      setIsError(true);
      setSubmitMessage('선생님 이름을 입력해주세요.');
      return;
    }
    
    if (!content.trim()) {
      setIsError(true);
      setSubmitMessage('리뷰 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setIsError(false);

    try {
      // Firestore에 저장
      await addDoc(collection(db, 'reviews'), {
        program: program,
        schoolName: schoolName.trim() || '미입력',
        maskedTeacherName: teacherName.trim(),
        rating: rating,
        content: content.trim(),
        timestamp: serverTimestamp(),
        isPublic: false,
        isHighlight: false
      });

      // 성공 메시지
      setSubmitMessage('리뷰가 저장되었습니다! 감사합니다.');
      setIsError(false);

      // 입력 필드 초기화
      setSchoolName('');
      setTeacherName('');
      setRating(5);
      setContent('');

      // 3초 후 입력 필드 초기화 후 메시지도 사라짐
      setTimeout(() => {
        setSubmitMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error adding review: ', error);
      setIsError(true);
      setSubmitMessage('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!program) {
    return (
      <div className="review-page error-page">
        <div className="error-container">
          <p>프로그램이 선택되지 않았습니다.</p>
          <button onClick={onGoBack}>뒤로가기</button>
        </div>
      </div>
    );
  }

  const programName = getProgramName(program);

  return (
    <div className="review-page">
      <div className="review-container">
        {/* 헤더 */}
        <div className="review-header">
          <button className="back-button" onClick={onGoBack}>
            ← 뒤로가기
          </button>
          <h1>리뷰 작성</h1>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="review-form">
          {/* 프로그램명 (자동 표시) */}
          <div className="form-group">
            <label className="form-label">프로그램명</label>
            <div className="form-input-disabled">
              {programName}
            </div>
          </div>

          {/* 학교명 */}
          <div className="form-group">
            <label className="form-label optional">학교명</label>
            <input
              type="text"
              className="form-input"
              placeholder="학교명을 입력해주세요 (선택사항)"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
            />
          </div>

          {/* 선생님 이름 */}
          <div className="form-group">
            <label className="form-label required">선생님 이름</label>
            <input
              type="text"
              className="form-input"
              placeholder="선생님 이름을 입력해주세요"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              required
            />
          </div>

          {/* 평가 점수 */}
          <div className="form-group">
            <label className="form-label required">평가 점수</label>
            <div className="rating-buttons">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <button
                  key={score}
                  type="button"
                  className={`rating-button ${rating === score ? 'active' : ''}`}
                  onClick={() => setRating(score)}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>

          {/* 리뷰 내용 */}
          <div className="form-group">
            <label className="form-label required">리뷰 내용</label>
            <textarea
              className="form-textarea"
              placeholder="프로그램 사용 후기를 남겨주세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              required
            />
          </div>

          {/* 제출 메시지 */}
          {submitMessage && (
            <div className={`submit-message ${isError ? 'error' : 'success'}`}>
              {submitMessage}
            </div>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? '저장 중...' : '제출하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
