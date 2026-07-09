import Image from "next/image";
import { SidebarHeader } from "../ui/sidebar";

const Header = () => {
  return (
    <SidebarHeader className="mt-5">
      <div className="flex gap-5 items-center">
        <div className="w-10 h-10 relative">
          <Image src={"/abu-logo.png"} alt="abu logo" fill />
        </div>
        <div>
          <h1>Ahmadu Bello University</h1>
          <h2 className="text-xs">Nysc pre screening portal</h2>
        </div>
      </div>
    </SidebarHeader>
  );
};

export default Header;
