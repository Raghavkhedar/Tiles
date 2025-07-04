"use client";
import FooterNav from "./footer-nav";
import { usePathname } from "next/navigation";

export default function FooterNavWrapper() {
  const pathname = usePathname();
  const show = pathname && pathname.startsWith("/dashboard");
  return show ? <FooterNav /> : null;
} 