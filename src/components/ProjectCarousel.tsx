import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import type { Project } from '../data/projects'

interface Props {
  projects: Project[]
}

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '35%' : '-35%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? '-35%' : '35%',
    opacity: 0,
  }),
}

export default function ProjectCarousel({ projects }: Props) {
  const N = projects.length
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [itemsPerView, setItemsPerView] = useState(3)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth
      if (w >= 1024) setItemsPerView(3)
      else if (w >= 640) setItemsPerView(2)
      else setItemsPerView(1)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const goNext = useCallback(() => {
    setDirection(1)
    setCurrentIndex(prev => (prev + 1) % N)
  }, [N])

  const goPrev = useCallback(() => {
    setDirection(-1)
    setCurrentIndex(prev => (prev - 1 + N) % N)
  }, [N])

  useEffect(() => {
    if (isPaused || N <= 1) return
    intervalRef.current = setInterval(goNext, 5000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isPaused, goNext, N])

  const visibleProjects = Array.from({ length: itemsPerView }, (_, i) =>
    projects[(currentIndex + i) % N]
  )

  return (
    <div className="w-[85%] max-w-[1200px] mx-auto relative">
      <div
        className="relative"
        style={{ perspective: '1200px' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <button
          onClick={goPrev}
          className="carousel-arrow carousel-arrow-left"
          aria-label="Anterior"
        >
          <FaChevronLeft size={16} />
        </button>
        <button
          onClick={goNext}
          className="carousel-arrow carousel-arrow-right"
          aria-label="Próximo"
        >
          <FaChevronRight size={16} />
        </button>

        <div className="overflow-hidden rounded-[18px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              className="flex"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 320, damping: 30, mass: 0.8 }}
            >
              {visibleProjects.map((project, slotIndex) => {
                const isCenter = itemsPerView === 3 && slotIndex === 1
                const isSide = itemsPerView === 3 && (slotIndex === 0 || slotIndex === 2)
                const cardWidthPercent = 100 / itemsPerView

                let cardTransform = isCenter ? 'scale(1.05)' : isSide ? 'scale(0.88)' : 'scale(1)'
                if (isSide && slotIndex === 0) {
                  cardTransform = 'scale(0.88) perspective(800px) rotateY(4deg)'
                }
                if (isSide && slotIndex === 2) {
                  cardTransform = 'scale(0.88) perspective(800px) rotateY(-4deg)'
                }

                const cardStyle: React.CSSProperties = {
                  boxShadow: isCenter
                    ? '0 0 50px rgba(255,20,147,0.25), 0 0 100px rgba(216,180,254,0.12), 0 25px 60px rgba(0,0,0,0.5)'
                    : '0 0 20px rgba(255,20,147,0.04)',
                  borderColor: isCenter ? 'rgba(255,20,147,0.4)' : undefined,
                  transform: cardTransform,
                  filter: isCenter ? 'brightness(1.1)' : isSide ? 'brightness(0.6)' : undefined,
                  opacity: isSide ? 0.55 : 1,
                  zIndex: isCenter ? 2 : 1,
                  transformOrigin: isSide && slotIndex === 0
                    ? 'right center'
                    : isSide && slotIndex === 2
                      ? 'left center'
                      : 'center center',
                }

                return (
                  <div
                    key={project.titulo}
                    className="shrink-0 px-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{ width: `${cardWidthPercent}%` }}
                  >
                    <div
                      className="proj-card rounded-[18px] flex flex-col w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      style={cardStyle}
                    >
                      <div className="proj-card-scantop" />
                      <div className="proj-image-wrap">
                        <img
                          src={project.imagem}
                          alt={project.titulo}
                          className="proj-image"
                          style={{ objectPosition: project.imgPosition || 'center' }}
                        />
                      </div>
                      <div className="proj-content">
                        <h3 className="proj-title">{project.titulo}</h3>
                        <p className="proj-desc">{project.descricao}</p>
                        {project.tags.length > 0 && (
                          <div className="flex items-center gap-[8px] flex-wrap" style={{ marginTop: 14 }}>
                            {project.tags.map(tag => (
                              <span key={tag} className="proj-tag">{tag}</span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-center gap-3" style={{ marginTop: 20 }}>
                          {project.linkProjeto && (
                            <a
                              href={project.linkProjeto}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="proj-btn-primary flex items-center justify-center rounded-[10px]"
                              style={{ width: 140, height: 42 }}
                            >
                              Ver mais
                            </a>
                          )}
                          {project.linkGitHub && (
                            <a
                              href={project.linkGitHub}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="proj-btn-secondary flex items-center justify-center rounded-[10px]"
                              style={{ width: 120, height: 42 }}
                            >
                              GitHub
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: N }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > currentIndex ? 1 : -1)
              setCurrentIndex(i)
            }}
            className={`rounded-full transition-all duration-300 ${
              i === currentIndex
                ? 'w-6 h-2 bg-gradient-to-r from-[#FF1493] to-[#D8B4FE] shadow-[0_0_10px_rgba(255,20,147,0.3)]'
                : 'w-2 h-2 bg-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.3)]'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
