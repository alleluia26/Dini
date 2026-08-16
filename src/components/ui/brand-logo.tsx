import Image from "next/image";

type BrandLogoProps = {
  priority?: boolean;
};

export function BrandLogo({ priority = false }: BrandLogoProps) {
  return (
    <Image
      alt="Dini Hotel"
      height={300}
      priority={priority}
      src="/brand/dini-hotel-logo.jpg"
      width={300}
    />
  );
}
