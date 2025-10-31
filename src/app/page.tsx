'use client';
import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Github, Heart, Moon, Sun, Code, Globe } from 'lucide-react';
import logo from './logo-400.png';

const API_URL = process.env.NEXT_PUBLIC_SITE_URL;

const MAINNET_ENDPOINTS = [
  {
    label: 'Base Mainnet',
    url: `${API_URL}/api/base/paid-content`,
  },
  {
    label: 'Polygon Mainnet',
    url: `${API_URL}/api/polygon/paid-content`,
  },
  {
    label: 'Peaq Mainnet',
    url: `${API_URL}/api/peaq/paid-content`,
  },
  // {
  //   label: 'Avalanche Mainnet',
  //   url: `${API_URL}/api/avalanche/paid-content`,
  // },
  {
    label: 'Sei Mainnet',
    url: `${API_URL}/api/sei/paid-content`,
  },
  {
    label: 'Solana Mainnet',
    url: `${API_URL}/api/solana/paid-content`,
  },
];

const TESTNET_ENDPOINTS = [
  {
    label: 'Base Sepolia',
    url: `${API_URL}/api/base-sepolia/paid-content`,
  },
  {
    label: 'Avalanche Fuji',
    url: `${API_URL}/api/avalanche-fuji/paid-content`,
  },
  {
    label: 'Polygon Amoy',
    url: `${API_URL}/api/polygon-amoy/paid-content`,
  },
  {
    label: 'Sei Testnet',
    url: `${API_URL}/api/sei-testnet/paid-content`,
  },
  {
    label: 'Solana Devnet',
    url: `${API_URL}/api/solana-devnet/paid-content`,
  },
];

// Quickstart examples removed in favor of docs links

const RESOURCES = [
  {
    label: 'x402',
    url: 'https://x402.org',
    icon: <ExternalLink className="w-4 h-4" />,
  },
  {
    label: 'x402 github',
    url: 'https://github.com/coinbase/x402',
    icon: <Github className="w-4 h-4" />,
  },
  {
    label: 'x402 Echo Merchant Github',
    url: 'https://github.com/PalPaxAI/x402-Echo-Merchant',
    icon: <Github className="w-4 h-4" />,
  },
];

// CodeBlock removed with inline examples

function useThemeToggle() {
  const [isDark, setIsDark] = React.useState(() =>
    typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  );
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);
  return [isDark, setIsDark] as const;
}

