
import { 
  Settings, 
  Book, 
  X, 
  Check, 
  Loader2, 
  Coins, 
  Store, 
  Backpack, 
  Coffee, 
  Key, 
  ScrollText, 
  Anchor, 
  Shield, 
  Feather, 
  GraduationCap, 
  BookOpen, 
  Map, 
  Compass, 
  Crown, 
  HelpCircle,
  ChevronDown
} from 'lucide-react';

// Exporting Lucide components mapped to the names used in the app.
// Lucide icons accept standard SVG props like className, width, height, etc.
export const Icons = {
  // UI Icons
  Settings: Settings,
  Book: Book,
  Cross: X, // Alias Cross to X
  Check: Check,
  Loader: Loader2, // Alias Loader to Loader2 (spinner)
  Coin: Coins,
  Store: Store,
  Satchel: Backpack, // Alias Satchel to Backpack
  ChevronDown: ChevronDown,
  
  // Shop Icons
  Coffee: Coffee,
  Key: Key,
  Scroll: ScrollText,
  Anchor: Anchor,
  Shield: Shield,
  PenTool: Feather, // Feather looks more "fantasy writer" than the vector Pen Tool
  GraduationCap: GraduationCap,
  BookOpen: BookOpen,
  Map: Map,
  Compass: Compass,
  Crown: Crown,
  Default: HelpCircle
};
