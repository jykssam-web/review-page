export const PROGRAM_CONFIG = {
  campusnotice: {
    name: 'CampusNotice(전자칠판공지)',
    description: '학교 공지사항 관리 프로그램',
    color: '#007AFF'
  }
};

export const getProgramName = (program) => {
  return PROGRAM_CONFIG[program]?.name || program;
};
