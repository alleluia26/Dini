import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export function BrandLogo({
  className,
  priority = false,
  sizes = "300px",
}: BrandLogoProps) {
  return (
    <Image
      alt="Dini Hotel"
      className={className}
      height={300}
      priority={priority}
      sizes={sizes}
      src="/brand/dini-hotel-logo.jpg"
      width={300}
    />
  );
}
