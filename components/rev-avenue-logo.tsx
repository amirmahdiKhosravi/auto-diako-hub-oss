import Image from "next/image";

interface RevAvenueLogoProps {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

/**
 * Rev Avenue logo (white on transparent). Use on dark backgrounds or inside a dark container for visibility.
 */
export function RevAvenueLogo({
  className,
  width = 140,
  height = 40,
  priority = false,
}: RevAvenueLogoProps) {
  return (
    <Image
      src="/rev-avenue-logo.png"
      alt="Rev Avenue"
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}
