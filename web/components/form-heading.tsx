import Image from "next/image";

const FormHeading = ({
  heading,
  subHeading,
}: {
  heading: string;
  subHeading?: string | undefined;
}) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <Image
        src="/abu-logo.png"
        alt="Ahmadu Bello University logo"
        height={88}
        width={88}
        priority
      />
      <div className="text-center">
        <h1 className="text-xl  tracking-tight">{heading}</h1>
        {subHeading && (
          <p className="text-sm text-muted-foreground">{subHeading}</p>
        )}
      </div>
    </div>
  );
};

export default FormHeading;
