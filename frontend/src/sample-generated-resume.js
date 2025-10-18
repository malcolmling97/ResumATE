/**
 * Sample resume data compatible with ResumeEditor.jsx
 * This mirrors the structure expected from the /api/generate-full-resume endpoint
 * after transformation by the frontend.
 * 
 * Usage:
 * import { sampleGeneratedResume } from './sample-generated-resume'
 * <ResumeEditor resume={sampleGeneratedResume} ... />
 */

export const sampleGeneratedResume = {
  id: "sample-resume-1",
  title: "Software Engineer - Full Stack Development",
  jobDescription: "We are seeking a talented Full Stack Software Engineer to join our dynamic team. The ideal candidate will have experience with React, Node.js, and cloud technologies. You will be responsible for developing scalable web applications, working with RESTful APIs, and collaborating with cross-functional teams to deliver high-quality software solutions. Strong problem-solving skills and experience with agile methodologies are essential.",
  
  contactInfo: {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567"
  },
  
  workExperience: [
    {
      id: "exp-1",
      title: "Senior Software Engineer",
      company: "TechCorp Solutions",
      startDate: "2021-06",
      endDate: "Present",
      bullets: [
        "Architected and deployed a microservices-based platform serving 500K+ daily active users, reducing system latency by 40% through optimized API design and caching strategies",
        "Led cross-functional team of 5 engineers to deliver React-based dashboard, improving user engagement by 65% and reducing support tickets by 30%",
        "Implemented CI/CD pipeline using GitHub Actions and AWS, reducing deployment time from 2 hours to 15 minutes and increasing release frequency by 3x",
        "Mentored 3 junior developers and conducted code reviews, establishing best practices that improved code quality metrics by 45%"
      ]
    },
    {
      id: "exp-2",
      title: "Full Stack Developer",
      company: "StartupXYZ",
      startDate: "2019-03",
      endDate: "2021-05",
      bullets: [
        "Built RESTful APIs using Node.js and Express, handling 10M+ monthly requests with 99.9% uptime",
        "Developed responsive React components used by 100K+ users across web and mobile platforms",
        "Optimized database queries and implemented Redis caching, reducing average page load time from 3.5s to 800ms"
      ]
    }
  ],
  
  projects: [
    {
      id: "proj-1",
      title: "Real-Time Collaboration Platform",
      date: "2023",
      bullets: [
        "Developed real-time collaborative editing tool using WebSockets and React, supporting 50+ concurrent users per session",
        "Implemented conflict resolution algorithm reducing data inconsistencies by 95%",
        "Achieved 4.8/5.0 user satisfaction rating from 1000+ beta testers"
      ]
    },
    {
      id: "proj-2",
      title: "AI-Powered Resume Optimizer",
      date: "2022",
      bullets: [
        "Built full-stack application using React, FastAPI, and OpenAI API to generate tailored resume content",
        "Integrated Supabase for authentication and database management, serving 5000+ registered users",
        "Reduced resume creation time by 70% based on user feedback surveys"
      ]
    }
  ],
  
  education: [
    {
      institution: "Massachusetts Institute of Technology",
      degree: "Bachelor of Science in Computer Science",
      year: "2019",
      gpa: "3.8/4.0"
    }
  ],
  
  skills: [
    "React",
    "Node.js",
    "JavaScript/TypeScript",
    "Python",
    "FastAPI",
    "AWS",
    "Docker",
    "PostgreSQL",
    "Redis",
    "RESTful APIs",
    "Git",
    "Agile/Scrum"
  ]
}

/**
 * Helper function to transform API response to ResumeEditor format
 * This shows how to convert the /api/generate-full-resume response
 * to the format expected by ResumeEditor.jsx
 * 
 * @param {Object} apiResponse - Response from /api/generate-full-resume
 * @param {string} title - Resume title
 * @param {string} jobDescription - Job description used for generation
 * @returns {Object} - Formatted for ResumeEditor
 */
export const transformApiResponseToResumeEditor = (apiResponse, title, jobDescription) => {
  return {
    id: `resume-${Date.now()}`, // Generate unique ID
    title: title || "Tailored Resume",
    jobDescription: jobDescription || "",
    contactInfo: apiResponse.contactInfo,
    
    // Transform experiences: add id and rename points to bullets
    workExperience: apiResponse.experiences?.map((exp, idx) => ({
      id: `exp-${idx}`,
      title: exp.title,
      company: exp.company,
      startDate: exp.startDate,
      endDate: exp.endDate,
      bullets: exp.points || []
    })) || [],
    
    // Transform projects: add id and rename points to bullets
    projects: apiResponse.projects?.map((proj, idx) => ({
      id: `proj-${idx}`,
      title: proj.title,
      date: proj.date,
      bullets: proj.points || []
    })) || [],
    
    education: apiResponse.education || [],
    skills: apiResponse.skills || []
  }
}

/**
 * Sample API response from /api/generate-full-resume endpoint
 * This is what the backend actually returns (before transformation)
 */
export const sampleApiResponse = {
  contactInfo: {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567"
  },
  
  skills: [
    "React",
    "Node.js",
    "JavaScript/TypeScript",
    "Python",
    "FastAPI",
    "AWS",
    "Docker",
    "PostgreSQL",
    "Redis",
    "RESTful APIs",
    "Git",
    "Agile/Scrum"
  ],
  
  experiences: [
    {
      title: "Senior Software Engineer",
      company: "TechCorp Solutions",
      startDate: "2021-06",
      endDate: "Present",
      points: [
        "Architected and deployed a microservices-based platform serving 500K+ daily active users, reducing system latency by 40% through optimized API design and caching strategies",
        "Led cross-functional team of 5 engineers to deliver React-based dashboard, improving user engagement by 65% and reducing support tickets by 30%",
        "Implemented CI/CD pipeline using GitHub Actions and AWS, reducing deployment time from 2 hours to 15 minutes and increasing release frequency by 3x",
        "Mentored 3 junior developers and conducted code reviews, establishing best practices that improved code quality metrics by 45%"
      ]
    },
    {
      title: "Full Stack Developer",
      company: "StartupXYZ",
      startDate: "2019-03",
      endDate: "2021-05",
      points: [
        "Built RESTful APIs using Node.js and Express, handling 10M+ monthly requests with 99.9% uptime",
        "Developed responsive React components used by 100K+ users across web and mobile platforms",
        "Optimized database queries and implemented Redis caching, reducing average page load time from 3.5s to 800ms"
      ]
    }
  ],
  
  projects: [
    {
      title: "Real-Time Collaboration Platform",
      date: "2023",
      points: [
        "Developed real-time collaborative editing tool using WebSockets and React, supporting 50+ concurrent users per session",
        "Implemented conflict resolution algorithm reducing data inconsistencies by 95%",
        "Achieved 4.8/5.0 user satisfaction rating from 1000+ beta testers"
      ]
    },
    {
      title: "AI-Powered Resume Optimizer",
      date: "2022",
      points: [
        "Built full-stack application using React, FastAPI, and OpenAI API to generate tailored resume content",
        "Integrated Supabase for authentication and database management, serving 5000+ registered users",
        "Reduced resume creation time by 70% based on user feedback surveys"
      ]
    }
  ],
  
  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      institution: "Massachusetts Institute of Technology",
      year: "2019"
    }
  ]
}
