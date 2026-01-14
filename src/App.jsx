﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿import React, { useCallback, useState, useEffect } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  MarkerType,
  BackgroundVariant,
  applyNodeChanges,
  applyEdgeChanges
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Plus, Undo, Redo, Download, Share2, Users, Zap, Palette, Save, Trash2, Link, Copy, X, FileText, Layout, LogIn, User } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import useStore from './store'
import websocketService from './websocket.js'
import MindMapNode from './components/MindMapNode'
import './App.css'

const nodeTypes = {
  mindmap: MindMapNode
}

const colors = [
  '#667eea',
  '#764ba2',
  '#f093fb',
  '#4facfe',
  '#43e97b',
  '#fa709a',
  '#fee140',
  '#30cfd0',
  '#a8edea',
  '#fed6e3'
]

function App() {
  const nodes = useStore((state) => state.nodes)
  const edges = useStore((state) => state.edges)
  const updateNode = useStore((state) => state.updateNode)
  const deleteNode = useStore((state) => state.deleteNode)
  const addNodeToStore = useStore((state) => state.addNode)
  const addEdgeToStore = useStore((state) => state.addEdge)
  const onNodesChange = useStore((state) => state.onNodesChange)
  const onEdgesChange = useStore((state) => state.onEdgesChange)
  const [showSharePanel, setShowSharePanel] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const [showColors, setShowColors] = useState(false)
  const [selectedNodeId, setSelectedNodeId] = useState(null)
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [dialogMode, setDialogMode] = useState('create')
  const [userName, setUserName] = useState('')
  const [roomId, setRoomId] = useState('')
  const [displayRoomId, setDisplayRoomId] = useState('')
  const [profileName, setProfileName] = useState('')
  const isCollaborating = useStore((state) => state.isCollaborating)
  const currentUser = useStore((state) => state.currentUser)
  const users = useStore((state) => state.users)
  const templates = useStore((state) => state.templates)
  const collaborationEvents = useStore((state) => state.collaborationEvents)
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const data = urlParams.get('data')
    const room = urlParams.get('room')
    
    if (data) {
      try {
        const parsedData = JSON.parse(atob(data))
        useStore.getState().loadMindmap(parsedData)
      } catch (e) {
        console.error('Failed to load shared mindmap:', e)
      }
    }
    
    if (room) {
      setShowJoinDialog(true)
      setDialogMode('join')
      setRoomId(room)
      setDisplayRoomId(room)
    }
  }, [])

  useEffect(() => {
    const selectedNode = nodes.find(n => n.selected)
    if (selectedNode) {
      setSelectedNodeId(selectedNode.id)
      setShowColors(true)
    } else {
      setSelectedNodeId(null)
      setShowColors(false)
    }
  }, [nodes])

  const onConnect = useCallback((params) => {
    const newEdge = {
      ...params,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#667eea', strokeWidth: 2 },
      animated: true
    }
    addEdgeToStore(newEdge)
    
    if (isCollaborating && websocketService.isConnected()) {
      websocketService.send('addEdge', { edge: newEdge })
    }
  }, [addEdgeToStore, isCollaborating])

  const addNode = useCallback(() => {
    const newNode = {
      id: 'node_' + Date.now(),
      type: 'mindmap',
      position: {
        x: Math.random() * 600 + 100,
        y: Math.random() * 400 + 100
      },
      data: {
        label: '新节点',
        color: '#667eea',
        size: { width: 200, height: 80 }
      }
    }
    addNodeToStore(newNode)
    
    if (isCollaborating && websocketService.isConnected()) {
      websocketService.send('addNode', { node: newNode })
    }
  }, [addNodeToStore, isCollaborating])

  const handleNodeDelete = useCallback((nodeId) => {
    console.log('handleNodeDelete called with id:', nodeId)
    
    deleteNode(nodeId)
    
    if (isCollaborating && websocketService.isConnected()) {
      websocketService.send('deleteNode', { nodeId })
    }
  }, [deleteNode, isCollaborating])

  const handleDeleteSelected = useCallback(() => {
    const selectedNodes = nodes.filter(n => n.selected)
    
    if (selectedNodes.length > 0) {
      selectedNodes.forEach(node => {
        handleNodeDelete(node.id)
      })
    } else {
      alert('请先选择要删除的节点')
    }
  }, [nodes, handleNodeDelete])

  const handleExport = useCallback(async () => {
    const element = document.querySelector('.react-flow')
    if (!element) return

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#f8f9fa'
    })

    const format = prompt('请选择导出格式：\n1. PNG 图片\n2. PDF 文档\n\n请输入 1 或 2：', '1')

    if (format === '1') {
      const image = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = 'mindmap.png'
      link.href = image
      link.click()
    } else if (format === '2') {
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      })
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
      pdf.save('mindmap.pdf')
    }
  }, [])

  const handleShare = useCallback(() => {
    console.log('分享按钮被点击')
    try {
      const roomId = useStore.getState().roomId
      
      if (!roomId) {
        alert('请先开启协作，然后分享邀请链接')
        return
      }
      
      const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`
      console.log('协作邀请链接:', url)
      setShareUrl(url)
      setShowSharePanel(true)
    } catch (error) {
      console.error('分享失败:', error)
      alert('分享失败：' + error.message)
    }
  }, [])

  const handleCopyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      alert('链接已复制到剪贴板！')
    } catch (error) {
      console.error('复制失败:', error)
      alert('复制失败，请手动复制')
    }
  }, [shareUrl])

  const handleColorChange = useCallback((color) => {
    if (selectedNodeId) {
      useStore.getState().updateNode(selectedNodeId, { color })
      
      if (isCollaborating && websocketService.isConnected()) {
        websocketService.send('updateNode', { nodeId: selectedNodeId, nodeData: { color } })
      }
    }
  }, [selectedNodeId, isCollaborating])

  const handleTemplateSelect = useCallback((template) => {
    useStore.getState().loadTemplate(template.id)
    setShowTemplates(false)
  }, [])

  const onNodeClick = useCallback((event, node) => {
    event.stopPropagation()
    setSelectedNodeId(node.id)
    setShowColors(true)
  }, [])

  const onPaneClick = useCallback(() => {
    setShowTemplates(false)
    setShowColors(false)
    setShowSharePanel(false)
    setSelectedNodeId(null)
  }, [])

  return (
    <div className='app'>
      <div className='toolbar'>
        <div className='toolbar-left'>
          <h1 className='logo'>MindMap Pro</h1>
          <button className='btn btn-primary' onClick={addNode}>
            <Plus size={18} />
            添加节点
          </button>
          <button className='btn btn-secondary' onClick={() => setShowTemplates(!showTemplates)}>
            <Layout size={18} />
            模板
          </button>
          <button className='btn btn-secondary' onClick={() => useStore.getState().clearMindmap()} title='清空画布'>
            <FileText size={18} />
            清空
          </button>
        </div>

        <div className='toolbar-center'>
          <button className='btn btn-icon' onClick={handleDeleteSelected} title='删除选中节点'>
            <Trash2 size={18} />
          </button>
        </div>

        <div className='toolbar-right'>
          <button className='btn btn-secondary' onClick={() => {
            setProfileName(currentUser?.name || '')
            setShowProfileDialog(true)
          }}>
            <User size={18} />
            个人资料
          </button>
          {!isCollaborating && (
            <>
              <button className='btn btn-secondary' onClick={() => {
                setDialogMode('create')
                setDisplayRoomId('')
                setShowJoinDialog(true)
              }}>
                <Plus size={18} />
                创建房间
              </button>
              <button className='btn btn-secondary' onClick={() => {
                setDialogMode('join')
                setRoomId('')
                setDisplayRoomId('')
                setShowJoinDialog(true)
              }}>
                <LogIn size={18} />
                加入房间
              </button>
            </>
          )}
          <button className='btn btn-primary' onClick={handleExport}>
            <Download size={18} />
            导出
          </button>
          <button className='btn btn-primary' onClick={handleShare}>
            <Share2 size={18} />
            分享
          </button>
        </div>
      </div>

      {showTemplates && (
        <div className='templates-panel'>
          <div className='templates-header'>
            <h3>选择模板</h3>
            <button className='close-btn' onClick={() => setShowTemplates(false)}>
              <X size={18} />
            </button>
          </div>
          <div className='templates-grid'>
            {templates.map((template) => (
              <div 
                key={template.id} 
                className='template-card'
                onClick={() => handleTemplateSelect(template)}
              >
                <div className='template-icon'>{template.icon}</div>
                <div className='template-name'>{template.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showColors && selectedNodeId && (
        <div className='colors-panel'>
          <div className='colors-header'>
            <h3>节点颜色</h3>
            <button className='close-btn' onClick={() => setShowColors(false)}>
              <X size={18} />
            </button>
          </div>
          <div className='colors-grid'>
            {colors.map((color) => (
              <div 
                key={color}
                className='color-item'
                style={{ backgroundColor: color }}
                onClick={() => handleColorChange(color)}
              />
            ))}
          </div>
        </div>
      )}

      {showSharePanel && (
        <>
          <div className='share-panel-backdrop' onClick={() => setShowSharePanel(false)} />
          <div className='share-panel'>
            <div className='share-panel-content'>
              <div className='share-panel-header'>
                <h3>分享思维导图</h3>
                <button className='close-btn' onClick={() => setShowSharePanel(false)}>
                  <X size={18} />
                </button>
              </div>
              <div className='share-panel-body'>
                <p>复制下面的链接分享给其他人：</p>
                <div className='share-url-container'>
                  <input 
                    type='text' 
                    className='share-url-input' 
                    value={shareUrl} 
                    readOnly 
                  />
                  <button className='copy-btn' onClick={handleCopyUrl}>
                    <Copy size={18} />
                    复制
                  </button>
                </div>
                <div className='share-info'>
                  <p className='info-item'>
                    <Link size={16} />
                    <span>通过链接访问的人可以加入协作房间，实时共同编辑</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className='flow-container'>
        <ReactFlow
          nodes={nodes.map(node => ({ ...node, data: { ...node.data, onNodeDelete: handleNodeDelete } }))}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          snapToGrid
          snapGrid={[15, 15]}
          defaultEdgeOptions={{
            animated: true,
            style: { stroke: '#667eea', strokeWidth: 2 }
          }}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          selectNodesOnDrag={false}
          panOnScroll={false}
          zoomOnScroll={true}
          zoomOnPinch={true}
          panOnDrag={true}
          preventScrolling={true}
          deleteKeyCode={null}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color='#e8ecf1' />
          <Controls />
          <MiniMap 
            nodeColor={(node) => node.data.color}
            nodeStrokeWidth={3}
            zoomable
            pannable
          />
        </ReactFlow>
      </div>

      {isCollaborating && (
        <div className='collaboration-panel'>
          <div className='collaboration-header'>
            <h4>在线用户 ({users.length})</h4>
            <button 
              className='close-btn' 
              onClick={() => useStore.getState().toggleCollaboration()}
              title='关闭协作'
            >
              <X size={14} />
            </button>
          </div>
          <div className='users-list'>
            {users.map((user) => (
              <div key={user.id} className='user-item'>
                <div 
                  className='user-avatar' 
                  style={{ backgroundColor: user.color }}
                >
                  <User size={16} color='white' />
                </div>
                <div className='user-info'>
                  <span className='user-name'>{user.name}</span>
                  <span className='user-status'>
                    {user.isOnline && <span className='online-dot' />}
                    {currentUser && user.id === currentUser.id ? ' (你)' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {collaborationEvents.length > 0 && (
            <div className='collaboration-events'>
              <h5>协作动态</h5>
              <div className='events-list'>
                {collaborationEvents.slice(-5).reverse().map((event, index) => (
                  <div key={index} className='event-item'>
                    <span className='event-icon'>
                      {event.type === 'join' ? '👋' : event.type === 'leave' ? '👋' : event.type === 'addNode' ? '➕' : event.type === 'deleteNode' ? '🗑️' : '✏️'}
                    </span>
                    <span className='event-text'>
                      <strong>{event.user}</strong>
                      {event.type === 'join' ? ' 加入了协作' : 
                       event.type === 'leave' ? ' 离开了协作' :
                       event.type === 'addNode' ? ' 添加了节点' :
                       event.type === 'deleteNode' ? ' 删除了节点' : ' 进行了编辑'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showJoinDialog && (
        <>
          <div className='dialog-backdrop' onClick={() => setShowJoinDialog(false)} />
          <div className='join-dialog'>
            <div className='dialog-header'>
              <h3>{dialogMode === 'create' ? '创建协作房间' : '加入协作房间'}</h3>
              <button className='close-btn' onClick={() => setShowJoinDialog(false)}>
                <X size={18} />
              </button>
            </div>
            <div className='dialog-body'>
              <p>{dialogMode === 'create' ? '请输入您的姓名以创建协作房间：' : '请输入您的姓名以加入协作房间：'}</p>
              <input
                type='text'
                className='join-input'
                placeholder='请输入您的姓名'
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && userName.trim()) {
                    if (dialogMode === 'create') {
                      const newRoomId = Date.now().toString()
                      useStore.getState().joinRoom(userName.trim(), newRoomId)
                    } else {
                      useStore.getState().joinRoom(userName.trim(), roomId)
                    }
                  }
                }}
                autoFocus
              />
              <button
                className='btn btn-primary'
                onClick={() => {
                  if (userName.trim()) {
                    if (dialogMode === 'create') {
                      const newRoomId = Date.now().toString()
                      useStore.getState().joinRoom(userName.trim(), newRoomId)
                    } else {
                      useStore.getState().joinRoom(userName.trim(), roomId)
                    }
                  }
                }}
                disabled={!userName.trim()}
              >
                {dialogMode === 'create' ? '创建房间' : '加入房间'}
              </button>
            </div>
          </div>
        </>
      )}

      {showProfileDialog && (
        <>
          <div className='dialog-backdrop' onClick={() => setShowProfileDialog(false)} />
          <div className='join-dialog'>
            <div className='dialog-header'>
              <h3>个人资料</h3>
              <button className='close-btn' onClick={() => setShowProfileDialog(false)}>
                <X size={18} />
              </button>
            </div>
            <div className='dialog-body'>
              <p>请输入您的姓名：</p>
              <input
                type='text'
                className='join-input'
                placeholder='请输入您的姓名'
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                autoFocus
              />
              <button
                className='btn btn-primary'
                onClick={() => {
                  if (profileName.trim()) {
                    useStore.getState().updateProfile(profileName.trim())
                    setShowProfileDialog(false)
                  }
                }}
                disabled={!profileName.trim()}
              >
                保存
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default App
