import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { formatDate } from '@/lib/utils'
import { X, Plus, Check } from 'lucide-react'

const ExperienceCard = ({ 
  item, 
  onEdit, 
  onDelete, 
  onUpdate, 
  onUpdateBulletPoint,
  onAddBulletPoint,
  onDeleteBulletPoint,
  mode = 'dialog' // 'inline' or 'dialog'
}) => {
  const [editingField, setEditingField] = useState(null)
  const [tempValue, setTempValue] = useState('')
  const [editingPointId, setEditingPointId] = useState(null)
  const [tempPointValue, setTempPointValue] = useState('')
  const [isAddingPoint, setIsAddingPoint] = useState(false)
  const [newPointContent, setNewPointContent] = useState('')

  const handleAddBulletPoint = () => {
    if (newPointContent.trim()) {
      onAddBulletPoint?.(newPointContent.trim())
      setNewPointContent('')
      setIsAddingPoint(false)
    }
  }

  const handleEditPointClick = (point) => {
    if (mode !== 'inline') return
    setEditingPointId(point.id)
    setTempPointValue(point.content)
  }

  const handlePointBlur = (pointId) => {
    if (mode !== 'inline') return
    if (tempPointValue.trim()) {
      onUpdateBulletPoint?.(pointId, tempPointValue.trim())
    }
    setEditingPointId(null)
    setTempPointValue('')
  }

  const handlePointKeyDown = (e, pointId) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handlePointBlur(pointId)
    } else if (e.key === 'Escape') {
      setEditingPointId(null)
      setTempPointValue('')
    }
  }

  const handleNewPointKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddBulletPoint()
    } else if (e.key === 'Escape') {
      setIsAddingPoint(false)
      setNewPointContent('')
    }
  }

  const handleFieldClick = (field, currentValue) => {
    if (mode !== 'inline') return
    setEditingField(field)
    setTempValue(currentValue || '')
  }

  const handleFieldBlur = (field) => {
    if (mode !== 'inline') return
    if (tempValue !== item[field]) {
      onUpdate?.(field, tempValue)
    }
    setEditingField(null)
  }

  const handleFieldKeyDown = (e, field) => {
    if (e.key === 'Enter') {
      handleFieldBlur(field)
    } else if (e.key === 'Escape') {
      setEditingField(null)
      setTempValue('')
    }
  }

  const isInlineMode = mode === 'inline'

  return (
    <Card className="p-6 bg-white gap-2 rounded-xl shadow border border-gray-100 backdrop-blur-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Title and Organization */}
          {isInlineMode && editingField === 'title' ? (
            <Input
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={() => handleFieldBlur('title')}
              onKeyDown={(e) => handleFieldKeyDown(e, 'title')}
              autoFocus
              className="text-lg font-semibold text-gray-900 mb-1"
            />
          ) : (
            <div className="flex items-center gap-2">
              <h3 
                className={`text-lg font-semibold text-gray-900 ${isInlineMode ? 'cursor-pointer hover:bg-gray-50 px-2 py-1 rounded' : ''}`}
                onClick={() => handleFieldClick('title', item.title)}
              >
                {item.title}
              </h3>
            </div>
          )}

          {/* Organization */}
          {item.organization && (
            <>
              {isInlineMode && editingField === 'organization' ? (
                <Input
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onBlur={() => handleFieldBlur('organization')}
                  onKeyDown={(e) => handleFieldKeyDown(e, 'organization')}
                  autoFocus
                  className="text-lg font-semibold text-gray-900 mb-1"
                />
              ) : (
                <p 
                  className={`text-sm text-gray-600 ${isInlineMode ? 'cursor-pointer hover:bg-gray-50 px-2 py-1 rounded' : ''}`}
                  onClick={() => handleFieldClick('organization', item.organization)}
                >
                  {item.organization}
                </p>
              )}
            </>
          )}

          {/* Dates */}
          {isInlineMode && (editingField === 'start_date' || editingField === 'end_date') ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">(</span>
              {editingField === 'start_date' ? (
                <Input
                  type="date"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onBlur={() => handleFieldBlur('start_date')}
                  onKeyDown={(e) => handleFieldKeyDown(e, 'start_date')}
                  autoFocus
                  className="text-sm w-auto"
                />
              ) : (
                <span 
                  className="text-sm text-gray-600 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
                  onClick={() => handleFieldClick('start_date', item.start_date)}
                >
                  {formatDate(item.start_date)}
                </span>
              )}
              <span className="text-sm text-gray-600">-</span>
              {editingField === 'end_date' ? (
                <Input
                  type="date"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onBlur={() => handleFieldBlur('end_date')}
                  onKeyDown={(e) => handleFieldKeyDown(e, 'end_date')}
                  autoFocus
                  className="text-sm w-auto"
                />
              ) : (
                <span 
                  className="text-sm text-gray-600 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
                  onClick={() => handleFieldClick('end_date', item.end_date)}
                >
                  {item.is_current ? 'Present' : formatDate(item.end_date)}
                </span>
              )}
              <span className="text-sm text-gray-600">)</span>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              <span 
                className={isInlineMode ? 'cursor-pointer hover:bg-gray-50 px-2 py-1 rounded' : ''}
                onClick={() => handleFieldClick('start_date', item.start_date)}
              >
                ({formatDate(item.start_date)}
              </span>
              {' - '}
              <span 
                className={isInlineMode ? 'cursor-pointer hover:bg-gray-50 px-2 py-1 rounded' : ''}
                onClick={() => handleFieldClick('end_date', item.end_date)}
              >
                {item.is_current ? 'Present' : formatDate(item.end_date)})
              </span>
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!isInlineMode && onEdit && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(item)}
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onDelete}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Bullet Points */}
      <ul className="space-y-2 ml-4">
        {(item.points && item.points.length > 0) ? (
          item.points.map((point) => (
            (mode === "inline") ? (
              <li key={point.id} className="text-sm text-gray-700 list-disc">
                {editingPointId === point.id ? (
                  <div className="flex items-start gap-2">
                    <Textarea
                      value={tempPointValue}
                      onChange={(e) => setTempPointValue(e.target.value)}
                      onBlur={() => handlePointBlur(point.id)}
                      onKeyDown={(e) => handlePointKeyDown(e, point.id)}
                      autoFocus
                      className="flex-1 min-h-[60px] text-sm"
                      placeholder="Enter bullet point content (Enter to save, Shift+Enter for new line)..."
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-red-600 hover:text-red-700"
                      onClick={() => onDeleteBulletPoint?.(point.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between group">
                    <span
                      className="flex-1 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
                      onClick={() => handleEditPointClick(point)}
                    >
                      {point.content}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700"
                      onClick={() => onDeleteBulletPoint?.(point.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </li>
            ) : (
              <li key={point.id} className="text-sm text-gray-700 list-disc">
                {point.content}
              </li>
            )
          ))
        ) : (
          <li className="text-sm text-gray-400 italic">No bullet points added</li>
        )}
        {/* Add bullet point input/button */}
        {mode === 'inline' && (
          <>
            {isAddingPoint ? (
              <div className="space-y-2 mt-2">
                <Textarea
                  value={newPointContent}
                  onChange={(e) => setNewPointContent(e.target.value)}
                  onKeyDown={handleNewPointKeyDown}
                  autoFocus
                  className="w-full min-h-[60px] text-sm"
                  placeholder="Enter new bullet point (Enter to save, Shift+Enter for new line)..."
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleAddBulletPoint}
                    disabled={!newPointContent.trim()}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsAddingPoint(false)
                      setNewPointContent('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                className="flex w-full border-1 border-dashed bg-transparent" 
                variant="secondary" 
                size="sm" 
                onClick={() => setIsAddingPoint(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Bullet Point
              </Button>
            )}
          </>
        )}
      </ul>
    </Card>
  )
}

export default ExperienceCard

