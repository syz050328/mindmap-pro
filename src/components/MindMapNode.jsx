﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿import React, { memo, useState, useRef, useEffect } from 'react'
import { Handle, Position } from 'reactflow'
import { GripVertical, Maximize2 } from 'lucide-react'
import websocketService from '../websocket'
import './MindMapNode.css'

const MindMapNode = memo(({ data, selected, id, onNodeDelete }) => {
  const [isResizing, setIsResizing] = useState(false)
  const [nodeSize, setNodeSize] = useState(data.size || { width: 200, height: 80 })
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(data.label)
  const nodeRef = useRef(null)
  const inputRef = useRef(null)
  const startPos = useRef({ x: 0, y: 0 })
  const startSize = useRef({ width: 0, height: 0 })

  useEffect(() => {
    if (data.size && typeof data.size === 'object') {
      setNodeSize(data.size)
    }
    setEditValue(data.label)
  }, [data.size, data.label])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus()
        inputRef.current.select()
      }, 0)
    }
  }, [isEditing])

  const handleEditClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsEditing(true)
  }

  const handleEditChange = (e) => {
    setEditValue(e.target.value)
  }

  const handleEditBlur = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setIsEditing(false)
    
    if (websocketService.isConnected()) {
      websocketService.send('updateNode', { nodeId: id, nodeData: { label: editValue } })
    }
  }

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
      handleEditBlur()
    }
  }

  const handleResizeMouseDown = (e) => {
    e.preventDefault()
    e.stopPropagation()
    e.target.setPointerCapture(e.pointerId)
    setIsResizing(true)
    startPos.current = { x: e.clientX, y: e.clientY }
    startSize.current = { ...nodeSize }
  }

  const handleResizeMouseMove = (e) => {
    if (!isResizing) return
    
    const deltaX = e.clientX - startPos.current.x
    const deltaY = e.clientY - startPos.current.y
    
    const newWidth = Math.max(100, startSize.current.width + deltaX)
    const newHeight = Math.max(50, startSize.current.height + deltaY)
    
    const newSize = { width: newWidth, height: newHeight }
    setNodeSize(newSize)
  }

  const handleResizeMouseUp = (e) => {
    if (e) {
      e.target.releasePointerCapture(e.pointerId)
    }
    setIsResizing(false)
    
    if (websocketService.isConnected()) {
      websocketService.send('updateNode', { nodeId: id, nodeData: { size: nodeSize } })
    }
  }

  useEffect(() => {
    if (isResizing) {
      const handleMouseMove = (e) => handleResizeMouseMove(e)
      const handleMouseUp = (e) => handleResizeMouseUp(e)
      
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isResizing, nodeSize])

  return (
    <div 
      ref={nodeRef}
      className={'mindmap-node ' + (selected ? 'selected' : '')}
      style={{ 
        borderColor: data.color,
        backgroundColor: selected ? data.color + '15' : 'white',
        width: nodeSize.width,
        height: nodeSize.height,
        minHeight: nodeSize.height
      }}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="handle-target"
        style={{ top: '-8px', left: '50%', transform: 'translateX(-50%)' }}
      />
      
      <div className='node-content'>
        <div 
          className='node-header'
          style={{ backgroundColor: data.color }}
        >
          <GripVertical size={14} color='white' />
        </div>
        
        <div className='node-label-container'>
          {isEditing ? (
            <input
              ref={inputRef}
              className='node-input'
              type='text'
              value={editValue}
              onChange={handleEditChange}
              onBlur={handleEditBlur}
              onKeyDown={handleEditKeyDown}
            />
          ) : (
            <div 
              className='node-label'
              onClick={handleEditClick}
            >
              {editValue}
            </div>
          )}
        </div>

        {selected && (
          <div 
            className='resize-handle'
            onMouseDown={handleResizeMouseDown}
            onPointerDown={handleResizeMouseDown}
            onPointerMove={handleResizeMouseMove}
            onPointerUp={handleResizeMouseUp}
          >
            <Maximize2 size={12} color={data.color} />
          </div>
        )}
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="handle-source"
        style={{ bottom: '-8px', left: '50%', transform: 'translateX(-50%)' }}
      />
    </div>
  )
})

MindMapNode.displayName = 'MindMapNode'

export default MindMapNode