export default function Home() {
  const [isDark, setIsDark] = useThemeToggle();
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center px-4 relative">
      {/* Gradient overlays for visual interest */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-200/20 rounded-full blur-3xl"></div>
      </div>
      
      {/* Header with Logo and Theme Toggle */}
      <header className="w-full max-w-2xl flex items-center justify-between pt-6 pb-4 px-4 rounded-lg bg-gradient-to-br from-white/80 via-purple-50/50 to-violet-50/50 dark:from-card/80 dark:via-purple-950/30 dark:to-violet-950/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Image
            src={logo}
            alt="402 Echo Logo"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
            x402 Echo
          </h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={() => setIsDark((d) => !d)}
          className="hover:bg-purple-50 dark:hover:bg-purple-950/20"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </header>
      
      {/* Hero Section */}
      <section className="w-full max-w-2xl mx-auto pt-8 pb-8 flex flex-col items-center text-center relative z-10">
        <p className="text-lg sm:text-xl text-gray-700 dark:text-muted-foreground mb-8 max-w-xl leading-relaxed">
          Try the <a href="https://x402.org" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 font-medium hover:text-purple-700 dark:hover:text-purple-300 transition-colors">x402 protocol</a> for free.<br />
          Your payment is instantly refunded.
        </p>
        <Card className="w-full bg-gradient-to-br from-white via-purple-50/30 to-violet-50/30 dark:from-card dark:via-purple-950/10 dark:to-violet-950/10 border border-purple-200/50 dark:border-purple-800/30 shadow-lg shadow-purple-500/5 mb-4 mt-8 backdrop-blur-sm">
          <CardContent className="py-6 flex flex-col gap-4">
            <div className="text-base text-foreground font-medium mb-2">Test your x402 client against:</div>
            <div className="text-sm font-semibold mt-4 mb-1 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">Testnets</div>
            {TESTNET_ENDPOINTS.map((ep) => (
              <div key={ep.label} className="flex items-center justify-between bg-gradient-to-r from-purple-50/50 via-violet-50/30 to-purple-50/50 dark:from-purple-950/20 dark:via-violet-950/10 dark:to-purple-950/20 rounded-md px-4 py-3 border border-purple-200/40 dark:border-purple-800/30 mb-2 hover:border-purple-300 dark:hover:border-purple-700 transition-colors shadow-sm">
                <span className="font-mono text-sm text-foreground font-medium">{ep.label}</span>
                <div className="flex items-center gap-1">
                  <a
                    href={ep.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 dark:text-purple-400 underline hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium flex items-center gap-1 transition-colors"
                  >
                    {ep.url} <ExternalLink className="w-4 h-4" />
                  </a>
                  <CopyButton url={ep.url} />
                </div>
              </div>
            ))}
            <div className="text-sm font-semibold mt-1 mb-1 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">Mainnets</div>
            {MAINNET_ENDPOINTS.map((ep) => (
              <div key={ep.label} className="flex items-center justify-between bg-gradient-to-r from-purple-50/50 via-violet-50/30 to-purple-50/50 dark:from-purple-950/20 dark:via-violet-950/10 dark:to-purple-950/20 rounded-md px-4 py-3 border border-purple-200/40 dark:border-purple-800/30 mb-2 hover:border-purple-300 dark:hover:border-purple-700 transition-colors shadow-sm">
                <span className="font-mono text-sm text-foreground font-medium">{ep.label}</span>
                <div className="flex items-center gap-1">
                  <a
                    href={ep.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 dark:text-purple-400 underline hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium flex items-center gap-1 transition-colors"
                  >
                    {ep.url} <ExternalLink className="w-4 h-4" />
                  </a>
                  <CopyButton url={ep.url} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
      {/* Quickstart Section (cards linking to docs) */}
      <section className="w-full max-w-2xl mx-auto pt-8 pb-16">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-16 text-center bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">Quickstart Guides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a href="https://docs.palpaxai.network/x402/clients/typescript/axios" target="_blank" rel="noopener noreferrer" className="group">
            <Card className="h-full hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 bg-gradient-to-br from-white via-purple-50/40 to-violet-50/30 dark:from-card dark:via-purple-950/10 dark:to-violet-950/10 border-purple-200/50 dark:border-purple-800/30 shadow-md hover:shadow-purple-500/20 group-hover:shadow-lg">
              <CardContent className="p-5 flex flex-col">
                <div className="mb-3 p-2 rounded-md bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-950/50 dark:to-violet-950/50 text-purple-600 dark:text-purple-400 w-fit shadow-sm">
                  <Code className="w-5 h-5" />
                </div>
                <div className="font-semibold text-foreground">Axios Quickstart</div>
                <p className="text-sm text-muted-foreground mt-1">Attach the x402 interceptor to Axios and pay per request.</p>
                <span className="mt-3 inline-flex items-center text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 text-sm transition-colors">Read the guide <ExternalLink className="w-4 h-4 ml-1" /></span>
              </CardContent>
            </Card>
          </a>
          <a href="https://docs.palpaxai.network/x402/clients/typescript/fetch" target="_blank" rel="noopener noreferrer" className="group">
            <Card className="h-full hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 bg-gradient-to-br from-white via-purple-50/40 to-violet-50/30 dark:from-card dark:via-purple-950/10 dark:to-violet-950/10 border-purple-200/50 dark:border-purple-800/30 shadow-md hover:shadow-purple-500/20 group-hover:shadow-lg">
              <CardContent className="p-5 flex flex-col">
                <div className="mb-3 p-2 rounded-md bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-950/50 dark:to-violet-950/50 text-purple-600 dark:text-purple-400 w-fit shadow-sm">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="font-semibold text-foreground">Fetch Quickstart</div>
                <p className="text-sm text-muted-foreground mt-1">Wrap fetch with x402 to handle payments automatically.</p>
                <span className="mt-3 inline-flex items-center text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 text-sm transition-colors">Read the guide <ExternalLink className="w-4 h-4 ml-1" /></span>
              </CardContent>
            </Card>
          </a>
        </div>
      </section>
      {/* Resources Section */}
      <section className="w-full max-w-2xl mx-auto py-16 relative z-10">
        <h3 className="text-xl font-semibold mb-6 text-center bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">Resources</h3>
        <ul className="flex flex-col gap-4 items-center">
          {RESOURCES.map((res) => (
            <li key={res.url} className="flex items-center gap-2 group">
              <div className="text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                {res.icon}
              </div>
              <a
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 dark:text-purple-400 underline hover:text-purple-700 dark:hover:text-purple-300 text-base font-medium transition-colors"
              >
                {res.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
      {/* Footer */}
      <footer className="w-full py-8 flex justify-center items-center border-t border-purple-200/30 dark:border-purple-800/30 mt-8 relative z-10">
        <span className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-1">
          Made with <Heart className="inline w-4 h-4 text-pink-500 mx-1" fill="#ec4899" /> by{' '}
          <a
            href="https://palpaxai.network"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 dark:text-purple-400 underline hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
          >
            PalPaxAI
          </a>
        </span>
      </footer>
    </main>
  );
}

function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <Button
      size="icon"
      variant="ghost"
      className="ml-1 opacity-70 hover:opacity-100"
      onClick={async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      aria-label="Copy URL"
    >
      <Copy className="w-4 h-4" />
      <span className="sr-only">Copy URL</span>
      {copied && (
        <span className="absolute top-0 right-10 text-xs text-purple-600 dark:text-purple-400 font-semibold bg-white dark:bg-card px-2 py-1 rounded shadow-lg border border-purple-200 dark:border-purple-800">Copied!</span>
      )}
    </Button>
  );
}
