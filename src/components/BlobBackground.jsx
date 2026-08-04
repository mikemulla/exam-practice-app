const AMOUNTS = {
  minimal: 1,
  compact: 2,
  balanced: 3,
  full: 4,
};

function BlobBackground({ amount = "balanced", orientation = "balanced" }) {
  const blobCount =
    typeof amount === "number" ? amount : AMOUNTS[amount] || AMOUNTS.balanced;
  const blobs = ["hero", "copy", "preview", "tail"].slice(0, blobCount);

  return (
    <>
      <style>{`
        @keyframes blobDriftHero {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg) scale(1); }
          50% { transform: translate3d(22px, -18px, 0) rotate(4deg) scale(1.04); }
        }

        @keyframes blobDriftCopy {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg) scale(1); }
          50% { transform: translate3d(-18px, 18px, 0) rotate(-5deg) scale(1.03); }
        }

        @keyframes blobDriftPreview {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg) scale(1); }
          50% { transform: translate3d(18px, 20px, 0) rotate(3deg) scale(1.035); }
        }

        .blob-field {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
          isolation: isolate;
        }

        .blob-field::before {
          content: "";
          position: absolute;
          inset: -18% -12%;
          background:
            radial-gradient(circle at 78% 20%, rgba(45, 169, 255, 0.24), transparent 32%),
            radial-gradient(circle at 8% 40%, rgba(45, 212, 191, 0.16), transparent 28%),
            radial-gradient(circle at 84% 88%, rgba(24, 95, 165, 0.15), transparent 34%);
          filter: blur(48px);
          opacity: 0.82;
          transform: translateZ(0);
        }

        .ambient-blob {
          position: absolute;
          display: block;
          transform: translateZ(0);
          will-change: transform;
          box-shadow: var(--blob-edge);
          transition: opacity 0.3s ease, filter 0.3s ease, box-shadow 0.3s ease;
        }

        .ambient-blob::before,
        .ambient-blob::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
        }

        .ambient-blob::before {
          background: inherit;
          filter: blur(var(--blob-blur));
          opacity: var(--blob-glow);
          transform: scale(1.08);
        }

        .ambient-blob::after {
          background:
            radial-gradient(circle at 28% 24%, rgba(255,255,255,0.72), transparent 24%),
            radial-gradient(circle at 72% 70%, rgba(255,255,255,0.12), transparent 32%);
          opacity: 0.34;
          mix-blend-mode: screen;
        }

        .ambient-blob--hero {
          top: clamp(-180px, -10vw, -92px);
          right: clamp(-210px, -12vw, -100px);
          width: clamp(420px, 43vw, 680px);
          height: clamp(390px, 40vw, 640px);
          border-radius: 54% 46% 62% 38% / 42% 54% 46% 58%;
          background:
            radial-gradient(circle at 30% 28%, rgba(173, 238, 255, 0.95), transparent 24%),
            radial-gradient(circle at 66% 34%, rgba(62, 139, 255, 0.72), transparent 34%),
            radial-gradient(circle at 56% 78%, rgba(45, 212, 191, 0.62), transparent 44%),
            linear-gradient(135deg, rgba(24, 95, 165, 0.5), rgba(96, 165, 250, 0.34));
          --blob-blur: 28px;
          --blob-glow: 0.48;
          --blob-edge: 0 60px 110px -25px rgba(15, 90, 166, 0.22);
          opacity: 0.7;
          animation: blobDriftHero 22s ease-in-out infinite;
        }

        .ambient-blob--copy {
          top: clamp(118px, 18vw, 230px);
          left: clamp(-170px, -10vw, -92px);
          width: clamp(260px, 27vw, 430px);
          height: clamp(260px, 26vw, 420px);
          border-radius: 44% 56% 48% 52% / 58% 42% 58% 42%;
          background:
            radial-gradient(circle at 36% 32%, rgba(178, 255, 235, 0.8), transparent 26%),
            radial-gradient(circle at 62% 70%, rgba(20, 184, 166, 0.52), transparent 46%),
            linear-gradient(140deg, rgba(34, 197, 94, 0.26), rgba(56, 189, 248, 0.34));
          --blob-blur: 34px;
          --blob-glow: 0.36;
          --blob-edge: 0 40px 84px -26px rgba(20, 184, 166, 0.2);
          opacity: 0.45;
          animation: blobDriftCopy 26s ease-in-out infinite;
        }

        .ambient-blob--preview {
          right: clamp(-190px, -8vw, -80px);
          bottom: clamp(-230px, -14vw, -120px);
          width: clamp(360px, 36vw, 560px);
          height: clamp(330px, 34vw, 520px);
          border-radius: 61% 39% 47% 53% / 46% 58% 42% 54%;
          background:
            radial-gradient(circle at 30% 24%, rgba(219, 234, 254, 0.95), transparent 24%),
            radial-gradient(circle at 68% 64%, rgba(59, 130, 246, 0.56), transparent 42%),
            linear-gradient(140deg, rgba(14, 165, 233, 0.34), rgba(99, 102, 241, 0.2));
          --blob-blur: 38px;
          --blob-glow: 0.38;
          --blob-edge: 0 46px 96px -28px rgba(59, 130, 246, 0.18);
          opacity: 0.5;
          animation: blobDriftPreview 24s ease-in-out infinite;
        }

        .ambient-blob--tail {
          left: clamp(18%, 24vw, 360px);
          top: clamp(660px, 72vh, 920px);
          width: clamp(240px, 25vw, 420px);
          height: clamp(220px, 23vw, 390px);
          border-radius: 50% 50% 42% 58% / 60% 42% 58% 40%;
          background:
            radial-gradient(circle at 34% 28%, rgba(224, 242, 254, 0.82), transparent 26%),
            radial-gradient(circle at 70% 66%, rgba(14, 165, 233, 0.36), transparent 42%),
            linear-gradient(145deg, rgba(45, 212, 191, 0.24), rgba(24, 95, 165, 0.2));
          --blob-blur: 36px;
          --blob-glow: 0.28;
          --blob-edge: 0 38px 84px -30px rgba(14, 165, 233, 0.16);
          opacity: 0.36;
          animation: blobDriftCopy 30s ease-in-out infinite reverse;
        }

        .blob-field--compact::before {
          opacity: 0.58;
        }

        .blob-field--compact .ambient-blob--hero {
          width: clamp(320px, 36vw, 520px);
          height: clamp(300px, 34vw, 500px);
          opacity: 0.54;
        }

        .blob-field--compact .ambient-blob--copy {
          top: clamp(160px, 28vw, 260px);
          opacity: 0.28;
        }

        .blob-field--wide .ambient-blob--hero {
          width: clamp(460px, 46vw, 740px);
          height: clamp(420px, 42vw, 680px);
        }

        .blob-field--detail .ambient-blob--copy {
          top: clamp(180px, 24vw, 300px);
        }

        .blob-field--long .ambient-blob--tail,
        .blob-field--wide .ambient-blob--tail {
          top: clamp(760px, 88vh, 1120px);
        }

        .blob-field--form .ambient-blob--preview {
          bottom: clamp(-260px, -18vw, -150px);
          opacity: 0.32;
        }

        body.dark-mode .blob-field::before {
          background:
            radial-gradient(circle at 78% 20%, rgba(56, 189, 248, 0.22), transparent 32%),
            radial-gradient(circle at 8% 40%, rgba(45, 212, 191, 0.14), transparent 28%),
            radial-gradient(circle at 84% 88%, rgba(59, 130, 246, 0.18), transparent 34%);
          opacity: 0.58;
        }

        body.dark-mode .ambient-blob::after {
          background:
            radial-gradient(circle at 28% 24%, rgba(241,245,249,0.2), transparent 22%),
            radial-gradient(circle at 50% 50%, transparent 54%, rgba(125,211,252,0.2) 70%, transparent 78%),
            radial-gradient(circle at 72% 70%, rgba(125,211,252,0.12), transparent 32%);
          opacity: 0.42;
        }

        body.dark-mode .ambient-blob--hero {
          background:
            radial-gradient(circle at 28% 24%, rgba(125, 211, 252, 0.5), transparent 26%),
            radial-gradient(circle at 68% 34%, rgba(59, 130, 246, 0.52), transparent 38%),
            radial-gradient(circle at 58% 78%, rgba(45, 212, 191, 0.3), transparent 46%),
            linear-gradient(135deg, rgba(30, 64, 175, 0.5), rgba(14, 165, 233, 0.26));
          --blob-glow: 0.44;
          --blob-edge: 0 0 0 1px rgba(125, 211, 252, 0.22), 0 0 46px rgba(56, 189, 248, 0.22), inset 0 0 42px rgba(125, 211, 252, 0.18);
          opacity: 0.58;
        }

        body.dark-mode .ambient-blob--copy {
          background:
            radial-gradient(circle at 34% 30%, rgba(153, 246, 228, 0.36), transparent 28%),
            radial-gradient(circle at 62% 70%, rgba(20, 184, 166, 0.34), transparent 48%),
            linear-gradient(140deg, rgba(16, 185, 129, 0.18), rgba(56, 189, 248, 0.22));
          --blob-glow: 0.3;
          --blob-edge: 0 0 0 1px rgba(45, 212, 191, 0.18), 0 0 38px rgba(45, 212, 191, 0.16), inset 0 0 34px rgba(153, 246, 228, 0.12);
          opacity: 0.36;
        }

        body.dark-mode .ambient-blob--preview {
          background:
            radial-gradient(circle at 30% 24%, rgba(147, 197, 253, 0.32), transparent 26%),
            radial-gradient(circle at 68% 64%, rgba(59, 130, 246, 0.38), transparent 44%),
            linear-gradient(140deg, rgba(14, 165, 233, 0.24), rgba(129, 140, 248, 0.2));
          --blob-glow: 0.34;
          --blob-edge: 0 0 0 1px rgba(96, 165, 250, 0.16), 0 0 50px rgba(59, 130, 246, 0.2), inset 0 0 44px rgba(129, 140, 248, 0.12);
          opacity: 0.42;
        }

        body.dark-mode .ambient-blob--tail {
          background:
            radial-gradient(circle at 34% 28%, rgba(125, 211, 252, 0.28), transparent 28%),
            radial-gradient(circle at 70% 66%, rgba(14, 165, 233, 0.24), transparent 44%),
            linear-gradient(145deg, rgba(45, 212, 191, 0.16), rgba(30, 64, 175, 0.2));
          --blob-glow: 0.24;
          --blob-edge: 0 0 0 1px rgba(56, 189, 248, 0.14), 0 0 42px rgba(14, 165, 233, 0.14);
          opacity: 0.3;
        }

        body.dark-mode .blob-field--compact::before {
          opacity: 0.42;
        }

        @media (max-width: 820px) {
          .blob-field::before {
            inset: -12% -28%;
            filter: blur(54px);
            opacity: 0.68;
          }

          .ambient-blob--hero {
            top: -150px;
            right: -190px;
            width: min(118vw, 470px);
            height: min(104vw, 420px);
            --blob-blur: 24px;
            opacity: 0.62;
          }

          .ambient-blob--copy {
            top: 150px;
            left: -210px;
            width: min(92vw, 360px);
            height: min(82vw, 330px);
            --blob-blur: 32px;
            opacity: 0.34;
          }

          .ambient-blob--preview {
            right: -210px;
            bottom: -190px;
            width: min(115vw, 430px);
            height: min(105vw, 400px);
            --blob-blur: 34px;
            opacity: 0.42;
          }

          .ambient-blob--tail {
            left: -150px;
            top: clamp(560px, 72vh, 780px);
            width: min(88vw, 340px);
            height: min(78vw, 310px);
            --blob-blur: 34px;
            opacity: 0.26;
          }

          body.dark-mode .blob-field::before {
            opacity: 0.48;
          }

          body.dark-mode .ambient-blob--hero {
            opacity: 0.5;
          }

          body.dark-mode .ambient-blob--copy {
            opacity: 0.3;
          }

          body.dark-mode .ambient-blob--preview {
            opacity: 0.36;
          }

          body.dark-mode .ambient-blob--tail {
            opacity: 0.2;
          }
        }

        @media (max-width: 480px) {
          .blob-field::before {
            opacity: 0.5;
          }

          .ambient-blob--hero {
            top: -128px;
            right: -210px;
            width: 430px;
            height: 380px;
            opacity: 0.54;
          }

          .ambient-blob--copy {
            top: 178px;
            left: -250px;
            width: 350px;
            height: 330px;
            opacity: 0.3;
          }

          .ambient-blob--preview {
            right: -230px;
            bottom: -170px;
            width: 420px;
            height: 390px;
            opacity: 0.38;
          }

          .ambient-blob--tail {
            left: -230px;
            top: 560px;
            width: 360px;
            height: 330px;
            opacity: 0.2;
          }

          body.dark-mode .blob-field::before {
            opacity: 0.4;
          }

          body.dark-mode .ambient-blob--hero {
            opacity: 0.44;
          }

          body.dark-mode .ambient-blob--copy {
            opacity: 0.26;
          }

          body.dark-mode .ambient-blob--preview {
            opacity: 0.32;
          }

          body.dark-mode .ambient-blob--tail {
            opacity: 0.16;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ambient-blob {
            animation: none !important;
          }
        }
      `}</style>

      <div
        className={`blob-field blob-field--${orientation}`}
        aria-hidden="true"
      >
        {blobs.map((blob) => (
          <span key={blob} className={`ambient-blob ambient-blob--${blob}`} />
        ))}
      </div>
    </>
  );
}

export default BlobBackground;
