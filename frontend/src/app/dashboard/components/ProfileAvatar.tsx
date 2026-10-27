'use client';

import Image from 'next/image';
import { colorById, isLightHex } from '@/lib/data/cosmetics';

interface Props {
  colorId?: string | null;
  size?: number;
  className?: string;
  rounded?: string;
}

export default function ProfileAvatar({ colorId, size = 96, className = '', rounded = 'rounded-2xl' }: Props) {
  const color = colorById(colorId);
  const light = isLightHex(color.hex);
  const logoW = Math.round(size * 0.9);

  return (
    <div
      className={`${rounded} flex items-center justify-center overflow-hidden border border-white/10 ${className}`}
      style={{ width: size, height: size, background: color.hex }}
      aria-hidden
    >
      <Image
        src="/rlm-wordmark.png"
        alt=""
        width={820}
        height={200}
        className={`object-contain ${light ? 'brightness-0' : 'brightness-0 invert'}`}
        style={{ width: logoW, height: 'auto' }}
      />
    </div>
  );
}
