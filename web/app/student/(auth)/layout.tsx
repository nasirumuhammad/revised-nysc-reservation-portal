import Image from "next/image";
import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="h-screen flex  w-full ">
      <div
        className="relative w-1/2 h-full
        hidden md:block
      "
      >
        <Image
          src={"/nysc-hero.jpg"}
          alt="nysc hero"
          fill
          className="sticky top-0"
        />
      </div>
      <div className="w-full md:w-1/2">{children}</div>
    </div>
  );
};

export default Layout;
