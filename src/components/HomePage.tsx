import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Merge,
  Split,
  Archive,
  Presentation,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Mic,
  Plus,
  Zap,
  Clock,
  Brain,
  FileSearch,
  Download,
  Upload,
} from "lucide-react";
import { useTheme } from "@/lib/hooks/useTheme";
import { useScreenSize } from "@/lib/hooks/useScreenSize";
import { cn } from "@/lib/utils";

interface BentoItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  feature?: "chat" | "voice" | "features" | "stats" | "timeline";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

const bentoItems: BentoItem[] = [
  {
    id: "main",
    title: "ChatPDFai",
    description:
      "Conversa con tus documentos PDF usando inteligencia artificial avanzada. Extrae información, resume contenido y obtén respuestas instantáneas.",
    icon: MessageSquare,
    feature: "chat",
    size: "lg",
    className: "col-span-2 row-span-1 md:col-span-2 md:row-span-1",
  },
  {
    id: "features",
    title: "Herramientas PDF Completas",
    description:
      "Suite completa de herramientas para manipular PDFs con la potencia de la IA",
    icon: FileText,
    feature: "features",
    size: "md",
    className: "col-span-2 row-span-1",
  },
  {
    id: "voice",
    title: "Asistente de Voz",
    description: "Interactúa con tus PDFs usando comandos de voz naturales",
    icon: Mic,
    feature: "voice",
    size: "md",
    className: "col-span-1 row-span-1",
  },
  {
    id: "stats",
    title: "Estadísticas de Uso",
    description: "Monitorea tu productividad y el rendimiento de la IA",
    icon: Brain,
    feature: "stats",
    size: "sm",
    className: "col-span-1 row-span-1",
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const ChatFeature = () => {
  const features = [
    "Análisis inteligente de documentos",
    "Resúmenes automáticos",
    "Extracción de datos clave",
    "Búsqueda semántica avanzada",
    "Respuestas contextuales",
  ];

  return (
    <ul className="mt-4 space-y-2">
      {features.map((feature, index) => (
        <motion.li
          key={feature}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 * index }}
          className="flex items-center gap-2"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
          <span className="text-sm text-neutral-700 dark:text-neutral-300">
            {feature}
          </span>
        </motion.li>
      ))}
    </ul>
  );
};

const FeaturesGrid = () => {
  const tools = [
    { icon: MessageSquare, name: "Chat IA", color: "bg-blue-500" },
    { icon: Merge, name: "Combinar", color: "bg-green-500" },
    { icon: Split, name: "Dividir", color: "bg-orange-500" },
    { icon: Archive, name: "Comprimir", color: "bg-purple-500" },
    { icon: Presentation, name: "Diapositivas", color: "bg-red-500" },
    { icon: FileSearch, name: "Buscar", color: "bg-indigo-500" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mt-4">
      {tools.map((tool, index) => (
        <motion.div
          key={tool.name}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 * index }}
          className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-b from-neutral-100/80 to-neutral-100 dark:from-neutral-800/80 dark:to-neutral-800 border border-neutral-200/50 dark:border-neutral-700/50 group transition-all duration-300 hover:border-neutral-300 dark:hover:border-neutral-600 cursor-pointer"
        >
          <div
            className={`w-8 h-8 rounded-lg ${tool.color} flex items-center justify-center`}
          >
            <tool.icon className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-medium text-center text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-200">
            {tool.name}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isListening) {
      interval = setInterval(() => setTime(t => t + 1), 1000);
    } else {
      setTime(0);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <button
        onClick={() => setIsListening(!isListening)}
        className={cn(
          "w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300",
          isListening
            ? "bg-red-500 hover:bg-red-600"
            : "bg-blue-500 hover:bg-blue-600"
        )}
      >
        {isListening ? (
          <div className="w-6 h-6 rounded-sm bg-white animate-pulse" />
        ) : (
          <Mic className="w-6 h-6 text-white" />
        )}
      </button>

      <span className="font-mono text-sm text-neutral-600 dark:text-neutral-400">
        {formatTime(time)}
      </span>

      <div className="h-4 w-48 flex items-center justify-center gap-0.5">
        {[...Array(32)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-0.5 rounded-full transition-all duration-300",
              isListening
                ? "bg-blue-500 animate-pulse"
                : "bg-neutral-300 dark:bg-neutral-600 h-1"
            )}
            style={
              isListening
                ? {
                    height: `${20 + Math.random() * 60}%`,
                    animationDelay: `${i * 0.05}s`,
                  }
                : undefined
            }
          />
        ))}
      </div>

      <p className="text-xs text-neutral-600 dark:text-neutral-400">
        {isListening ? "Escuchando..." : "Click para hablar"}
      </p>
    </div>
  );
};

