import Link from "next/link";
import {
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { BookOpen, Globe, GraduationCap, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser } from "@/lib/user";
import { User } from "@nysc/types";
import { Role } from "@nysc/enums";

type Nav = {
  name: string;
  link: string;
  icon: typeof Users;
  roles: Role[];
};

const primaryNav: Nav[] = [
  {
    name: "Staffs",
    link: "/admin/staffs",
    icon: Users,
    roles: [Role.SUPER_ADMIN],
  },
  {
    name: "Students",
    link: "/admin/students",
    icon: GraduationCap,
    roles: [Role.SUPER_ADMIN, Role.STAFF],
  },
  {
    name: "Departments",
    link: "/admin/departments",
    icon: BookOpen,
    roles: [Role.SUPER_ADMIN],
  },
  {
    name: "Locations",
    link: "/admin/states",
    icon: Globe,
    roles: [Role.SUPER_ADMIN],
  },
];

const Content = () => {
  const [user, setUser] = useState<User | null>();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUser();
      setUser(user?.data);
    };
    fetchUser();
  }, []);

  const visibleNav = user
    ? primaryNav.filter((item) => item.roles.includes(user.role as Role))
    : [];

  return (
    <SidebarContent className="mt-5">
      <SidebarGroup className="flex-1">
        <SidebarMenu>
          {visibleNav.map((navItem) => {
            const isActive = pathname.startsWith(navItem.link);
            return (
              <SidebarMenuItem key={navItem.name}>
                <SidebarMenuButton
                  asChild
                  className={
                    isActive
                      ? "bg-green-600 text-white hover:bg-green-700 hover:text-white"
                      : ""
                  }
                >
                  <Link href={navItem.link}>
                    <navItem.icon />
                    <span>{navItem.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  );
};

export default Content;
