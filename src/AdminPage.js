import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { PROGRAM_CONFIG } from './config';
import './AdminPage.css';

const ADMIN_PASSWORD = 'rhksflwksms0!';

export default function AdminPage({ onGoBack }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (isAuthenticated) {
      fetchReviews();
    }
  }, [isAuthenticated]);

  const fetchReviews = async () => {
    try {
      const q = query(collection(db, 'reviews'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const reviewsList = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
        timestamp: docSnap.data().timestamp?.toDate()
      }));
      
      setReviews(reviewsList);
    } catch (error) {
      console.error('리뷰 불러오기 실패:', error);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('비밀번호가 틀렸습니다.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    setPasswordError('');
  };

  const getFilteredReviews = () => {
    let filtered = reviews;

    if (selectedProgram) {
      filtered = filtered.filter(r => r.program === selectedProgram);
    }

    if (filterStatus === 'pending') {
      filtered = filtered.filter(r => !r.isPublic);
    } else if (filterStatus === 'approved') {
      filtered = filtered.filter(r => r.isPublic);
    }

    return filtered;
  };

  const handleApprove = async (reviewId) => {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      await updateDoc(reviewRef, { isPublic: true });
      fetchReviews();
    } catch (error) {
      console.error('승인 실패:', error);
      alert('승인에 실패했습니다.');
    }
  };

  const handleReject = async (reviewId) => {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      await updateDoc(reviewRef, { isPublic: false });
      fetchReviews();
    } catch (error) {
      console.error('거절 실패:', error);
      alert('거절에 실패했습니다.');
    }
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await deleteDoc(doc(db, 'reviews', reviewId));
        fetchReviews();
      } catch (error) {
        console.error('삭제 실패:', error);
        alert('삭제에 실패했습니다.');
      }
    }
  };

  const handleHighlight = async (reviewId, currentHighlight) => {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      await updateDoc(reviewRef, { isHighlight: !currentHighlight });
      fetchReviews();
    } catch (error) {
      console.error('하이라이트 설정 실패:', error);
      alert('하이라이트 설정에 실패했습니다.');
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredReviews = getFilteredReviews();

  if (!isAuthenticated) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <div className="login-section">
            <button className="back-button" onClick={onGoBack}>
              ← 뒤로가기
            </button>
            <h1>🔐 관리자 페이지</h1>
            <p>비밀번호를 입력하세요</p>
            
            <form onSubmit={handlePasswordSubmit} className="password-form">
              <input
                type="password"
                className="password-input"
                placeholder="비밀번호 입력"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              <button type="submit" className="login-button">
                로그인
              </button>
            </form>

            {passwordError && (
              <p className="password-error">{passwordError}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div className="header-top">
            <button className="back-button" onClick={onGoBack}>
              ← 뒤로가기
            </button>
            <h1>🔐 관리자 대시보드</h1>
            <button className="logout-button" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        </div>

        <div className="filter-section">
          <div className="filter-row">
            <div className="filter-group">
              <label>상태:</label>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">전체 ({reviews.length})</option>
                <option value="pending">
                  승인 대기 ({reviews.filter(r => !r.isPublic).length})
                </option>
                <option value="approved">
                  승인됨 ({reviews.filter(r => r.isPublic).length})
                </option>
              </select>
            </div>

            <div className="filter-group">
              <label>프로그램:</label>
              <select 
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="filter-select"
              >
                <option value="">전체</option>
                {Object.entries(PROGRAM_CONFIG).map(([key, value]) => (
                  <option key={key} value={key}>{value.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="reviews-section">
          {filteredReviews.length > 0 ? (
            <div className="admin-reviews-list">
              {filteredReviews.map(review => (
                <div key={review.id} className={`admin-review-card ${!review.isPublic ? 'pending' : ''} ${review.isHighlight ? 'highlighted' : ''}`}>
                  <div className="review-header">
                    <div className="review-info">
                      <h3>{getProgramName(review.program)}</h3>
                      <div className="review-meta">
                        <span className="teacher">{review.maskedTeacherName}</span>
                        {review.schoolName && review.schoolName !== '미입력' && (
                          <span className="school">{review.schoolName}</span>
                        )}
                        <span className="date">{formatDate(review.timestamp)}</span>
                      </div>
                    </div>
                    <div className="review-rating">
                      <span className="rating-badge">{review.rating}/10</span>
                    </div>
                  </div>

                  <div className="review-content">
                    <p>{review.content}</p>
                  </div>

                  <div className="review-status">
                    <span className={`status-badge ${review.isPublic ? 'approved' : 'pending'}`}>
                      {review.isPublic ? '✅ 승인됨' : '⏳ 승인 대기'}
                    </span>
                    {review.isHighlight && <span className="highlight-badge">⭐ 하이라이트</span>}
                  </div>

                  <div className="review-actions">
                    {!review.isPublic ? (
                      <>
                        <button 
                          className="btn btn-approve"
                          onClick={() => handleApprove(review.id)}
                        >
                          ✅ 승인
                        </button>
                        <button 
                          className="btn btn-reject"
                          onClick={() => handleReject(review.id)}
                        >
                          ❌ 거절
                        </button>
                      </>
                    ) : (
                      <button 
                        className="btn btn-reject"
                        onClick={() => handleReject(review.id)}
                      >
                        비공개
                      </button>
                    )}
                    
                    <button 
                      className={`btn ${review.isHighlight ? 'btn-unhighlight' : 'btn-highlight'}`}
                      onClick={() => handleHighlight(review.id, review.isHighlight)}
                    >
                      {review.isHighlight ? '⭐ 해제' : '⭐ 추천'}
                    </button>

                    <button 
                      className="btn btn-delete"
                      onClick={() => handleDelete(review.id)}
                    >
                      🗑️ 삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>리뷰가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
