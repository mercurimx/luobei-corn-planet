import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "萝北玉米星球",
  description: "化身一粒萌发的玉米种子，在玉米星球上找回土地、天气、生长、收获与去向的七段记忆。",
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
