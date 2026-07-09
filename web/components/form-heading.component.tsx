import React from "react";

const FormHeading = ({
  heading,
  subHeading,
}: {
  heading: string;
  subHeading: string;
}) => (
  <div className="text-center w-4/5 sm:w-2/5 md:w-3/5 my-5">
    <h1 className="font-semibold text-2xl">{heading}</h1>
    <h2 className="text-muted-foreground text-sm mt-1">{subHeading}</h2>
  </div>
);

export default FormHeading;
