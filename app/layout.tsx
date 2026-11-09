import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata={title:'Hermes×Pi · 验证证据台账',description:'每周一个小实践，让每一步都有证据。'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-CN"><body>{children}</body></html>}
