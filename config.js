export const PROGRAM_CONFIG = {
  campusnotice: {
    name: '학사공지',
    description: '학사공지 프로그램',
    color: '#007AFF'
  },
  mealplan: {
    name: '급식 계획',
    description: '급식 계획 프로그램',
    color: '#FF9500'
  },
  attendance: {
    name: '출석 관리',
    description: '출석 관리 프로그램',
    color: '#34C759'
  }
};

export const getProgramName = (program) => {
  return PROGRAM_CONFIG[program]?.name || program;
};
