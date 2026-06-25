import Image from 'next/image';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function Logo({ className = '', width = 80, height = 80 }: LogoProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src="/sgslogo.jpeg"
        alt="SGS School Logo"
        width={width}
        height={height}
        className="object-contain w-full h-full"
        priority
      />
    </div>
  );
}
