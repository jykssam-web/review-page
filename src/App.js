import React, { useState, useEffect } from 'react';
import ReviewPage from './ReviewPage';
import ReviewListPage from './ReviewListPage';
import AdminPage from './AdminPage';
import './App.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState('menu');
  const [selectedProgram, setSelectedProgram] = useState('');

  useEffect(() => {
    // URL 파라미터로 페이지 결정
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    const program = params.get('program');

    if (page === 'reviews') {
      setCurrentPage('reviews');
    } else if (page === 'write') {
      if (program) {
        setSelectedProgram(program);
        setCurrentPage('write');
      }
    } else if (page === 'admin') {
      setCurrentPage('admin');
    } else {
      setCurrentPage('menu');
    }
  }, []);

  const handleSelectProgram = (program) => {
    setSelectedProgram(program);
    setCurrentPage('write');
    window.history.pushState({}, '', `?page=write&program=${program}`);
  };

  const handleGoToMenu = () => {
    setCurrentPage('menu');
    setSelectedProgram('');
    window.history.pushState({}, '', '/');
  };

  const handleGoToReviews = () => {
    setCurrentPage('reviews');
    window.history.pushState({}, '', '?page=reviews');
  };

  if (currentPage === 'menu') {
    return <MenuPage onSelectProgram={handleSelectProgram} onGoToReviews={handleGoToReviews} />;
  } else if (currentPage === 'write') {
    return <ReviewPage program={selectedProgram} onGoBack={handleGoToMenu} />;
  } else if (currentPage === 'reviews') {
    return <ReviewListPage onGoBack={handleGoToMenu} />;
  } else if (currentPage === 'admin') {
    return <AdminPage onGoBack={handleGoToMenu} />;
  }
}

function MenuPage({ onSelectProgram, onGoToReviews }) {
  return (
    <div className="menu-page">
      <div className="menu-container">
        <div className="menu-header">
          <h1>🎓 교사용 프로그램 리뷰</h1>
          <p>프로그램을 선택하고 리뷰를 남겨주세요</p>
        </div>

        <div className="menu-buttons">
          <button className="menu-button write-button" onClick={() => onSelectProgram('campusnotice')}>
            ✍️ 리뷰 작성
            <span className="button-subtitle">CampusNotice(전자칠판공지)</span>
          </button>

          <button className="menu-button reviews-button" onClick={onGoToReviews}>
            📖 리뷰 보기
            <span className="button-subtitle">모든 프로그램의 리뷰</span>
          </button>
        </div>

        <div className="menu-footer">
          <p>💡 팁: 프로그램 사용 후 솔직한 의견을 남겨주세요!</p>
        </div>
      </div>
    </div>
  );
}
