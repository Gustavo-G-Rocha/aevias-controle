import { useNavigate, useLocation } from "react-router-dom";
import { FilePlus, Settings, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";
import { User } from "@/entities/User";
import { useCallback } from "react";

export default function MobileHeader({ user, canCreateRecords }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = useCallback(async () => {
    await User.logout();
  }, []);

  return null;




















































}