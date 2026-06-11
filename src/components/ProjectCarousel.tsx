import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import type { Project } from '../data/projects'

interface Props {
  projects: Project[]
}

export default function ProjectCarousel({ projects }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
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

  const maxIndex = Math.max(0, projects.length - itemsPerView)

  useEffect(() => {
    setCurrentIndex(prev => Math.min(prev, maxIndex))
  }, [maxIndex])

  const next = useCallback(() => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex))
  }, [maxIndex])

  const prev = useCallback(() => {
    setCurrentIndex(prev => Math.max(prev - 1, 0))
  }, [])

  useEffect(() => {
    if (isPaused || maxIndex === 0) return
    intervalRef.current = setInterval(next, 5000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isPaused, next, maxIndex])

  const cardWidthPercent = 100 / itemsPerView

  return (
    <div className="w-[85%] max-w-[1200px] mx-auto relative">
      <div
        className="relative"
        style={{ perspective: '1200px' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {currentIndex > 0 && (
          <button
            onClick={prev}
            className="carousel-arrow carousel-arrow-left"
            aria-label="Anterior"
          >
            <FaChevronLeft size={16} />
          </button>
        )}

        {currentIndex < maxIndex && (
          <button
            onClick={next}
            className="carousel-arrow carousel-arrow-right"
            aria-label="Próximo"
          >
            <FaChevronRight size={16} />
          </button>
        )}

        <div className="overflow-hidden rounded-[18px]">
          <motion.div
            className="flex"
            animate={{ x: `-${currentIndex * cardWidthPercent}%` }}
            transition={{ type: 'spring', stiffness: 320, damping: 30, mass: 0.8 }}
          >
            {projects.map((project, index) => {
              const posInView = index - currentIndex
              const isVisible = posInView >= 0 && posInView < itemsPerView

              if (!isVisible) {
                return (
                  <div
                    key={project.titulo}
                    className="shrink-0 px-2"
                    style={{ width: `${cardWidthPercent}%` }}
                  />
                )
              }

              const isCenter = itemsPerView === 3 && posInView === 1
              const isSide = itemsPerView === 3 && (posInView === 0 || posInView === 2)

              const cardStyle: React.CSSProperties = {
                boxShadow: isCenter
                  ? '0 0 50px rgba(255,20,147,0.25), 0 0 100px rgba(216,180,254,0.12), 0 25px 60px rgba(0,0,0,0.5)'
                  : '0 0 20px rgba(255,20,147,0.04)',
                borderColor: isCenter ? 'rgba(255,20,147,0.4)' : undefined,
                transform: isCenter
                  ? 'scale(1.05)'
                  : isSide
                    ? 'scale(0.88)'
                    : 'scale(1)',
                opacity: isSide ? 0.55 : 1,
                zIndex: isCenter ? 2 : 1,
              }

              if (isCenter) {
                cardStyle.filter = 'brightness(1.1)'
              }
              if (isSide) {
                cardStyle.filter = 'brightness(0.6)'
              }
              if (isSide && posInView === 0) {
                cardStyle.transform = 'scale(0.88) perspective(800px) rotateY(4deg)'
                cardStyle.transformOrigin = 'right center'
              }
              if (isSide && posInView === 2) {
                cardStyle.transform = 'scale(0.88) perspective(800px) rotateY(-4deg)'
                cardStyle.transformOrigin = 'left center'
              }

              return (
                <div
                  key={project.titulo}
                  className="shrink-0 px-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{ width: `${cardWidthPercent}%` }}
                >
                  <div className="proj-card rounded-[18px] flex flex-col w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" style={cardStyle}>
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
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
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
