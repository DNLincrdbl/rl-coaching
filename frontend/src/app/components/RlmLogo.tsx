import Image from 'next/image';

interface RlmLogoProps {
  className?: string;
  /** Pixel height of the wordmark. Width follows the cropped image aspect ratio. */
  height?: number;
  priority?: boolean;
}

const ASPECT = 820 / 200;

export default function RlmLogo({ className = '', height = 52, priority = false }: RlmLogoProps) {
  const width = Math.round(height * ASPECT);
  return (
    <Image
      src="/rlm-wordmark.png"
      alt="RLM"
      width={width}
      height={height}
      priority={priority}
      className={`w-auto object-contain object-left ${className}`}
      style={{ height, width: 'auto' }}
    />
  );
}
