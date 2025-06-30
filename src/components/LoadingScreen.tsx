import { motion } from "framer-motion";

export default function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen bg-main-bg bg-cover bg-center bg-no-repeat relative overflow-hidden">
      {/* Overlay glassmorphism con nueva paleta */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-bg/90 via-dark-surface/80 to-dark-bg/90" />
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-dark-red/20 to-dark-coral/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-gradient-to-r from-dark-coral/20 to-dark-rose/20 rounded-full blur-3xl" />
      <div className="text-center space-y-8 relative z-10">
        {/* Logo con animaciones hover geniales */}
        <motion.div
          className="relative group cursor-pointer"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {/* Efecto de brillo de fondo */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-dark-red/20 via-dark-coral/30 to-dark-rose/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Contenedor principal del logo */}
          <motion.div
            className="relative w-32 h-32 mx-auto bg-dark-surface/40 backdrop-blur-xl rounded-3xl flex items-center justify-center shadow-2xl border border-dark-blue-gray/30 group-hover:border-dark-coral/50 transition-all duration-300"
            whileHover={{
              boxShadow:
                "0 25px 50px -12px rgba(213, 86, 70, 0.25), 0 0 0 1px rgba(213, 86, 70, 0.1)",
              backgroundColor: "rgba(30, 30, 46, 0.6)",
            }}
          >
            {/* Efecto de partículas flotantes */}
            <motion.div
              className="absolute inset-0 rounded-3xl overflow-hidden"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-dark-coral/60 rounded-full"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + (i % 2) * 40}%`,
                  }}
                  animate={{
                    y: [-10, -20, -10],
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>

            {/* Logo principal con animaciones */}
            <motion.img
              src="/Logo.svg"
              alt="PDFai"
              className="w-20 h-20 relative z-10"
              whileHover={{
                scale: 1.1,
                rotate: [0, -5, 5, 0],
                filter: "brightness(1.2) saturate(1.3)",
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 15,
              }}
            />

            {/* Efecto de pulso en el borde */}
            <motion.div
              className="absolute inset-0 rounded-3xl border-2 border-dark-coral/0 group-hover:border-dark-coral/30"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          {/* Texto flotante en hover */}
          <motion.div
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300"
            initial={{ y: 10, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
          >
            <div className="px-3 py-1 bg-dark-surface/80 backdrop-blur-sm rounded-full border border-dark-coral/30">
              <span className="text-xs text-dark-coral font-medium">
                AI Powered
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Título */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-4"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-dark-red to-dark-coral bg-clip-text text-transparent">
            PDFai
          </h1>
          <p className="text-dark-rose text-lg font-medium">
            Inicializando aplicación...
          </p>
          <div className="inline-flex px-4 py-2 bg-dark-surface/40 backdrop-blur-sm rounded-full border border-dark-blue-gray/30">
            <span className="text-sm text-dark-blue-gray">
              AI-Powered PDF Chat
            </span>
          </div>
        </motion.div>

        {/* Spinner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.3 }}
          className="flex justify-center"
        >
          <div className="w-8 h-8 border-3 border-dark-blue-gray/30 border-t-dark-red rounded-full animate-spin" />
        </motion.div>

        {/* Puntos de carga */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.3 }}
          className="flex justify-center space-x-1"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-3 h-3 bg-gradient-to-r from-dark-red to-dark-coral rounded-full shadow-sm"
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
