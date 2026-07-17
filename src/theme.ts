/**
 * App Theme Configuration — StudyBeats AI
 *
 * Dark, premium study-SaaS palette: emerald + purple + electric-blue.
 * Colors use HSL format: "hue saturation% lightness%"
 */

// Bricolage Grotesque (display) + Hanken Grotesk (body) — distinctive geometric
// pairing that reads "modern AI product" without leaning on Inter/Space Grotesk.
const font = {
  url: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Hanken+Grotesk:wght@400..700&display=swap',
  family: "'Hanken Grotesk', sans-serif",
};

export const theme = {
  colors: {
    background: '256 42% 6%',
    foreground: '150 25% 96%',
    card: '256 34% 9%',
    'card-foreground': '150 25% 96%',
    popover: '256 38% 8%',
    'popover-foreground': '150 25% 96%',
    primary: '160 84% 45%',
    'primary-foreground': '256 42% 6%',
    secondary: '256 28% 14%',
    'secondary-foreground': '150 20% 88%',
    muted: '256 24% 13%',
    'muted-foreground': '256 12% 62%',
    accent: '268 75% 63%',
    'accent-foreground': '256 42% 6%',
    destructive: '0 72% 55%',
    'destructive-foreground': '0 0% 100%',
    border: '256 22% 18%',
    input: '256 22% 18%',
    ring: '160 84% 45%',
    link: '199 89% 62%',
    'link-hover': '199 89% 72%',
    button: '256 28% 15%',
    'button-foreground': '150 25% 96%',
    'button-border': '256 22% 24%',
    'button-hover': '256 28% 20%',
    'button-hover-foreground': '150 25% 98%',
    'button-hover-border': '160 60% 40%',
    'button-ring': '160 84% 45%',
    'chart-1': '160 84% 45%',
    'chart-2': '268 75% 63%',
    'chart-3': '199 89% 55%',
    'chart-4': '320 70% 60%',
    'chart-5': '40 90% 55%',
    'sidebar-background': '256 46% 5%',
    'sidebar-foreground': '150 18% 82%',
    'sidebar-primary': '160 84% 45%',
    'sidebar-primary-foreground': '256 42% 6%',
    'sidebar-accent': '256 30% 12%',
    'sidebar-accent-foreground': '150 20% 88%',
    'sidebar-border': '256 24% 15%',
    'sidebar-ring': '160 84% 45%',
  },
  font,
  radius: '1rem',
};
