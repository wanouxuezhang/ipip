/**
 * IP SENTINEL - Cloudflare Worker
 * 玩偶学长 (DollSenior) 定制版
 * 默认显示英文，如修改中文界面，请搜索 const [lang, setLang] = useState('en'); 把zh改为en即可
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // === 1. 从 Cloudflare 环境变量读取配置 ===
    const config = {
      pageTitle: env.TITLE || "IP SENTINEL | DollSenior",
      githubRepo: env.GITHUB || "https://github.com/wanouxuezhang/ipSentinel",
      ownerName: env.NAME || "DollSenior",
      ownerNameCN: env.NAMECN || "玩偶学长",
      ownerShort: env.SHORT || "DollSenior",
      ownerShortCN: env.SHORTCN || "玩偶🧸",
      footerText: env.DIBUEN || "IP SENTINEL · DollSenior Edition",
      footerTextCN: env.DIBUCN || "IP SENTINEL · 玩偶学长"
    };

    // === PWA 配置: manifest.json ===
    if (url.pathname === "/manifest.json") {
      return new Response(JSON.stringify({
        "name": config.pageTitle,
        "short_name": "IP Check",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#020617",
        "theme_color": "#020617",
        "orientation": "portrait-primary",
        "icons": [
          {
            "src": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2322d3ee' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/%3E%3C/svg%3E",
            "type": "image/svg+xml",
            "sizes": "any"
          }
        ]
      }), { headers: { "content-type": "application/json" } });
    }

    // === PWA 配置: sw.js ===
    if (url.pathname === "/sw.js") {
      return new Response(`self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));self.addEventListener('fetch',e=>{});`, 
        { headers: { "content-type": "application/javascript" } });
    }

    // === 获取 IP 数据 ===
    const cf = request.cf || {};
    const headers = request.headers;
    const clientIp = headers.get("cf-connecting-ip") || headers.get("x-forwarded-for") || "127.0.0.1";
    
    const initData = {
      source: "Cloudflare Edge",
      ip: clientIp,
      country: cf.country || "Unknown", 
      city: cf.city || "Unknown City",
      region: cf.region || "",
      isp: cf.asOrganization || "Unknown ISP",
      asn: cf.asn ? "AS" + cf.asn : "Unknown ASN",
      lat: Number(cf.latitude) || 0,
      lon: Number(cf.longitude) || 0,
      colo: cf.colo || "UNK",
      timezone: cf.timezone || "UTC",
      httpProtocol: request.cf?.httpProtocol || "HTTP/2",
      tlsVersion: request.cf?.tlsVersion || "TLS 1.3",
      userAgent: headers.get("user-agent") || "Unknown"
    };

    return new Response(renderHtml(initData, config), {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
        'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: *; connect-src *; img-src * data: https:; style-src * 'unsafe-inline'; font-src *;"
      },
    });
  },
};

function renderHtml(initData, config) {
  return `
<!DOCTYPE html>
<html lang="zh-CN" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <title>${config.pageTitle}</title>
    <meta name="theme-color" content="#020617" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2322d3ee' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/%3E%3C/svg%3E">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.loli.net/css2?family=Inter:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
    <script crossorigin src="https://lib.baomitu.com/react/18.2.0/umd/react.production.min.js"></script>
    <script crossorigin src="https://lib.baomitu.com/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
    <script src="https://lib.baomitu.com/babel-standalone/7.22.17/babel.min.js"></script>

    <script>
      window.CF_DATA = ${JSON.stringify(initData)};
      window.SITE_CONFIG = ${JSON.stringify(config)};
      
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW fetch fail', err));
        });
      }
      
      tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            fontFamily: { sans: ['Inter', 'sans-serif'], mono: ['JetBrains Mono', 'monospace'] },
            colors: { 
              slate: { 850: '#151f32', 900: '#0f172a', 950: '#020617' }, 
              neon: { cyan: '#06b6d4', green: '#10b981', purple: '#8b5cf6', red: '#f43f5e' } 
            },
            animation: { 'fade-in': 'fadeIn 0.5s ease-out' },
            keyframes: { fadeIn: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } } }
          }
        }
      }
    </script>
    <style>
      body { background-color: #020617; color: #f8fafc; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; -webkit-tap-highlight-color: transparent; }
      .glass { background: rgba(30, 41, 59, 0.4); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.05); }
      ::-webkit-scrollbar { width: 8px; }
      ::-webkit-scrollbar-track { background: #0f172a; }
      ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
      .map-color { filter: brightness(0.85) contrast(1.1); }
    </style>
  </head>
  <body>
    <div id="root"></div>

    <script type="text/babel" data-presets="react">
      const { useState, useEffect, useRef } = React;
      const { createRoot } = ReactDOM;

      const TRANSLATIONS = {
        zh: {
          title: "IP 哨兵", 
          owner: window.SITE_CONFIG.ownerNameCN, 
          currentConnection: window.SITE_CONFIG.ownerShortCN,
          copy: "复制", copied: "已复制",
          loc: "位置", isp: "运营商", asn: "ASN", hostname: "主机名", dc: "数据中心", proto: "传输协议",
          time: "时区", netAnalysis: "多源网络分析", cnIp: "本机 IP", latency: "连通性测试", checking: "检测中...",
          ms: "毫秒", 
          footer: window.SITE_CONFIG.footerTextCN, 
          timeout: "超时", ok: "可用", unknownIsp: "未知运营商",
          checkNetwork: "检查网络", adText: "广告位招租", supported: "支持", unsupported: "不支持", address: "地址",
          ipOrg: "IP 组织", asnOrg: "ASN 组织", viewMap: "查看地图", hide: "隐藏", show: "显示", localIp: "当前连接: ",
          ipQuality: "IP评分", proxyDetect: "代理检测", riskFound: "已开启代理", clean: "未检测到", score: "分",
          viewLargeMap: "查看大图", webrtc: "WebRTC 隐私", webrtcLeak: "泄露", webrtcSafe: "安全",
          device: "设备信息", browser: "浏览器", os: "系统",
          starMe: "在 GitHub 点赞",
          type: "IP类型", idc: "IDC机房", broadband: "家庭宽带",
          native: "原生IP", broadcast: "广播IP",
          shared: "共享人数", multi: "多人", low: "1-10",
          riskScore: "IP评分",
          report: "体检报告",
          localTime: "本机时间", ipTime: "IP 时间"
        },
        en: {
          title: "IP SENTINEL", 
          owner: window.SITE_CONFIG.ownerName, 
          currentConnection: window.SITE_CONFIG.ownerShort,
          copy: "Copy", copied: "Copied",
          loc: "Location", isp: "ISP", asn: "ASN", hostname: "Hostname", dc: "Data Center", proto: "Protocol",
          time: "Timezone", netAnalysis: "Network Analysis", cnIp: "Local IP", latency: "Latency Check", checking: "Checking...",
          ms: "ms", 
          footer: window.SITE_CONFIG.footerText, 
          timeout: "Timeout", ok: "OK", unknownIsp: "Unknown ISP",
          checkNetwork: "Check Network", adText: "ADVERTISEMENT", supported: "Supported", unsupported: "Unsupported", address: "Address",
          ipOrg: "IP Organization", asnOrg: "ASN Organization", viewMap: "View Map", hide: "Hide", show: "Show", localIp: "Current Connection: ",
          ipQuality: "IP Score", proxyDetect: "Proxy Detect", riskFound: "Proxy Enabled", clean: "No Proxy", score: "Score",
          viewLargeMap: "View Full Map", webrtc: "WebRTC Privacy", webrtcLeak: "Leak Detected", webrtcSafe: "Safe",
          device: "Device Info", browser: "Browser", os: "OS",
          starMe: "Star on GitHub",
          type: "Type", idc: "Data Center", broadband: "Residential",
          native: "Native IP", broadcast: "Broadcast",
          shared: "Users", multi: "High", low: "1-10",
          riskScore: "IP Score",
          report: "IP Report",
          localTime: "Local Time", ipTime: "IP Time"
        }
      };

      const Icons = {
        Shield: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
        MapPin: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
        Globe: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
        Server: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>,
        Activity: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
        Wifi: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
        Copy: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
        Check: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12"/></svg>,
        External: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
        Laptop: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
        Smartphone: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
        Clock: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
        China: (props) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24" height="24" fill="currentColor" {...props}><path d="M0 0h512v512H0z" fill="#ee1c25"/><path d="M127 125l-21.8-7.3-10.7 20.2-10.7-20.2-21.8 7.3 13.5-18.7-1.1-22.3 17.5 14.8 22.3 1.1 18.7-13.5zM224 160l-15.6-5.2-7.6 14.4-7.6-14.4-15.6 5.2 9.7-13.4-.8-15.9 12.5 10.6 15.9.8 13.4-9.7zM240 208l-15.6-5.2-7.6 14.4-7.6-14.4-15.6 5.2 9.7-13.4-.8-15.9 12.5 10.6 15.9.8 13.4-9.7zM208 256l-15.6-5.2-7.6 14.4-7.6-14.4-15.6 5.2 9.7-13.4-.8-15.9 12.5 10.6 15.9.8 13.4-9.7zM176 304l-15.6-5.2-7.6 14.4-7.6-14.4-15.6 5.2 9.7-13.4-.8-15.9 12.5 10.6 15.9.8 13.4-9.7z"/></svg>,
        Google: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.347.533 12S5.867 24 12.48 24c3.44 0 6.04-1.133 8.133-3.293 2.133-2.133 2.773-5.12 2.773-7.573 0-.747-.067-1.467-.187-2.213h-10.72z"/></svg>,
        Youtube: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
        OpenAI: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1195 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l3.1028-1.7999 3.1028 1.7999v3.5916l-3.1028 1.8001-3.1028-1.8001z"/></svg>,
        Eye: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
        EyeOff: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>,
        Alert: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
        Baidu: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 14c-2.5 0-4.5 1.5-4.5 3.5S9.5 21 12 21s4.5-1.5 4.5-3.5S14.5 14 12 14zM5.5 8.5c-1.5 0-2.5 1.2-2.5 2.5s1 2.5 2.5 2.5 2.5-1.2 2.5-2.5-1-2.5-2.5-2.5zM9.5 5.5c-1.5 0-2.5 1.2-2.5 2.5s1 2.5 2.5 2.5 2.5-1.2 2.5-2.5-1-2.5-2.5-2.5zM14.5 5.5c-1.5 0-2.5 1.2-2.5 2.5s1 2.5 2.5 2.5 2.5-1.2 2.5-2.5-1-2.5-2.5-2.5zM18.5 8.5c-1.5 0-2.5 1.2-2.5 2.5s1 2.5 2.5 2.5 2.5-1.2 2.5-2.5-1-2.5-2.5-2.5z"/></svg>,
        Github: (props) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>,
        Telegram: (props) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>,
        Report: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
      };

      const copyText = (text, onSuccess) => {
        if (!text || text === "N/A" || text.includes("Fail") || text === "Loading...") return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(onSuccess).catch(() => legacyCopy(text, onSuccess));
        } else { legacyCopy(text, onSuccess); }
      };
      const legacyCopy = (text, onSuccess) => {
        try {
          const ta = document.createElement("textarea");
          ta.value = text; ta.style.cssText = "position:fixed;left:-9999px";
          document.body.appendChild(ta); ta.select(); document.execCommand("copy");
          document.body.removeChild(ta); onSuccess();
        } catch(e) { console.error(e); }
      };

      const parseUA = (ua) => {
        if (!ua) return { os: 'Unknown', browser: 'Unknown' };
        let os = 'Unknown', browser = 'Unknown';
        if (ua.includes('Win')) os = 'Windows';
        if (ua.includes('Mac')) os = 'macOS';
        if (ua.includes('Linux')) os = 'Linux';
        if (ua.includes('Android')) os = 'Android';
        if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
        if (ua.includes('Edg')) browser = 'Edge';
        else if (ua.includes('Chrome')) browser = 'Chrome';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Safari')) browser = 'Safari';
        return { os, browser };
      };

      // === 核心逻辑：计算 IP 评分 ===
      const calculateRiskScore = (data, riskData) => {
         if (!riskData) return null; 
         
         let s = 100;
         const { is_vpn, is_proxy, is_tor, is_datacenter, is_abuser, is_bot, risk_score } = riskData;
         
         // A. IP 熵值波动
         try {
             const ipParts = data.ip.split(/[.:]/);
             const lastSegment = parseInt(ipParts[ipParts.length - 1], 16) || 0;
             s -= (lastSegment % 4); 
         } catch (e) {}

         // B. 关键风险扣分
         if (is_vpn) s -= 30;
         if (is_proxy) s -= 30;
         if (is_tor) s -= 50;
         if (is_bot) s -= 20;
         if (is_abuser) s -= 40;

         // C. 类型判定
         if (is_datacenter) s -= 25; 
         else s += 1; 

         // D. 动态风险值映射
         if (typeof risk_score === 'number') s -= Math.round(risk_score);

         // E. 地理位置/原生判定
         const asnCountry = riskData.asn && riskData.asn.country;
         const cfCountry = data.country;
         if (asnCountry && cfCountry && asnCountry !== cfCountry) s -= 20; 

         return Math.min(100, Math.max(0, s));
      };

      const InfoCard = ({ title, value, icon: Icon, subValue, delay, color }) => (
        <div className="glass p-3 rounded-xl flex flex-col justify-between h-full hover:border-slate-600 transition-all duration-300 border border-slate-800 gap-1">
          <div className="flex justify-between items-start">
            <div className="p-1.5 bg-slate-800/50 rounded-lg">
              <Icon className={"w-4 h-4 " + color} />
            </div>
            {subValue && <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">{subValue}</span>}
          </div>
          <div>
            <h3 className="text-slate-400 text-xs font-medium mb-0.5 uppercase tracking-wider">{title}</h3>
            <p className="text-lg font-bold text-white font-mono tracking-tight break-all leading-tight">{value}</p>
          </div>
        </div>
      );

      const AttributeItem = ({ label, value, colorClass, score }) => {
        const [displayScore, setDisplayScore] = useState(0);

        useEffect(() => {
          if (score !== undefined && typeof score === 'number') {
            let start = 0;
            const end = score;
            const duration = 1000;
            const increment = end / (duration / 16); 
            
            const timer = setInterval(() => {
                start += increment;
                if (start >= end) {
                    setDisplayScore(end);
                    clearInterval(timer);
                } else {
                    setDisplayScore(Math.floor(start));
                }
            }, 16);
            return () => clearInterval(timer);
          }
        }, [score]);

        return (
          <div className="flex items-center text-xs h-6 overflow-hidden rounded border border-slate-700/50">
            <div className="px-2 h-full flex items-center bg-slate-800 text-slate-400 font-medium whitespace-nowrap border-r border-slate-700/50 z-10">
                {label}
            </div>
            <div className="relative flex-grow h-full bg-slate-900/50 flex items-center justify-center">
                {score !== undefined ? (
                    <>
                        <div 
                            className={\`absolute left-0 top-0 h-full \${colorClass} opacity-80 transition-all duration-1000 ease-out\`} 
                            style={{ width: \`\${score}%\` }}
                        ></div>
                        <div className="relative z-10 text-white font-bold drop-shadow-md px-1 font-mono">
                            {displayScore}
                        </div>
                    </>
                ) : (
                    <div className={\`w-full h-full flex items-center justify-center text-white font-bold \${colorClass}\`}>
                        {value}
                    </div>
                )}
            </div>
          </div>
        );
      };

      const WebRTCCard = ({ t }) => {
         const [ip, setIp] = useState(null);
         const [status, setStatus] = useState('checking'); 
         useEffect(() => {
            const checkWebRTC = async () => {
                try {
                    const rtc = new RTCPeerConnection({iceServers: [{urls: "stun:stun.l.google.com:19302"}]});
                    rtc.createDataChannel('');
                    rtc.createOffer().then(o => rtc.setLocalDescription(o));
                    rtc.onicecandidate = (ice) => {
                        if (ice && ice.candidate && ice.candidate.candidate) {
                            const line = ice.candidate.candidate;
                            const ipRegex = /(?:[0-9]{1,3}\.){3}[0-9]{1,3}|(?:[a-f0-9]{1,4}:){7}[a-f0-9]{1,4}/;
                            const res = ipRegex.exec(line);
                            if (res && res[0]) {
                                const detectedIp = res[0];
                                if (!detectedIp.startsWith('192.168') && !detectedIp.startsWith('10.') && !detectedIp.startsWith('172.')) {
                                     setIp(detectedIp);
                                     setStatus('leak');
                                     rtc.close();
                                }
                            }
                        }
                    };
                    setTimeout(() => {
                        if (status === 'checking') {
                           setStatus('safe'); 
                           setIp(null);
                           rtc.close();
                        }
                    }, 2000);
                } catch(e) {
                    setStatus('safe');
                }
            };
            checkWebRTC();
         }, []);

         return (
           <div className="glass p-5 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-600 transition-all h-full">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                       <div className={\`p-1 rounded \${status === 'leak' ? 'text-red-400' : 'text-green-400'}\`}>
                           {status === 'leak' ? <Icons.Alert className="w-5 h-5" /> : <Icons.Shield className="w-5 h-5" />}
                       </div>
                       <span className="text-sm font-bold text-slate-300">{t.webrtc}</span>
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <p className={\`text-lg font-bold \${status === 'leak' ? 'text-red-500' : 'text-green-400'}\`}>
                        {status === 'leak' ? t.webrtcLeak : (status === 'checking' ? t.checking : t.webrtcSafe)}
                    </p>
                    {status === 'leak' && ip && <p className="text-xs font-mono text-slate-500 truncate">{ip}</p>}
                </div>
           </div>
         );
      };

      const MainIpCard = ({ data, t, riskData }) => {
        const [copied, setCopied] = useState(false);
        const [isChinaHidden, setIsChinaHidden] = useState(false);
        const [domesticInfo, setDomesticInfo] = useState({ ip: "Loading...", city: "" }); 
        const isCN = data.country === "CN";
        
        useEffect(() => {
            const fetchDomesticIp = async () => {
                const options = { referrerPolicy: "no-referrer", cache: "no-store", mode: 'cors' };
                const controller = new AbortController();
                const signal = controller.signal;
                
                const check = async (url, parseFn) => {
                    try {
                        const res = await fetch(url, { ...options, signal });
                        if (!res.ok) throw new Error('Network response was not ok');
                        const json = await res.json();
                        const result = parseFn(json);
                        if (result && result.ip && result.ip !== '') return result;
                        throw new Error('Data missing or incomplete');
                    } catch (e) { throw e; }
                };

                const tasks = [
                    check("https://forge.speedtest.cn/api/location/info", json => ({
                        ip: json.ip, 
                        city: [json.province, json.city].filter(Boolean).join(' ') || json.country || ""
                    })),
                    check("https://api.uomg.com/api/visitor.info?s=json", json => (
                        json.code === 200 ? { ip: json.data.ip, city: json.data.location.replace(/中国/, "").trim() } : null
                    )),
                    check("https://myip.ipip.net/json", json => {
                        if (!json.data) return null;
                        let city = "";
                        if (json.data.location && Array.isArray(json.data.location)) {
                            city = json.data.location.slice(1, 3).join(' '); 
                        } else {
                            city = [json.data.province, json.data.city].filter(Boolean).join(' ') || json.data.country || "";
                        }
                        return { ip: json.data.ip, city: city };
                    }),
                    check("https://www.ip.cn/api/index?ip=&type=0", json => (
                        json.ip ? { ip: json.ip, city: json.address ? json.address.replace(/中国/, "").trim() : "" } : null
                    ))
                ];

                const raceToSuccess = (promises) => {
                    return new Promise((resolve, reject) => {
                        let failureCount = 0;
                        const total = promises.length;
                        let fallbackResult = null;
                        promises.forEach(p => {
                            p.then(val => {
                                if (val.city && val.city.length > 0) resolve(val);
                                else {
                                    if (!fallbackResult) fallbackResult = val;
                                    failureCount++;
                                    if (failureCount === total) resolve(fallbackResult || { ip: "N/A", city: "" });
                                }
                            }).catch(() => {
                                failureCount++;
                                if (failureCount === total) {
                                    if (fallbackResult) resolve(fallbackResult);
                                    else reject(new Error('All failed'));
                                }
                            });
                        });
                    });
                };
                try {
                    const result = await raceToSuccess(tasks);
                    setDomesticInfo(result);
                } catch (error) { setDomesticInfo({ ip: "N/A", city: "" }); }
                return () => controller.abort();
            };
            fetchDomesticIp();
        }, []);

        const maskIp = (ip) => {
            if (!ip || ip === "Loading..." || ip === "N/A") return ip;
            const trimmed = ip.trim();
            if (trimmed.includes('.')) return trimmed.split('.').map((part, i) => i >= 2 ? '*' : part).join('.');
            else if (trimmed.includes(':')) {
                  const parts = trimmed.split(':');
                  if(parts.length >= 3) return parts.slice(0, 3).join(':') + ':*:*';
                  else return trimmed.substring(0, 4) + '...';
            }
            return trimmed.replace(/(\d+)$/, '***');
        };
        
        const { is_datacenter, is_vpn, is_proxy, is_tor } = riskData || {};
        
        // 1. IP 类型
        const ipType = is_datacenter ? t.idc : t.broadband;
        const ipTypeColor = is_datacenter ? "bg-red-500" : "bg-green-500";

        // 2. 调用独立评分函数
        const score = calculateRiskScore(data, riskData);
        
        let scoreColor = "bg-red-500";
        if (score > 80) scoreColor = "bg-green-500"; 
        else if (score > 50) scoreColor = "bg-yellow-500";
        
        // 3. 原生 IP 判断
        const asnCountry = riskData?.asn?.country;
        const isNative = asnCountry && data.country ? (asnCountry === data.country) : true;
        const nativeLabel = isNative ? t.native : t.broadcast;
        const nativeColor = isNative ? "bg-green-500" : "bg-yellow-500";

        // 4. 共享人数 (精简文案)
        const isShared = is_vpn || is_proxy || is_tor;
        const sharedLabel = isShared ? t.multi : t.low;
        const sharedColor = isShared ? "bg-red-500" : "bg-green-500";

        return (
          <div className="glass p-4 rounded-2xl relative overflow-hidden border-t-4 border-neon-cyan shadow-2xl shadow-cyan-900/10 flex flex-col h-full">
            {/* 顶部：当前 IP 连接状态 */}
            <div className="flex justify-between items-center mb-4 z-10 relative flex-shrink-0 flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-900/30 text-cyan-400 border border-cyan-800 whitespace-nowrap">{t.currentConnection}</span>
                      
                      <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-red-900/20 border border-red-900/30 text-[10px] flex-grow md:flex-grow-0 min-w-0">
                            <span className="text-red-400 font-bold flex items-center gap-1 flex-shrink-0"><Icons.China className="w-3 h-3" /> {t.cnIp}:</span>
                            <span className={\`font-mono truncate \${domesticInfo.ip === "Loading..." ? "text-slate-500 animate-pulse" : "text-white"}\`}>
                                {domesticInfo.ip === "Loading..." ? t.checking : (isChinaHidden ? maskIp(domesticInfo.ip) : domesticInfo.ip)}
                            </span>
                            {domesticInfo.city && <span className="text-slate-400 ml-1 whitespace-nowrap hidden sm:inline">{isChinaHidden ? "******" : domesticInfo.city}</span>}
                            {domesticInfo.ip !== "Loading..." && domesticInfo.ip !== "N/A" && (
                                <div className="flex items-center gap-1 border-l border-red-800/30 pl-2 ml-auto">
                                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsChinaHidden(!isChinaHidden); }} className="text-slate-400 hover:text-white transition-colors" title={isChinaHidden ? t.show : t.hide}>
                                        {isChinaHidden ? <Icons.EyeOff className="w-3 h-3" /> : <Icons.Eye className="w-3 h-3" />}
                                    </button>
                                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); copyText(domesticInfo.ip, () => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }} className="text-slate-400 hover:text-white transition-colors" title={t.copy}>
                                        {copied ? <Icons.Check className="w-3 h-3 text-neon-green" /> : <Icons.Copy className="w-3 h-3" />}
                                    </button>
                                </div>
                            )}
                      </div>
                  </div>
                  
                  {/* === Desktop Only: View Map Button (放回右上角) === */}
                  {!isCN && (
                    <div className="hidden md:flex items-center gap-2 ml-auto">
                        <a href={"https://www.google.com/maps?q=" + data.lat + "," + data.lon} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors">
                            {t.viewMap} <Icons.External className="w-2.5 h-2.5" />
                        </a>
                    </div>
                  )}
            </div>

            {/* 中间：地图与主要信息 */}
            <div className="relative w-full min-h-[7rem] h-auto rounded-lg overflow-hidden border border-slate-700/50 mb-4 group-map relative z-0">
                  {isCN ? (
                    <div className="w-full h-full bg-slate-800/50 p-4">
                        <div className="grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-4 h-full items-center">
                           <div className="col-span-1 md:col-span-3 order-1 md:order-1 flex flex-col justify-center">
                               <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                                    <Icons.MapPin className="w-3 h-3" /> {t.loc}
                               </div>
                               <div className="text-sm font-bold text-white truncate leading-tight" title={data.city + " " + data.region}>
                                    {data.city} {data.region}
                               </div>
                           </div>
                           <div className="col-span-2 md:col-span-6 order-3 md:order-2 flex flex-col justify-center md:border-l border-slate-700/50 md:pl-6 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                               <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                                    <Icons.Wifi className="w-3 h-3" /> {t.isp}
                               </div>
                               <div className="text-sm font-bold text-white truncate leading-tight" title={data.isp}>
                                    {data.isp}
                               </div>
                           </div>
                           <div className="col-span-1 md:col-span-3 order-2 md:order-3 flex flex-col justify-center md:border-l border-slate-700/50 md:pl-6">
                                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                                    <Icons.Activity className="w-3 h-3" /> {t.asn}
                               </div>
                               <div className="text-sm font-bold text-white font-mono truncate leading-tight">
                                    {data.asn}
                               </div>
                           </div>
                        </div>
                    </div>
                  ) : (
                    <>
                      {/* === Mobile Only: View Map 按钮 (悬浮在地图右上角) === */}
                      <a 
                        href={"https://www.google.com/maps?q=" + data.lat + "," + data.lon} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="md:hidden absolute top-2 right-2 z-30 flex items-center gap-1 px-2 py-1 bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded text-[10px] text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shadow-lg group"
                      >
                            {t.viewMap} <Icons.External className="w-2.5 h-2.5 opacity-70 group-hover:opacity-100" />
                      </a>

                      <div className="absolute bottom-2 left-2 z-20 flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded px-2 py-1 shadow-lg">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{t.localIp}</span>
                          <span className="text-xs font-mono font-bold text-white tracking-tight">{domesticInfo.ip !== "Loading..." && isChinaHidden ? maskIp(data.ip) : data.ip}</span>
                      </div>
                        <iframe 
                        src={"https://maps.google.com/maps?q=" + data.lat + "," + data.lon + "&z=7&output=embed"}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 map-color"
                        frameBorder="0"
                        scrolling="no"
                        style={{pointerEvents: 'none'}}
                      ></iframe>
                    </>
                  )}
            </div>

            {/* 底部：属性展示栏 */}
            <div className="mt-auto relative z-10 flex-shrink-0">
                  {riskData ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <AttributeItem label={t.type} value={ipType} colorClass={ipTypeColor} />
                        <AttributeItem 
                            label={t.riskScore} 
                            value={score !== null ? \`\${score} \${t.score}\` : "..."} 
                            colorClass={scoreColor} 
                            score={score !== null ? score : 0} 
                        />
                        <AttributeItem label={t.native} value={nativeLabel} colorClass={nativeColor} />
                        <AttributeItem label={t.shared} value={sharedLabel} colorClass={sharedColor} />
                      </div>
                  ) : (
                      <div className="text-center text-xs text-slate-500 animate-pulse py-2">
                          正在加载 IP 深度属性...
                      </div>
                  )}
            </div>
          </div>
        );
      };

      const DetailedIpCard = ({ type, url, t }) => {
        const getInitialData = () => {
            const currentIp = window.CF_DATA.ip;
            const isV6 = currentIp && currentIp.includes(':');
            const isMatch = (type === 'IPv6' && isV6) || (type === 'IPv4' && !isV6);
            if (isMatch) {
                return {
                    data: {
                        ip: currentIp,
                        hostname: "N/A",
                        isp: window.CF_DATA.isp,
                        org: window.CF_DATA.isp,
                        asn: window.CF_DATA.asn,
                        asnOrg: window.CF_DATA.isp,
                        location: [window.CF_DATA.country, window.CF_DATA.region, window.CF_DATA.city].filter(Boolean).join(', ') || "N/A"
                    },
                    status: 'success'
                };
            }
            return { data: { ip: "N/A", hostname: "N/A", isp: "N/A", org: "N/A", asn: "N/A", asnOrg: "N/A", location: "N/A" }, status: 'loading' };
        };
        const initial = getInitialData();
        const [data, setData] = useState(initial.data);
        const [status, setStatus] = useState(initial.status);
        const [isHidden, setIsHidden] = useState(false);
        const [copied, setCopied] = useState(false);

        useEffect(() => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          const currentIp = window.CF_DATA.ip;
          const isV6 = currentIp && currentIp.includes(':');
          const isMatch = (type === 'IPv6' && isV6) || (type === 'IPv4' && !isV6);

          const fetchData = async () => {
            try {
              const res = await fetch(url, { referrerPolicy: "no-referrer", cache: "no-store", mode: 'cors', signal: controller.signal });
              if (!res.ok) throw new Error('Failed');
              const json = await res.json();
              const ip = json.ip || "N/A";
              let resolvedHostname = "N/A";
              if (ip !== "N/A" && ip.includes('.')) {
                  try {
                      const reversedIp = ip.split('.').reverse().join('.') + '.in-addr.arpa';
                      const dnsUrl = "https://cloudflare-dns.com/dns-query?name=" + reversedIp + "&type=PTR";
                      const dnsRes = await fetch(dnsUrl, { headers: { 'accept': 'application/dns-json' } });
                      const dnsJson = await dnsRes.json();
                      if (dnsJson.Answer && dnsJson.Answer.length > 0) resolvedHostname = dnsJson.Answer[dnsJson.Answer.length - 1].data.replace(/\\.$/, '');
                  } catch (err) {}
              }
              setData({
                ip: ip,
                hostname: resolvedHostname,
                isp: json.isp || "N/A",
                org: json.organization || "N/A",
                asn: json.asn ? "AS" + json.asn : "N/A",
                asnOrg: json.asn_organization || "N/A",
                location: [json.country, json.region, json.city].filter(Boolean).join(', ') || "N/A"
              });
              setStatus('success');
            } catch (e) { if (!isMatch) setStatus('error'); } finally { clearTimeout(timeoutId); }
          };
          fetchData();
          return () => { controller.abort(); clearTimeout(timeoutId); };
        }, [url, type]);

        const getDisplayIp = (ip) => {
            if (!isHidden || !ip) return ip;
            const trimmed = ip.trim();
            if (trimmed.includes('.')) return trimmed.split('.').map((part, i) => i >= 2 ? '*' : part).join('.');
            else if (trimmed.includes(':')) {
                  const parts = trimmed.split(':');
                  if(parts.length >= 3) return parts.slice(0, 3).join(':') + ':*:*';
                  return trimmed.substring(0, 4) + '...';
            }
            return trimmed.replace(/(\d+)$/, '***');
        };

        const Row = ({ label, value, pillStatus, isIp }) => {
            let pillClass = "";
            if (pillStatus === 'success') pillClass = "bg-green-500/20 text-green-400 border-green-500/30";
            if (pillStatus === 'error') pillClass = "bg-red-500/20 text-red-400 border-red-500/30";
            if (status === 'loading') return <div className="detailed-row py-2.5 flex items-center justify-between text-sm"><span className="font-bold text-slate-400 w-32 flex-shrink-0">{label}</span><div className="h-5 bg-slate-800 rounded animate-pulse w-32"></div></div>;

            return (
            <div className="detailed-row py-2.5 flex items-center justify-between text-sm">
                <span className="font-bold text-slate-400 w-32 flex-shrink-0">{label}</span>
                {pillStatus ? (
                    <span className={"px-2 py-0.5 rounded text-xs font-bold border " + pillClass}>{value}</span>
                ) : (
                    <div className="flex items-center justify-end gap-2 min-w-0 flex-1">
                          <span className="text-slate-200 font-mono text-right truncate select-all">{isIp ? getDisplayIp(value) : value}</span>
                          {isIp && value !== "N/A" && (
                            <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                                 <button onClick={(e) => { e.preventDefault(); setIsHidden(!isHidden); }} className="p-1 rounded bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"><Icons.EyeOff className="w-3 h-3" /></button>
                                 <button onClick={(e) => { e.preventDefault(); copyText(value, () => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }} className="p-1 rounded bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"><Icons.Copy className="w-3 h-3" /></button>
                            </div>
                          )}
                    </div>
                )}
            </div>
            );
        };

        return (
          <div className="glass p-5 rounded-xl border border-slate-800 flex flex-col h-full hover:border-slate-600 transition-all">
             <div className="text-sm font-bold text-slate-400 mb-1 border-b border-slate-700/50 pb-2 uppercase tracking-wider flex justify-between items-center">
                 <span>{type} connectivity</span>
                 {status === 'loading' && <div className="w-2 h-2 bg-cyan-500 rounded-full animate-ping"></div>}
             </div>
             <div className="flex flex-col">
                 <Row label={type} value={status === 'success' ? t.supported : t.unsupported} pillStatus={status} />
                 <Row label={t.address} value={data.ip} isIp={true} />
                 <Row label={t.hostname} value={data.hostname} />
                 <Row label={t.isp} value={data.isp} />
                 <Row label={t.ipOrg} value={data.org} />
                 <Row label={t.asn} value={data.asn} />
                 <Row label={t.asnOrg} value={data.asnOrg} />
                 <Row label={t.loc} value={data.location} />
             </div>
          </div>
        );
      };

      const ExternalIpCard = ({ source, url, icon: Icon, color, isCN, lang, t }) => {
        const [data, setData] = useState({ ip: "Loading...", loc: "", isp: "" });
        const [copied, setCopied] = useState(false);
        const [hasError, setHasError] = useState(false);
        const [isHidden, setIsHidden] = useState(false);

        const getDisplayIp = (ip) => {
            if (!isHidden || !ip || ip === "Loading..." || ip === "Failed") return ip;
            const trimmed = ip.trim();
            if (trimmed.includes('.')) return trimmed.split('.').map((part, i) => i >= 2 ? '*' : part).join('.');
            else if (trimmed.includes(':')) {
                  const parts = trimmed.split(':');
                  if(parts.length >= 3) return parts.slice(0, 3).join(':') + ':*:*';
                  return trimmed.substring(0, 4) + '...';
            }
            return trimmed.replace(/(\d+)$/, '***');
        };

        useEffect(() => {
          const fetchData = async () => {
            try {
              const noCacheUrl = url + (url.includes('?') ? '&' : '?') + 't=' + Date.now();
              const options = { referrerPolicy: "no-referrer", cache: "no-store", mode: 'cors' };
              if (isCN) {
                  // Removed External CN Logic
              } else {
                  try {
                      const res = await fetch(noCacheUrl, options);
                      if (!res.ok) throw new Error("Network Err");
                      const json = await res.json();
                      if (url.includes('ping0.cc')) {
                          setData({ ip: json.ip || json.query || "N/A", loc: json.location || json.country_code || json.country || "", isp: json.isp || json.org || "" });
                          return;
                      }
                      setData({
                        ip: json.ip || json.query || "N/A",
                        loc: json.country_code || json.country || (json.location ? json.location.country : ""),
                        isp: json.isp || json.org || (json.connection ? json.connection.isp : "") || (json.asn ? json.asn.organization : "")
                      });
                  } catch(err) {
                      if(source.includes('v6') && !isCN) {
                          const res = await fetch("https://api6.ipapi.org/?format=json", options);
                          const json = await res.json();
                          setData({ ip: json.ip, loc: "", isp: "" });
                      } else if(source.includes('v4') && !isCN) {
                          const res = await fetch("https://ipwho.is/", options);
                          const json = await res.json();
                          setData({ ip: json.ip, loc: json.country_code || "", isp: json.connection?.isp || "" });
                      } else { throw err; }
                  }
              }
            } catch (e) { 
                setHasError(true); setData({ ip: "Failed", loc: t.checkNetwork, isp: "" }); 
            }
          };
          fetchData();
        }, [url, isCN, source, lang, t]); 

        return (
          <div className="glass p-5 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-600 transition-all h-full">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Icon className={"w-5 h-5 " + color} />
                <span className="text-sm font-bold text-slate-300">{source}</span>
              </div>
              {data.loc && data.loc !== t.checkNetwork && <span className="text-xs font-mono bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded truncate max-w-[100px]">{data.loc}</span>}
            </div>
            <div className="flex items-center gap-2 cursor-pointer group">
               <p className={\`text-lg font-mono font-bold truncate transition-colors flex-grow \${data.ip === "Failed" || data.ip === t.checkNetwork ? "text-red-500" : "text-white hover:text-cyan-400"}\`}>{getDisplayIp(data.ip)}</p>
               <div className="flex gap-1">
                 {data.ip !== "Loading..." && data.ip !== "Failed" && (
                   <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsHidden(!isHidden); }} className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"><Icons.EyeOff className="w-3.5 h-3.5" /></button>
                 )}
                 {(!hasError && data.ip !== "Loading..." && (
                   <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); copyText(data.ip, () => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }} className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"><Icons.Copy className="w-3.5 h-3.5" /></button>
                 ))}
               </div>
            </div>
            <p className="text-xs text-slate-500 mt-1 truncate">{data.isp}</p>
          </div>
        );
      };

      const ConnectivityItem = ({ icon: Icon, label, url, t }) => {
        const [status, setStatus] = useState("checking");
        const [ms, setMs] = useState(null);

        useEffect(() => {
          const controller = new AbortController();
          const start = performance.now();
          let isFinished = false;
          const check = async () => {
              try {
                  await fetch(url + (url.includes('?') ? '&' : '?') + 't=' + Date.now(), { mode: 'no-cors', cache: 'no-store', signal: controller.signal });
                  finish("ok");
              } catch (e) { finish("fail"); }
          };
          const finish = (s) => {
              if (isFinished) return;
              isFinished = true;
              setMs(Math.floor(performance.now() - start));
              setStatus(s);
          };
          check();
          const timer = setTimeout(() => { if (!isFinished) { isFinished = true; controller.abort(); setStatus("timeout"); } }, 5000);
          return () => { isFinished = true; controller.abort(); clearTimeout(timer); };
        }, [url]);

        const colors = { checking: "bg-yellow-500", ok: "bg-neon-green", fail: "bg-red-500", timeout: "bg-slate-500" };
        const textColors = { checking: "text-yellow-400", ok: "text-neon-green", fail: "text-red-400", timeout: "text-slate-400" };

        return (
          <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-800/50">
             <div className="flex items-center gap-2">
                {Icon && <Icon className="w-4 h-4 text-slate-400" />}
                <span className="text-sm text-slate-300 font-medium">{label}</span>
             </div>
             <div className="flex items-center gap-2">
               <span className={\`text-xs font-mono \${textColors[status] || "text-slate-400"}\`}>{status === 'checking' ? t.checking : status === 'ok' ? ms + " " + t.ms : t.timeout}</span>
               <div className={\`w-2.5 h-2.5 rounded-full \${colors[status] || "bg-slate-500"} \${status === 'checking' ? " animate-pulse" : ""}\`}></div>
             </div>
          </div>
        );
      };

      const App = () => {
        const [data, setData] = useState(window.CF_DATA || null);
        const [lang, setLang] = useState('en');
        const [hostname, setHostname] = useState('Scanning...');
        const [riskData, setRiskData] = useState(null);
        // 新增时间状态
        const [times, setTimes] = useState({ local: "--:--:--", ip: "--:--:--" });
        
        const t = TRANSLATIONS[lang];
        const isCN = data && data.country === "CN";
        const sysInfo = parseUA(data.userAgent);

        useEffect(() => {
          if (window.CF_DATA) setData(window.CF_DATA);
          fetch('https://api.ipapi.is').then(res => res.json()).then(json => {
                setHostname(json.asn?.domain || json.company?.domain || "N/A");
                setRiskData(json);
          }).catch(() => setHostname("N/A"));
        }, []);
        
        // 实时时钟 Effect
        useEffect(() => {
            const updateTime = () => {
                const now = new Date();
                // 本机时间
                const local = now.toLocaleTimeString(lang === 'zh' ? 'zh-CN' : 'en-US', { hour12: false });
                // IP 时间
                let ipTimeStr = "--:--:--";
                try {
                    if (data && data.timezone) {
                        ipTimeStr = now.toLocaleTimeString('en-US', { timeZone: data.timezone, hour12: false });
                    }
                } catch(e) {}
                setTimes({ local, ip: ipTimeStr });
            };
            updateTime();
            const timer = setInterval(updateTime, 1000);
            return () => clearInterval(timer);
        }, [data, lang]);
        
        // 报告导出功能
        const handleCopyReport = () => {
            if (!data) return;
            const score = riskData ? calculateRiskScore(data, riskData) : "N/A";
            const report = \`
🔍 **IP Sentinel Report**
-------------------------
🌍 **IP:** \${data.ip}
🏳️ **Loc:** \${data.city}, \${data.country}
🏢 **ISP:** \${data.isp}
🔢 **ASN:** \${data.asn}
🚦 **Type:** \${riskData?.is_datacenter ? "Data Center 🏢" : "Residential 🏠"}
🛡️ **Score:** \${score} / 100
-------------------------
Generated by https://t.me/wanouxuezhang
\`.trim();
            copyText(report, () => {
                alert(t.copied);
            });
        };

        if (!data) return <div className="min-h-screen flex items-center justify-center text-cyan-500 font-mono animate-pulse">LOADING...</div>;
        
        return (
          <div className="min-h-screen pb-20 px-4 pt-6 md:pt-12 max-w-7xl mx-auto">
            <header className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                 <div className="bg-cyan-900/20 p-2 rounded-lg border border-cyan-500/30">
                    <Icons.Shield className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" />
                 </div>
                 <div className="flex flex-col justify-center">
                   <h1 className="text-lg md:text-2xl font-bold text-white tracking-tight leading-tight">{t.title}</h1>
                   <span className="text-[10px] md:text-xs text-cyan-500 font-medium px-1.5 py-0.5 bg-cyan-950 rounded border border-cyan-900 w-fit">{t.owner}</span>
                 </div>
               </div>

               <div className="flex items-center gap-2">
                 {window.SITE_CONFIG.githubRepo && (
                  <a href={window.SITE_CONFIG.githubRepo} target="_blank" rel="noreferrer" className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] md:text-xs text-yellow-400 transition-colors">
                    <Icons.Github className="w-3 h-3" />
                    <span className="hidden sm:inline">{t.starMe}</span>
                    <span className="sm:hidden">Star</span>
                  </a>
                 )}
                 <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] md:text-xs text-slate-300 transition-colors">
                   <Icons.Globe className="w-3 h-3" />
                   <span>{lang === 'zh' ? 'English' : '中文'}</span>
                 </button>
               </div>
            </header>
            
            <div className="mb-6 flex flex-col lg:flex-row items-start lg:items-center gap-4">
                 <h2 className="text-lg font-bold text-white flex items-center gap-2 flex-shrink-0">
                    <Icons.Activity className="w-5 h-5 text-neon-green" /> <span>{t.latency}</span>
                 </h2>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-grow w-full">
                      {isCN ? (
                        <>
                            <ConnectivityItem icon={Icons.Baidu} label="百度" url="https://www.baidu.com" t={t} />
                            <ConnectivityItem icon={Icons.Bilibili} label="Bilibili" url="https://www.bilibili.com" t={t} />
                            <ConnectivityItem icon={Icons.Douyin} label="抖音" url="https://www.douyin.com" t={t} />
                            <ConnectivityItem icon={Icons.WeChat} label="微信" url="https://mp.weixin.qq.com" t={t} />
                        </>
                      ) : (
                        <>
                            <ConnectivityItem icon={Icons.Google} label="Google" url="https://www.google.com" t={t} />
                            <ConnectivityItem icon={Icons.Youtube} label="YouTube" url="https://www.youtube.com" t={t} />
                            <ConnectivityItem icon={Icons.OpenAI} label="OpenAI" url="https://api.openai.com" t={t} />
                            <ConnectivityItem icon={Icons.Github} label="GitHub" url="https://github.com" t={t} />
                        </>
                      )}
                 </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
              <div className="h-full">
                <MainIpCard data={data} t={t} riskData={riskData} />
              </div>
              <div className="grid grid-cols-2 gap-4 h-full">
                 <InfoCard title={t.hostname} value={hostname} icon={Icons.Laptop} color="text-pink-400" />
                 <InfoCard title={t.device} value={sysInfo.os} subValue={sysInfo.browser} icon={Icons.Smartphone} color="text-purple-400" />
                 <InfoCard title={t.proto} value={data.httpProtocol} subValue={data.tlsVersion} icon={Icons.Wifi} color="text-emerald-400" />
                 <InfoCard title={t.dc} value={data.colo} icon={Icons.Server} color="text-yellow-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailedIpCard type="IPv4" url="https://api-ipv4.ip.sb/geoip" t={t} />
              <DetailedIpCard type="IPv6" url="https://api-ipv6.ip.sb/geoip" t={t} />
            </div>

            <div className="mt-8">
                 <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Icons.External className="w-5 h-5 text-cyan-500" /> <span>{t.netAnalysis}</span></h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ExternalIpCard source="Ping0.cc v6" url="https://ipv6.ping0.cc/ip/api" icon={Icons.Activity} color="text-rose-500" lang={lang} t={t} />
                    <ExternalIpCard source="IPAPI.is" url="https://api.ipapi.is" icon={Icons.Server} color="text-yellow-500" lang={lang} t={t} />
                    <WebRTCCard t={t} />
                 </div>
            </div>
            
            {/* === 移动到底部的：时间和报告导出栏 === */}
            <div className="flex justify-center mt-8">
                 <div className="flex items-center bg-slate-800/40 border border-slate-700/50 rounded-lg p-1.5 backdrop-blur-md">
                   {/* 本机时间：由 px-2 改为 px-4 */}
                   <div className="flex flex-col px-4 border-r border-slate-700/50">
                       <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t.localTime}</span>
                       <span className="text-sm font-mono font-bold text-white leading-none">{times.local}</span>
                   </div>
                   {/* IP 时间：由 px-2 改为 px-4 */}
                   <div className="flex flex-col px-4">
                       <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t.ipTime}</span>
                       <span className="text-sm font-mono font-bold text-neon-cyan leading-none">{times.ip}</span>
                   </div>
                   {/* 报告导出按钮：增加 ml-3 以替代原本的 gap */}
                   <button 
                       onClick={handleCopyReport}
                       className="ml-3 p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md transition-all shadow-lg shadow-cyan-900/20"
                       title={t.report}
                   >
                       <Icons.Report className="w-4 h-4" />
                   </button>
                 </div>
            </div>

            <footer className="mt-4 text-center text-slate-600 text-sm flex flex-col items-center gap-4">
                 <span>{t.footer}</span>
                 <div className="flex items-center gap-4">
                     <a href="https://github.com/wanouxuezhang" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-300 transition-colors transform hover:scale-110 duration-300"><Icons.Github className="w-6 h-6" /></a>
                     <a href="https://t.me/wanouxuezhang" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-300 transition-colors transform hover:scale-110 duration-300"><Icons.Telegram className="w-6 h-6" /></a>
                 </div>
            </footer>
          </div>
        );
      };

      const root = createRoot(document.getElementById('root'));
      root.render(<App />);
    </script>
  </body>
</html>
`;
}
