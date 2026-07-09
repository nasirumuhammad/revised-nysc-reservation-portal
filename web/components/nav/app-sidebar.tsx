"use client";
import { Sidebar } from "@/components/ui/sidebar";
import Header from "./header";
import Content from "./content";
import Footer from "./footer";

const AppSidebar = () => {
  return (
    <Sidebar>
      <Header />
      <Content />
      <Footer />
    </Sidebar>
  );
};

export default AppSidebar;
