import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Pencil, RotateCw } from "lucide-react"

const ResumeItemCard = ({ item, onCopy, onSave, onRegenerate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedBullets, setEditedBullets] = useState(item.bullets)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.bullets.join('\n'))
      onCopy?.(item.bullets)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleSave = () => {
    onSave?.(item.id, editedBullets)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedBullets(item.bullets)
    setIsEditing(false)
  }

  const handleBulletChange = (index, value) => {
    const newBullets = [...editedBullets]
    newBullets[index] = value
    setEditedBullets(newBullets)
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-semibold">{item.title}</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          {editedBullets.map((bullet, idx) => (
            <Textarea
              key={idx}
              value={bullet}
              onChange={(e) => handleBulletChange(idx, e.target.value)}
              className="min-h-20 text-sm leading-relaxed"
            />
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {item.bullets.map((bullet, idx) => (
            <p key={idx} className="text-sm leading-relaxed text-muted-foreground">
              {bullet}
            </p>
          ))}
          <div className="pt-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onRegenerate?.(item.id)}
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Re-generate
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

export default ResumeItemCard

