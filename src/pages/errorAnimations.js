
export const animationCss = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes bounceSoft {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  @keyframes spinSoft {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes signal {
    0%, 100% { opacity: 0.35; transform: scale(0.95); }
    50% { opacity: 1; transform: scale(1.05); }
  }
`;
