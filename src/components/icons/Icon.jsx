// One icon system for the whole app: semantic names → Lucide line icons (MIT), one stroke weight,
// sized in em so they follow the text size setting. Decorative by default (aria-hidden);
// pass `label` when the icon is the only thing that says what something means.
import {
  Flame, Coins, Trophy, House, Map, Layers, Flag, User, Zap, SquareParking, Settings, Check, X, ChevronRight,
  ChevronDown, ArrowLeft, ArrowRight, Star, Lock, LockOpen, Target, Gift, Snowflake, Rocket, Sparkles, Brain, Timer,
  CalendarDays, Lightbulb, Repeat, Skull, Swords, Heart, HeartCrack, Shirt, Palette, PartyPopper, Wrench, Pause,
  Play, Download, Upload, Share, Plus, BookOpen, Crown, Medal, Bug, Gauge, Workflow, LayoutTemplate, ShieldCheck,
  Smartphone, Bell, Clock, TrendingUp, Hand, Scissors, PenLine, Mountain, Leaf, Sun, Moon, Award, Puzzle,
  FlaskConical, Cpu, Infinity as InfinityIcon, TriangleAlert, RotateCcw, WrapText, MoveHorizontal, ListChecks,
  Compass, Library, Hourglass, Shuffle, Eye, Sprout, Dumbbell, Smile, Coffee, MessageCircle, CircleCheck,
  CircleX, Circle, Info, Keyboard, Copy, Volume2, Code, Database, Cloud, Layers3, Wand, Sunrise, Bot, Apple,
} from 'lucide-react';

export const ICONS = {
  // navigation
  home: House, map: Map, cards: Layers, exam: Flag, me: User, settings: Settings, back: ArrowLeft, next: ArrowRight,
  chevron: ChevronRight, down: ChevronDown, close: X, plan: CalendarDays, library: Library, compass: Compass,
  // game
  bolt: Zap, flame: Flame, coin: Coins, trophy: Trophy, star: Star, lock: Lock, unlock: LockOpen, target: Target,
  gift: Gift, freeze: Snowflake, rocket: Rocket, sparkles: Sparkles, crown: Crown, medal: Medal, award: Award,
  heart: Heart, heartBroken: HeartCrack, skull: Skull, swords: Swords, wand: Wand, puzzle: Puzzle,
  // study
  brain: Brain, timer: Timer, hourglass: Hourglass, clock: Clock, idea: Lightbulb, review: Repeat, book: BookOpen,
  checklist: ListChecks, pen: PenLine, sprout: Sprout, muscle: Dumbbell, trend: TrendingUp, shuffle: Shuffle,
  eye: Eye, keyboard: Keyboard, code: Code, copy: Copy, speaker: Volume2,
  // sections (exam domains)
  fund: ShieldCheck, auto: Workflow, ui: LayoutTemplate, test: FlaskConical, perf: Gauge, bug: Bug, cpu: Cpu,
  database: Database, cloud: Cloud, layers: Layers3,
  // states & actions
  check: Check, ok: CircleCheck, wrong: CircleX, dot: Circle, warn: TriangleAlert, info: Info, pause: Pause, play: Play,
  park: SquareParking, retry: RotateCcw, wrap: WrapText, scroll: MoveHorizontal, infinity: InfinityIcon,
  download: Download, upload: Upload, share: Share, add: Plus, bell: Bell, phone: Smartphone, scissors: Scissors,
  hand: Hand, party: PartyPopper, shirt: Shirt, palette: Palette, tools: Wrench, smile: Smile, coffee: Coffee,
  chat: MessageCircle, leaf: Leaf, sun: Sun, moon: Moon, sunrise: Sunrise, mountain: Mountain, bot: Bot, apple: Apple,
};

/**
 * <Icon name="flame" /> · size in em (default 1.15em, follows text size) · `label` makes it meaningful to screen readers.
 * `fill` paints the inside (e.g. a filled star or heart).
 */
export function Icon({ name, size = '1.15em', label, fill = false, strokeWidth = 2.25, className = '', style }) {
  const C = ICONS[name];
  if (!C) return null;
  return (
    <C
      className={`icon ${className}`}
      width={size} height={size} strokeWidth={strokeWidth}
      fill={fill ? 'currentColor' : 'none'}
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      focusable="false"
      style={style}
    />
  );
}
