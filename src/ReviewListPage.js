import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { PROGRAM_CONFIG } from './config';
import './ReviewListPage.css';

export default function ReviewListPage({ onGoBack }) {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    if (selectedProgram) {
      setFilteredReviews(reviews.filter(review => review.program === selectedProgram));
    } else {
      setFilteredReviews(reviews);
    }
  }, [selectedProgram, reviews]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const q = query(collection(db, 'reviews'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const reviewsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));
      
      setReviews(reviewsList);
      setFilteredReviews(reviewsList);
      setError('');
    } catch (err) {
      console.error('Error fetching reviews: ', err);
      setError('리뷰를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const getProgramName = (program) => {
    return PROGRAM_CONFIG[program]?.name || program;
  };

  const formatDate = (date) => {
    if (!date) return '날짜 없음';
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRatingStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(10 - rating);
  };

  return (
    <div className="review-list-page">
      <div className="review-list-container">
        {/* 헤더 */}
        <div className="list-header">
          <button className="back-button" onClick={onGoBack}>
            ← 뒤로가기
          </button>
          <h1>리뷰 보기</h1>
          <p className="list-subtitle">모든 프로그램의 리뷰를 확인해보세요</p>
        </div>

        {/* 프로그램 필터 */}
        <div className="filter-section">
          <label className="filter-label">프로그램 필터:</label>
          <div className="filter-buttons">
            <button
              className={`filter-button ${!selectedProgram ? 'active' : ''}`}
              onClick={() => setSelectedProgram('')}
            >
              전체 ({reviews.length})
            </button>
            {Object.entries(PROGRAM_CONFIG).map(([key, value]) => (
              <button
                key={key}
                className={`filter-button ${selectedProgram === key ? 'active' : ''}`}
                onClick={() => setSelectedProgram(key)}
              >
                {value.name} ({reviews.filter(r => r.program === key).length})
              </button>
            ))}
          </div>
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="loading-state">
            <p>리뷰를 불러오는 중...</p>
          </div>
        )}

        {/* 오류 상태 */}
        {error && (
          <div className="error-state">
            <p>⚠️ {error}</p>
            <button onClick={fetchReviews}>다시 시도</button>
          </div>
        )}

        {/* 리뷰 목록 */}
        {!isLoading && !error && (
          <div className="reviews-list">
            {filteredReviews.length > 0 ? (
              filteredReviews.map(review => (
                <div key={review.id} className="review-card">
                  <div className="review-header-info">
                    <div className="review-title">
                      <h3>{getProgramName(review.program)}</h3>
                      <span className="review-date">{formatDate(review.timestamp)}</span>
                    </div>
                    <div className="review-rating">
                      <span className="stars">{getRatingStars(review.rating)}</span>
                      <span className="rating-number">{review.rating}/10</span>
                    </div>
                  </div>

                  <div className="review-meta">
                    {review.schoolName && review.schoolName !== '미입력' && (
                      <span className="school-name">🏫 {review.schoolName}</span>
                    )}
                    <span className="teacher-name">👨‍🏫 {review.maskedTeacherName}</span>
                  </div>

                  <div className="review-content">
                    <p>{review.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>리뷰가 없습니다.</p>
                {selectedProgram && (
                  <p className="empty-subtitle">
                    {getProgramName(selectedProgram)}에 대한 리뷰를 작성해보세요!
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
