import { useRef, useState, useCallback } from 'react';

interface TiltStyle {
  transform: string;
}

interface GlowStyle {
  background: string;
  filter: string;
}

export function useCardTilt(maxTilt: number = 8) {
  const ref = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState<TiltStyle>({ transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)' });
  const [glowStyle, setGlowStyle] = useState<GlowStyle>({ background: '', filter: '' });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
    });

    // Calculate glow position
    const glowX = (x / rect.width) * 100;
    const glowY = (y / rect.height) * 100;

    setGlowStyle({
      background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(59, 130, 246, 0.3), transparent 70%)`,
      filter: 'blur(20px)',
    });
  }, [maxTilt]);

  const handleMouseLeave = useCallback(() => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
    });
    setGlowStyle({
      background: '',
      filter: '',
    });
  }, []);

  return {
    ref,
    tiltStyle,
    glowStyle,
    handleMouseMove,
    handleMouseLeave,
  };
}

