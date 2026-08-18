import { ReactNode } from "react";
import { Sidebar } from "./components/sidebar";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex gap-2">
      <Sidebar />
      <div className="w-full mt-5 px-2">{children}</div>
    </div>
  );
};

export default Layout;
