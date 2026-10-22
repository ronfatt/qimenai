import type { Metadata } from 'next';
import './globals.css';
import './mobile-red.css';
export const metadata:Metadata={title:'时境 SHIJING · 与好时光相遇',description:'导师策划的奇门观想、吉时行动与空间布局。让每一份心愿，都有一个开始。',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-Hans"><body>{children}</body></html>}
