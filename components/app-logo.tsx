import Image from "next/image";

interface AppLogoProps {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

/**
 * Application logo (white on transparent). Use on dark backgrounds or inside a dark container for visibility.
 * Replace /app-logo.png in the public/ directory with your own branding.
 */
export function AppLogo({
  className,
  width = 140,
  height = 40,
  priority = false,
}: AppLogoProps) {
  return (
    <Image
      src="/app-logo.png"
      alt="Auto Diako Hub"
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}
