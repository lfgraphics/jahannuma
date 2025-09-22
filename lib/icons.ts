// Icon mapping from FontAwesome to Lucide React
import {
  X,
  XCircle,
  Heart,
  Share,
  Download,
  Home,
  Search,
  RefreshCw,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Menu,
  type LucideIcon,
} from "lucide-react";

// Icon mapping object for easy replacement
export const iconMap = {
  // FontAwesome to Lucide mappings
  faTimesCircle: XCircle,
  faXmark: X,
  faHeart: Heart,
  faShare: Share,
  faDownload: Download,
  faHome: Home,
  faSearch: Search,
  faRefresh: RefreshCw,

  // MUI to Lucide mappings
  MenuIcon: Menu,
  CloseIcon: X,
  FacebookIcon: Facebook,
  InstagramIcon: Instagram,
  TwitterIcon: Twitter,
  LinkedInIcon: Linkedin,
} as const;

// Export individual icons for direct use
export {
  X as CloseIcon,
  XCircle as TimesCircleIcon,
  Heart as HeartIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  RefreshCw as RefreshIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  Linkedin as LinkedinIcon,
  Menu as MenuIcon,
};

// Type for icon components
export type IconComponent = LucideIcon;
