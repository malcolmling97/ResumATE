import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Video, Loader2 } from 'lucide-react'
import { feedbackApi } from '@/services/api'

// Map health score (0-100) to tier (S, A-F)
const getVideoTier = (score) => {
  if (score >= 95) return 'S'
  if (score >= 85) return 'A'
  if (score >= 75) return 'B'
  if (score >= 65) return 'C'
  if (score >= 55) return 'D'
  if (score >= 45) return 'E'
  return 'F'
}

// Get video metadata based on tier
const getVideoMetadata = (tier, score) => {
  const metadata = {
    'S': { 
      title: '🏆 Perfect Resume!', 
      description: `Score: ${score}/100 - Absolutely outstanding work!`,
      color: 'text-purple-600'
    },
    'A': { 
      title: '🌟 Outstanding Resume!', 
      description: `Score: ${score}/100 - Your resume is exceptional!`,
      color: 'text-green-600'
    },
    'B': { 
      title: '👍 Great Resume!', 
      description: `Score: ${score}/100 - Your resume looks really good!`,
      color: 'text-blue-600'
    },
    'C': { 
      title: '✅ Good Resume', 
      description: `Score: ${score}/100 - Your resume is solid with room for improvement.`,
      color: 'text-cyan-600'
    },
    'D': { 
      title: '📝 Decent Resume', 
      description: `Score: ${score}/100 - Some areas could use improvement.`,
      color: 'text-yellow-600'
    },
    'E': { 
      title: '⚠️ Needs Improvement', 
      description: `Score: ${score}/100 - Consider revising several sections.`,
      color: 'text-orange-600'
    },
    'F': { 
      title: '🔧 Needs Major Work', 
      description: `Score: ${score}/100 - Let's improve this resume together!`,
      color: 'text-red-600'
    }
  }
  return metadata[tier] || metadata['C']
}

const FeedbackVideoButton = ({ 
  userId,
  jobDescription,
  variant = "outline", 
  size = "default", 
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [videoData, setVideoData] = useState(null)
  const [error, setError] = useState(null)
  const [availableVideos, setAvailableVideos] = useState({})

  // Scan for available videos in public/videos folder on component mount
  useEffect(() => {
    const scanVideos = async () => {
      const tiers = ['S', 'A', 'B', 'C', 'D', 'E', 'F']
      const videos = {}
      
      // Check for videos with the naming pattern: "X Tier.mp4"
      for (const tier of tiers) {
        videos[tier] = []
        const videoPath = `/videos/${tier} Tier.mp4`
        try {
          // Check if video exists by attempting to fetch its HEAD
          const response = await fetch(videoPath, { method: 'HEAD' })
          if (response.ok) {
            videos[tier].push(videoPath)
          }
        } catch (e) {
          // Video doesn't exist, continue
          console.log(`Video not found for tier ${tier}`)
        }
      }
      
      setAvailableVideos(videos)
    }
    
    scanVideos()
  }, [])

  const handleClick = async () => {
    // Validate required data
    if (!userId || !jobDescription) {
      setError('Missing user ID or job description. Please make sure your resume has this information.')
      setIsOpen(true)
      return
    }

    setIsOpen(true)
    setIsLoading(true)
    setError(null)
    setVideoData(null)

    try {
      // Analyze resume and get score from backend
      const response = await feedbackApi.analyzeResume(userId, jobDescription)
      const score = response.score || 0
      
      console.log('Resume analysis score received:', score)
      
      // Determine tier and get metadata
      const tier = getVideoTier(score)
      const metadata = getVideoMetadata(tier, score)
      
      console.log('Mapped to tier:', tier)
      console.log('Available videos:', availableVideos)
      
      // Get available videos for this tier
      const tierVideos = availableVideos[tier] || []
      
      if (tierVideos.length === 0) {
        setError(`No video found for tier ${tier}. Please check that "${tier} Tier.mp4" exists in frontend/public/videos/`)
        setIsLoading(false)
        return
      }
      
      // Pick a random video from the tier (only one per tier in your case)
      const videoPath = tierVideos[Math.floor(Math.random() * tierVideos.length)]
      
      console.log('Selected video:', videoPath)
      
      setVideoData({
        video_url: videoPath,
        tier: tier,
        score: score,
        ...metadata
      })
    } catch (err) {
      console.error('Error loading feedback video:', err)
      
      // Provide more helpful error messages
      let errorMessage = err.message || 'Failed to load feedback video'
      
      if (errorMessage.includes('Backend endpoint not available')) {
        errorMessage += '\n\nThe /api/analyze-resume endpoint needs to be implemented in your FastAPI backend.'
      } else if (errorMessage.includes('Cannot connect to backend')) {
        errorMessage += '\n\nMake sure your Python backend is running and VITE_PYTHON_BACKEND_URL is set correctly.'
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    // Reset state after animation completes
    setTimeout(() => {
      setVideoData(null)
      setError(null)
    }, 300)
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleClick}
      >
        <Video className="h-4 w-4" />
        Get Feedback
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className={videoData?.color}>
              {videoData?.title || 'Resume Feedback'}
            </DialogTitle>
            <DialogDescription>
              {videoData?.description || 'Watch this video reaction to your resume'}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-3 text-sm text-muted-foreground">
                  Analyzing your resume...
                </span>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                <p className="text-sm text-destructive font-semibold mb-2">
                  ⚠️ Error Loading Feedback
                </p>
                <p className="text-sm text-destructive whitespace-pre-line">
                  {error}
                </p>
              </div>
            )}

            {videoData && (
              <div className="space-y-4">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                  <video
                    key={videoData.video_url}
                    className="h-full w-full"
                    controls
                    autoPlay
                    src={videoData.video_url}
                  >
                    <source src={videoData.video_url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    Tier {videoData.tier}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Health Score: {videoData.score}/100
                  </span>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default FeedbackVideoButton

