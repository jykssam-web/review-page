import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { PROGRAM_CONFIG } from './config';
import './AdminPage.css';

// Firebase Auth 초기화
const firebaseConfig = {
  apiKey: "AIzaSyBL-aN5qf0SJzFgxvuQwjKxGuE5KgXPuKI",
  projectId: "gen-lang-client-0617105081",
  appId: "1:84076770878:web:b1b279a176354212b0036f",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const ADMIN_EMAIL = 'jykssam@gmail.com';

export default function AdminPage({ onGoBack }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved

  useEffect(() => {
    // 현재 사용자 확인
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user && user.email === ADMIN_EMAIL) {
      fetchReviews();
    }
  }, [user]);

  useEffect(() => {
    filterReviews();
  }, [reviews, selectedProgram, filterStatus, filterReviews]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      if (result.user.email !== ADMIN_EMAIL) {
        await signOut(auth);
        alert('관리자 이메일로만 접근 가능합니다.');
        setUser(null);
      }
    } catch (error) {
      console.error('로그인 실패:', error);
      alert('로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const q = query(collection(db, 'reviews'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const reviewsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));
      
      setReviews(reviewsList);
    } catch (error) {
      console.error('리뷰 불러오기 실패:', error);
    }
  };

  const filterReviews = () => {
    let filtered = reviews;

    if (selectedProgram) {
      filtered = filtered.filter(r => r.program === selectedProgram);
    }

    if (filterStatus === 'pending') {
      filtered = filtered.filter(r => !r.isPublic);
    } else if (filterStatus === 'approved') {
      filtered = filtered.filter(r => r.isPublic);
    }

    setFilteredReviews(filtered);
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

  // 로그인 전
  if (!user) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <div className="login-section">
            <button className="back-button" onClick={onGoBack}>
              ← 뒤로가기
            </button>
            <h1>🔐 관리자 페이지</h1>
            <p>Google 계정으로 로그인하세요</p>
            
            <button 
              className="google-login-button"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? '로그인 중...' : '🔷 Google로 로그인'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 관리자가 아님
  if (user.email !== ADMIN_EMAIL) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <div className="error-section">
            <h1>접근 불가</h1>
            <p>관리자 이메일로만 접근 가능합니다.</p>
            <p className="current-email">현재 로그인: {user.email}</p>
            
            <button className="logout-button" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 관리자 대시보드
  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* 헤더 */}
        <div className="admin-header">
          <div className="header-top">
            <button className="back-button" onClick={onGoBack}>
              ← 뒤로가기
            </button>
            <h1>🔐 관리자 대시보드</h1>
            <div className="user-info">
              <span>{user.email}</span>
              <button className="logout-button" onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          </div>
        </div>

        {/* 필터 */}
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

        {/* 리뷰 목록 */}
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
