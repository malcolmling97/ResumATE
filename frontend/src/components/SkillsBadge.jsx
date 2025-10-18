const SkillsBadge = ({ skill, onEdit, onDelete }) => {
  const handleDelete = (e) => {
    e.stopPropagation() // Prevent edit action when clicking delete
    onDelete(skill.id)
  }

  // Tailwind-based helper: get a color ring class depending on level
  function getLevelColor(level) {
    switch (level) {
      case 'beginner':
        return 'bg-blue-300 text-white';
      case 'intermediate':
        return 'bg-green-400 text-white';
      case 'advanced':
        return 'bg-orange-300 text-white';
      case 'expert':
        return 'bg-red-400 text-white';
      default:
        return 'bg-gray-300 text-white';
    }
  }

  return (
    <div
      onClick={() => onEdit(skill)}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity ${getLevelColor(skill.level)}`}
      title="Click to edit"
    >
      <span>{skill.name}</span>
      {skill.level && (
        <span className="text-xs opacity-75 bg-white bg-opacity-10 px-2 py-0.5 rounded-full">
          {skill.level}
        </span>
      )}
      <button
        onClick={handleDelete}
        className="hover:opacity-70 hover:scale-110 transition-transform"
        title="Delete"
      >
        ✕
      </button>
    </div>
  )
}

export default SkillsBadge