const StatsFeature = () => {
  const stats = [
    {
      label: "Documentos procesados",
      value: 156,
      suffix: "",
      color: "bg-blue-500",
    },
    { label: "Tiempo ahorrado", value: 89, suffix: "h", color: "bg-green-500" },
    { label: "Precisión IA", value: 97, suffix: "%", color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-3 mt-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 * index }}
          className="space-y-1"
        >
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-700 dark:text-neutral-300 font-medium">
              {stat.label}
            </span>
            <span className="text-neutral-700 dark:text-neutral-300 font-semibold">
              {stat.value}
              {stat.suffix}
            </span>
          </div>
          <div className="h-1.5 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${stat.color}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, stat.value)}%` }}
              transition={{
                duration: 1.2,
                ease: "easeOut",
                delay: 0.15 * index,
              }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

interface BentoCardProps {
  item: BentoItem;
}

const BentoCard = ({ item }: BentoCardProps) => {
  const { effectiveTheme } = useTheme();
  const { getResponsiveClasses, getResponsiveSpacing } = useScreenSize();
  const isDark = effectiveTheme === "dark";

  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="h-full"
    >
      <div
        className={`
          group relative flex flex-col gap-4 h-full cursor-pointer
          bg-gradient-to-br from-white/80 via-white/60 to-neutral-50/80
          dark:from-neutral-900/80 dark:via-neutral-900/60 dark:to-neutral-800/80
          border border-neutral-200/60 dark:border-neutral-700/60
          backdrop-blur-xl
          shadow-[0_8px_32px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgb(0,0,0,0.3)]
          hover:border-neutral-300/70 dark:hover:border-neutral-600/70
          hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_12px_40px_rgb(0,0,0,0.4)]
          transition-all duration-500 ease-out
          ${getResponsiveClasses({
            mobile: "rounded-macos-lg p-4",
            tablet: "rounded-macos-xl p-5",
            desktop: "rounded-macos-2xl p-6",
          })}
          ${item.className}
        `}
        onClick={item.onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <item.icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-aventi-subtitle tracking-tight text-neutral-900 dark:text-neutral-100">
              {item.title}
            </h3>
          </div>
          <ArrowUpRight className="h-5 w-5 text-neutral-400 dark:text-neutral-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        </div>

        <p className="text-sm text-neutral-600 dark:text-neutral-400 tracking-tight">
          {item.description}
        </p>

        {/* Feature specific content */}
        {item.feature === "chat" && <ChatFeature />}
        {item.feature === "features" && <FeaturesGrid />}
        {item.feature === "voice" && <VoiceAssistant />}
        {item.feature === "stats" && <StatsFeature />}
      </div>
    </motion.div>
  );
};

interface HomePageProps {
  onStartChat?: () => void;
}

export default function HomePage({ onStartChat }: HomePageProps) {
  const { effectiveTheme } = useTheme();
  const { getResponsiveClasses, getResponsiveSpacing } = useScreenSize();
  const isDark = effectiveTheme === "dark";

  return (
    <div
      className={`min-h-0 h-full overflow-y-auto ${getResponsiveSpacing({
        mobile: "py-4 px-3",
        tablet: "py-6 px-6",
        desktop: "py-8 px-4",
      })}`}
    >
      <div
        className={`mx-auto ${getResponsiveClasses({
          mobile: "max-w-sm",
          tablet: "max-w-4xl",
          desktop: "max-w-6xl",
        })}`}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8 md:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-aventi-heading text-neutral-900 dark:text-neutral-100 mb-4">
            <span className="bg-gradient-light-accent bg-clip-text text-transparent dark:text-dark-coral">
              ChatPDFai
            </span>
          </h1>
          <p className="text-base sm:text-lg font-bricolage text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto px-4">
            La suite más completa para trabajar con PDFs potenciada por
            inteligencia artificial
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className={`grid ${getResponsiveClasses({
            mobile: "gap-4",
            tablet: "gap-5",
            desktop: "gap-6",
          })}`}
        >
          <div
            className={`grid ${getResponsiveClasses({
              mobile: "grid-cols-1 gap-4",
              tablet: "grid-cols-2 gap-5",
              desktop: "grid-cols-3 gap-6",
            })}`}
          >
            <div
              className={getResponsiveClasses({
                mobile: "col-span-1",
                tablet: "col-span-2",
                desktop: "col-span-2",
              })}
            >
              <BentoCard item={bentoItems[0]} />
            </div>
            <div
              className={getResponsiveClasses({
                mobile: "col-span-1",
                tablet: "col-span-2",
                desktop: "col-span-1",
              })}
            >
              <BentoCard item={bentoItems[2]} />
            </div>
          </div>
          <div
            className={`grid ${getResponsiveClasses({
              mobile: "grid-cols-1 gap-4",
              tablet: "grid-cols-2 gap-5",
              desktop: "grid-cols-2 gap-6",
            })}`}
          >
            <BentoCard item={bentoItems[1]} />
            <BentoCard item={bentoItems[3]} />
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-center mt-6 sm:mt-8 md:mt-12"
        >
          <button
            onClick={onStartChat}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-light-accent hover:bg-light-accent-hover text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Comenzar a Chatear
            </span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
