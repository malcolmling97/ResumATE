import query from "../db/index.js"
import crypto from "crypto"

// Simplified create - stores resume as JSON for now
const createCuratedResumeSimple = async (userId, resumeData) => {
  try {
    console.log('Creating curated resume (simple version) for user:', userId)

    const {
      title,
      jobDescription,
      jobTitle,
      jobCompany,
      jobUrl,
    } = resumeData

    // 1. Create job record
    let jobId = null
    if (jobDescription) {
      const jobIdVal = crypto.randomUUID()
      console.log('Creating job record with ID:', jobIdVal)
      
      const jobResult = await query(
        `INSERT INTO jobs(id, user_id, title, company, description, job_url)
         VALUES($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [jobIdVal, userId, jobTitle || 'Untitled Job', jobCompany || null, jobDescription, jobUrl || null]
      )
      jobId = jobResult.rows[0].id
      console.log('Job created:', jobId)
    }

    // 2. Create curated resume
    const curatedResumeId = crypto.randomUUID()
    console.log('Creating curated resume with ID:', curatedResumeId)
    
    const curatedResumeResult = await query(
      `INSERT INTO curated_resumes(
        id, user_id, job_id, title, is_ai_generated,
        generation_prompt, model_used, generation_notes, status
      )
       VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, title, status, created_at`,
      [
        curatedResumeId,
        userId,
        jobId,
        title || `Resume for ${jobTitle || 'Job'}`,
        true,
        resumeData.generationPrompt || null,
        resumeData.modelUsed || 'mock',
        resumeData.generationNotes || null,
        'draft'
      ]
    )

    console.log('Curated resume created successfully')

    return {
      id: curatedResumeId,
      ...curatedResumeResult.rows[0],
      jobId
    }
  } catch (error) {
    console.error("Error creating curated resume (simple):", error.message)
    console.error("Error stack:", error.stack)
    console.error("Error code:", error.code)
    throw error
  }
}

// Create a new curated resume with all related data
const createCuratedResume = async (userId, resumeData) => {
  console.log('Starting createCuratedResume for user:', userId)
  
  const client = await query.pool.connect()
  console.log('Database client connected')
  
  try {
    await client.query('BEGIN')
    console.log('Transaction started')

    const {
      title,
      jobDescription,
      jobTitle,
      jobCompany,
      jobUrl,
      generationPrompt,
      modelUsed,
      generationNotes,
      contactInfo,
      skills,
      experiences,
      projects,
      education
    } = resumeData

    // 1. Create job record
    let jobId = null
    if (jobDescription) {
      const jobIdResult = crypto.randomUUID()
      console.log('Creating job...')
      const jobResult = await client.query(
        `INSERT INTO jobs(id, user_id, title, company, description, job_url)
         VALUES($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [jobIdResult, userId, jobTitle || 'Untitled Job', jobCompany || null, jobDescription, jobUrl || null]
      )
      jobId = jobResult.rows[0].id
      console.log('Job created:', jobId)
    }

    // 2. Create curated resume
    const curatedResumeId = crypto.randomUUID()
    console.log('Creating curated resume...')
    const curatedResumeResult = await client.query(
      `INSERT INTO curated_resumes(
        id, user_id, job_id, title, is_ai_generated,
        generation_prompt, model_used, generation_notes, status
      )
       VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, title, status, created_at`,
      [
        curatedResumeId,
        userId,
        jobId,
        title || `Resume for ${jobTitle || 'Job'}`,
        true,
        generationPrompt,
        modelUsed || 'mock',
        generationNotes,
        'draft'
      ]
    )
    console.log('Curated resume created')

    // 3. Process experiences - Create resume items if needed, then link
    if (experiences && experiences.length > 0) {
      console.log(`Processing ${experiences.length} experiences...`)
      for (let i = 0; i < experiences.length; i++) {
        const exp = experiences[i]
        console.log(`Processing experience ${i + 1}/${experiences.length}:`, exp.title)
        
        let resumeItemId = exp.id
        
        // Check if this is a temp ID (like "exp-0") or doesn't exist in DB
        const isValidUUID = resumeItemId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resumeItemId)
        
        if (!isValidUUID) {
          // Create a new resume_item entry
          resumeItemId = crypto.randomUUID()
          console.log(`Creating new resume_item for experience: ${exp.title}`)
          
          // Parse and validate dates
          const parseDate = (dateStr) => {
            if (!dateStr) return null
            // If it's a placeholder like "Start Date", "End Date", return null
            if (typeof dateStr === 'string' && (dateStr.toLowerCase().includes('start') || dateStr.toLowerCase().includes('end') || dateStr.toLowerCase() === 'present')) {
              return null
            }
            // Handle year-only format (YYYY) by converting to YYYY-01-01
            if (typeof dateStr === 'string' && /^\d{4}$/.test(dateStr)) {
              return `${dateStr}-01-01`
            }
            // Handle YYYY-MM format from FastAPI by converting to YYYY-MM-01
            if (typeof dateStr === 'string' && /^\d{4}-\d{2}$/.test(dateStr)) {
              return `${dateStr}-01`
            }
            // Try to parse as date
            const date = new Date(dateStr)
            return !isNaN(date.getTime()) ? dateStr : null
          }
          
          await client.query(
            `INSERT INTO resume_items(
              id, user_id, item_type, title, organization,
              start_date, end_date, description
            )
             VALUES($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id`,
            [
              resumeItemId,
              userId,
              'experience',
              exp.title,
              exp.company,
              parseDate(exp.startDate),
              parseDate(exp.endDate),
              null
            ]
          )
        }

        // Create junction
        const junctionId = crypto.randomUUID()
        await client.query(
          `INSERT INTO curated_resume_items_junction(
            id, curated_resume_id, resume_item_id, display_order,
            title_override, organization_override, was_edited_by_user
          )
           VALUES($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [
            junctionId,
            curatedResumeId,
            resumeItemId,
            i,
            null, // We're storing the actual values in resume_items now
            null,
            false
          ]
        )

        // Add bullet points to curated_resume_item_points
        if (exp.points && exp.points.length > 0) {
          console.log(`Adding ${exp.points.length} points to experience ${i + 1}`)
          for (let j = 0; j < exp.points.length; j++) {
            const point = exp.points[j]
            const content = typeof point === 'string' ? point : point.content
            const originalPointId = typeof point === 'object' ? point.id : null
            const wasModified = typeof point === 'object' ? point.wasAiModified : false
            
            await client.query(
              `INSERT INTO curated_resume_item_points(
                id, curated_resume_item_junction_id, original_point_id,
                content, display_order, was_ai_generated, was_ai_modified
              )
               VALUES($1, $2, $3, $4, $5, $6, $7)`,
              [
                crypto.randomUUID(),
                junctionId,
                originalPointId, // Link to original point in master resume
                content,
                j,
                true,
                wasModified
              ]
            )
          }
        }
      }
      console.log('Experiences processed')
    }

    // 4. Process projects - Create resume items if needed, then link
    if (projects && projects.length > 0) {
      console.log(`Processing ${projects.length} projects...`)
      for (let i = 0; i < projects.length; i++) {
        const proj = projects[i]
        console.log(`Processing project ${i + 1}/${projects.length}:`, proj.title)
        
        let resumeItemId = proj.id
        
        // Check if this is a temp ID (like "proj-0") or doesn't exist in DB
        const isValidUUID = resumeItemId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resumeItemId)
        
        if (!isValidUUID) {
          // Create a new resume_item entry
          resumeItemId = crypto.randomUUID()
          console.log(`Creating new resume_item for project: ${proj.title}`)
          
          // Parse and validate date
          const parseDate = (dateStr) => {
            if (!dateStr) return null
            // If it's a placeholder, return null
            if (typeof dateStr === 'string' && (dateStr.toLowerCase().includes('date') || dateStr.toLowerCase() === 'present')) {
              return null
            }
            // Handle year-only format (YYYY) by converting to YYYY-01-01
            if (typeof dateStr === 'string' && /^\d{4}$/.test(dateStr)) {
              return `${dateStr}-01-01`
            }
            // Handle YYYY-MM format from FastAPI by converting to YYYY-MM-01
            if (typeof dateStr === 'string' && /^\d{4}-\d{2}$/.test(dateStr)) {
              return `${dateStr}-01`
            }
            // Try to parse as date
            const date = new Date(dateStr)
            return !isNaN(date.getTime()) ? dateStr : null
          }
          
          await client.query(
            `INSERT INTO resume_items(
              id, user_id, item_type, title,
              start_date, description
            )
             VALUES($1, $2, $3, $4, $5, $6)
             RETURNING id`,
            [
              resumeItemId,
              userId,
              'project',
              proj.title,
              parseDate(proj.date),
              null
            ]
          )
        }

        // Create junction
        const junctionId = crypto.randomUUID()
        await client.query(
          `INSERT INTO curated_resume_items_junction(
            id, curated_resume_id, resume_item_id, display_order,
            title_override, was_edited_by_user
          )
           VALUES($1, $2, $3, $4, $5, $6)
           RETURNING id`,
          [
            junctionId,
            curatedResumeId,
            resumeItemId,
            i + (experiences?.length || 0),
            null, // We're storing the actual values in resume_items now
            false
          ]
        )

        // Add bullet points to curated_resume_item_points
        if (proj.points && proj.points.length > 0) {
          console.log(`Adding ${proj.points.length} points to project ${i + 1}`)
          for (let j = 0; j < proj.points.length; j++) {
            const point = proj.points[j]
            const content = typeof point === 'string' ? point : point.content
            const originalPointId = typeof point === 'object' ? point.id : null
            const wasModified = typeof point === 'object' ? point.wasAiModified : false
            
            await client.query(
              `INSERT INTO curated_resume_item_points(
                id, curated_resume_item_junction_id, original_point_id,
                content, display_order, was_ai_generated, was_ai_modified
              )
               VALUES($1, $2, $3, $4, $5, $6, $7)`,
              [
                crypto.randomUUID(),
                junctionId,
                originalPointId, // Link to original point in master resume
                content,
                j,
                true,
                wasModified
              ]
            )
          }
        }
      }
      console.log('Projects processed')
    }

    await client.query('COMMIT')
    console.log('Transaction committed')
    
    return {
      id: curatedResumeId,
      ...curatedResumeResult.rows[0],
      jobId
    }
  } catch (error) {
    await client.query('ROLLBACK')
    console.error("Error creating curated resume:", error.message)
    console.error("Error stack:", error.stack)
    console.error("Error code:", error.code)
    throw error
  } finally {
    client.release()
    console.log('Database client released')
  }
}

// Get all curated resumes for a user
const getUserCuratedResumes = async (userId) => {
  try {
    const results = await query(
      `SELECT cr.id, cr.title, cr.status, cr.is_ai_generated,
              cr.created_at, cr.updated_at, cr.finalized_at,
              j.title as job_title, j.company as job_company
       FROM curated_resumes cr
       LEFT JOIN jobs j ON cr.job_id = j.id
       WHERE cr.user_id = $1
       ORDER BY cr.created_at DESC`,
      [userId]
    )
    return results.rows
  } catch (error) {
    console.error("Error fetching curated resumes:", error.message)
    throw new Error("DB error while fetching curated resumes.")
  }
}

// Get a single curated resume with all details
const getCuratedResumeById = async (curatedResumeId, userId) => {
  const client = await query.pool.connect()
  
  try {
    // Get main resume data
    const resumeResult = await client.query(
      `SELECT cr.*, j.title as job_title, j.company as job_company, j.description as job_description
       FROM curated_resumes cr
       LEFT JOIN jobs j ON cr.job_id = j.id
       WHERE cr.id = $1 AND cr.user_id = $2`,
      [curatedResumeId, userId]
    )

    if (resumeResult.rows.length === 0) {
      return null
    }

    const resume = resumeResult.rows[0]

    // Get all items with their points
    const itemsResult = await client.query(
      `SELECT 
        crij.id as junction_id,
        crij.display_order,
        crij.title_override,
        crij.organization_override,
        crij.was_edited_by_user,
        ri.*
       FROM curated_resume_items_junction crij
       JOIN resume_items ri ON crij.resume_item_id = ri.id
       WHERE crij.curated_resume_id = $1
       ORDER BY crij.display_order ASC`,
      [curatedResumeId]
    )

    // Get points for all items
    const pointsResult = await client.query(
      `SELECT crip.*
       FROM curated_resume_item_points crip
       JOIN curated_resume_items_junction crij ON crip.curated_resume_item_junction_id = crij.id
       WHERE crij.curated_resume_id = $1
       ORDER BY crip.display_order ASC`,
      [curatedResumeId]
    )

    // Organize data
    const experiences = []
    const projects = []
    
    for (const item of itemsResult.rows) {
      const itemPoints = pointsResult.rows
        .filter(p => p.curated_resume_item_junction_id === item.junction_id)
        .map(p => p.content)

      const itemData = {
        id: item.id,
        title: item.title_override || item.title,
        points: itemPoints,
        wasEdited: item.was_edited_by_user
      }

      if (item.item_type === 'experience') {
        itemData.company = item.organization_override || item.organization
        itemData.startDate = item.start_date
        itemData.endDate = item.end_date
        experiences.push(itemData)
      } else if (item.item_type === 'project') {
        itemData.date = item.start_date
        projects.push(itemData)
      }
    }

    // Fetch user's skills from skills table
    const skillsResult = await client.query(
      `SELECT name, category, level 
       FROM skills 
       WHERE user_id = $1 
       ORDER BY created_at ASC`,
      [userId]
    )
    const skills = skillsResult.rows.map(s => s.name)
    console.log('Skills fetched:', skills.length, 'items')

    // Fetch user's education from education table
    const educationResult = await client.query(
      `SELECT title, description, grade, start_date, end_date
       FROM education 
       WHERE user_id = $1 
       ORDER BY start_date DESC NULLS LAST`,
      [userId]
    )
    const education = educationResult.rows.map(edu => ({
      institution: edu.title, // Using title field for now
      degree: edu.title,
      year: edu.end_date ? new Date(edu.end_date).getFullYear() : 'Present'
    }))
    console.log('Education fetched:', education.length, 'items')

    // Fetch user's contact info from users table
    const userResult = await client.query(
      `SELECT name, username, email, phone 
       FROM users 
       WHERE id = $1`,
      [userId]
    )
    const contactInfo = userResult.rows.length > 0 ? {
      name: userResult.rows[0].name || userResult.rows[0].username || 'User',
      email: userResult.rows[0].email || '',
      phone: userResult.rows[0].phone || ''
    } : {}
    console.log('Contact info fetched for user:', userId)

    console.log('Final data being returned:')
    console.log('- Experiences:', experiences.length)
    console.log('- Projects:', projects.length)
    console.log('- Skills:', skills.length)
    console.log('- Education:', education.length)

    return {
      ...resume,
      experiences,
      projects,
      skills,
      education,
      contactInfo
    }
  } catch (error) {
    console.error("Error fetching curated resume:", error.message)
    throw new Error("DB error while fetching curated resume.")
  } finally {
    client.release()
  }
}

// Update curated resume status
const updateCuratedResumeStatus = async (curatedResumeId, userId, status) => {
  try {
    const results = await query(
      `UPDATE curated_resumes
       SET status = $3,
           finalized_at = CASE WHEN $3 = 'finalized' THEN now() ELSE finalized_at END,
           updated_at = now()
       WHERE id = $1 AND user_id = $2
       RETURNING id, status, finalized_at`,
      [curatedResumeId, userId, status]
    )

    if (results.rows.length === 0) {
      throw new Error("Curated resume not found or unauthorized.")
    }

    return results.rows[0]
  } catch (error) {
    console.error("Error updating curated resume:", error.message)
    throw new Error("DB error while updating curated resume.")
  }
}

// Delete a curated resume
const deleteCuratedResume = async (curatedResumeId, userId) => {
  try {
    const results = await query(
      `DELETE FROM curated_resumes
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [curatedResumeId, userId]
    )

    if (results.rows.length === 0) {
      throw new Error("Curated resume not found or unauthorized.")
    }

    return results.rows[0]
  } catch (error) {
    console.error("Error deleting curated resume:", error.message)
    throw new Error("DB error while deleting curated resume.")
  }
}

export default {
  createCuratedResume,
  createCuratedResumeSimple,
  getUserCuratedResumes,
  getCuratedResumeById,
  updateCuratedResumeStatus,
  deleteCuratedResume
}
