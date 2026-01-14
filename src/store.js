import { create } from 'zustand'
import websocketService from './websocket.js'
import { applyNodeChanges, applyEdgeChanges } from 'reactflow'

let wsListenersSetup = false

const useStore = create((set, get) => ({
  nodes: [
    {
      id: '1',
      type: 'mindmap',
      data: { label: '中心主题', color: '#667eea', size: { width: 200, height: 80 } },
      position: { x: 400, y: 300 }
    }
  ],
  edges: [],
  selectedNode: null,
  isCollaborating: false,
  roomId: null,
  users: [
    { id: '1', name: '我', color: '#667eea', isOnline: true, lastActive: Date.now() }
  ],
  collaborationEvents: [],
  currentUser: { id: '1', name: '我', color: '#667eea', isOnline: true },
  templates: [
    {
      id: 1,
      name: '项目规划',
      icon: '📋',
      nodes: [
        { id: 't1', type: 'mindmap', data: { label: '项目目标', color: '#667eea', size: { width: 200, height: 80 } }, position: { x: 400, y: 100 } },
        { id: 't2', type: 'mindmap', data: { label: '时间规划', color: '#764ba2', size: { width: 180, height: 70 } }, position: { x: 200, y: 250 } },
        { id: 't3', type: 'mindmap', data: { label: '资源分配', color: '#f093fb', size: { width: 180, height: 70 } }, position: { x: 600, y: 250 } },
        { id: 't4', type: 'mindmap', data: { label: '风险评估', color: '#4facfe', size: { width: 180, height: 70 } }, position: { x: 400, y: 400 } }
      ],
      edges: [
        { id: 'e1', source: 't1', target: 't2' },
        { id: 'e2', source: 't1', target: 't3' },
        { id: 'e3', source: 't1', target: 't4' }
      ]
    },
    {
      id: 2,
      name: '学习笔记',
      icon: '📚',
      nodes: [
        { id: 't5', type: 'mindmap', data: { label: '主题', color: '#667eea', size: { width: 200, height: 80 } }, position: { x: 400, y: 100 } },
        { id: 't6', type: 'mindmap', data: { label: '重点', color: '#764ba2', size: { width: 180, height: 70 } }, position: { x: 200, y: 250 } },
        { id: 't7', type: 'mindmap', data: { label: '难点', color: '#f093fb', size: { width: 180, height: 70 } }, position: { x: 400, y: 250 } },
        { id: 't8', type: 'mindmap', data: { label: '总结', color: '#4facfe', size: { width: 180, height: 70 } }, position: { x: 600, y: 250 } }
      ],
      edges: [
        { id: 'e4', source: 't5', target: 't6' },
        { id: 'e5', source: 't5', target: 't7' },
        { id: 'e6', source: 't5', target: 't8' }
      ]
    },
    {
      id: 3,
      name: '头脑风暴',
      icon: '💡',
      nodes: [
        { id: 't9', type: 'mindmap', data: { label: '核心问题', color: '#667eea', size: { width: 200, height: 80 } }, position: { x: 400, y: 100 } },
        { id: 't10', type: 'mindmap', data: { label: '方案A', color: '#764ba2', size: { width: 160, height: 60 } }, position: { x: 150, y: 250 } },
        { id: 't11', type: 'mindmap', data: { label: '方案B', color: '#f093fb', size: { width: 160, height: 60 } }, position: { x: 325, y: 250 } },
        { id: 't12', type: 'mindmap', data: { label: '方案C', color: '#4facfe', size: { width: 160, height: 60 } }, position: { x: 500, y: 250 } },
        { id: 't13', type: 'mindmap', data: { label: '方案D', color: '#43e97b', size: { width: 160, height: 60 } }, position: { x: 675, y: 250 } }
      ],
      edges: [
        { id: 'e7', source: 't9', target: 't10' },
        { id: 'e8', source: 't9', target: 't11' },
        { id: 'e9', source: 't9', target: 't12' },
        { id: 'e10', source: 't9', target: 't13' }
      ]
    },
    {
      id: 4,
      name: '组织架构',
      icon: '🏢',
      nodes: [
        { id: 't14', type: 'mindmap', data: { label: 'CEO', color: '#667eea', size: { width: 180, height: 70 } }, position: { x: 400, y: 100 } },
        { id: 't15', type: 'mindmap', data: { label: 'CTO', color: '#764ba2', size: { width: 180, height: 70 } }, position: { x: 200, y: 250 } },
        { id: 't16', type: 'mindmap', data: { label: 'COO', color: '#f093fb', size: { width: 180, height: 70 } }, position: { x: 600, y: 250 } },
        { id: 't17', type: 'mindmap', data: { label: '技术部', color: '#4facfe', size: { width: 160, height: 60 } }, position: { x: 100, y: 400 } },
        { id: 't18', type: 'mindmap', data: { label: '运营部', color: '#43e97b', size: { width: 160, height: 60 } }, position: { x: 300, y: 400 } }
      ],
      edges: [
        { id: 'e11', source: 't14', target: 't15' },
        { id: 'e12', source: 't14', target: 't16' },
        { id: 'e13', source: 't15', target: 't17' },
        { id: 'e14', source: 't15', target: 't18' }
      ]
    },
    {
      id: 5,
      name: '产品规划',
      icon: '🚀',
      nodes: [
        { id: 't19', type: 'mindmap', data: { label: '产品目标', color: '#667eea', size: { width: 200, height: 80 } }, position: { x: 400, y: 100 } },
        { id: 't20', type: 'mindmap', data: { label: '用户需求', color: '#764ba2', size: { width: 180, height: 70 } }, position: { x: 200, y: 250 } },
        { id: 't21', type: 'mindmap', data: { label: '功能设计', color: '#f093fb', size: { width: 180, height: 70 } }, position: { x: 400, y: 250 } },
        { id: 't22', type: 'mindmap', data: { label: '技术实现', color: '#4facfe', size: { width: 180, height: 70 } }, position: { x: 600, y: 250 } }
      ],
      edges: [
        { id: 'e15', source: 't19', target: 't20' },
        { id: 'e16', source: 't19', target: 't21' },
        { id: 'e17', source: 't19', target: 't22' }
      ]
    },
    {
      id: 6,
      name: '会议记录',
      icon: '📝',
      nodes: [
        { id: 't23', type: 'mindmap', data: { label: '会议主题', color: '#667eea', size: { width: 200, height: 80 } }, position: { x: 400, y: 100 } },
        { id: 't24', type: 'mindmap', data: { label: '讨论要点', color: '#764ba2', size: { width: 180, height: 70 } }, position: { x: 200, y: 250 } },
        { id: 't25', type: 'mindmap', data: { label: '决策事项', color: '#f093fb', size: { width: 180, height: 70 } }, position: { x: 400, y: 250 } },
        { id: 't26', type: 'mindmap', data: { label: '行动计划', color: '#4facfe', size: { width: 180, height: 70 } }, position: { x: 600, y: 250 } }
      ],
      edges: [
        { id: 'e18', source: 't23', target: 't24' },
        { id: 'e19', source: 't23', target: 't25' },
        { id: 'e20', source: 't23', target: 't26' }
      ]
    }
  ],
  history: [],
  historyIndex: -1,

  addNode: (node) => set((state) => ({
    nodes: [...state.nodes, node],
    history: [...state.history.slice(0, state.historyIndex + 1), { nodes: [...state.nodes, node], edges: state.edges }],
    historyIndex: state.historyIndex + 1
  })),

  updateNode: (id, data) => set((state) => ({
    nodes: state.nodes.map((node) => node.id === id ? { ...node, data: { ...node.data, ...data } } : node),
    history: [...state.history.slice(0, state.historyIndex + 1), { 
      nodes: state.nodes.map((node) => node.id === id ? { ...node, data: { ...node.data, ...data } } : node), 
      edges: state.edges 
    }],
    historyIndex: state.historyIndex + 1
  })),

  deleteNode: (id) => set((state) => ({
    nodes: state.nodes.filter((node) => node.id !== id),
    edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
    history: [...state.history.slice(0, state.historyIndex + 1), { 
      nodes: state.nodes.filter((node) => node.id !== id), 
      edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id) 
    }],
    historyIndex: state.historyIndex + 1
  })),

  addEdge: (edge) => set((state) => ({
    edges: [...state.edges, edge],
    history: [...state.history.slice(0, state.historyIndex + 1), { nodes: state.nodes, edges: [...state.edges, edge] }],
    historyIndex: state.historyIndex + 1
  })),

  onNodesChange: (changes) => set((state) => ({
    nodes: applyNodeChanges(changes, state.nodes)
  })),

  onEdgesChange: (changes) => set((state) => ({
    edges: applyEdgeChanges(changes, state.edges)
  })),

  setSelectedNode: (node) => set({ selectedNode: node }),

  selectNode: (nodeId) => set((state) => {
    const node = state.nodes.find(n => n.id === nodeId)
    return { selectedNode: node }
  }),

  toggleCollaboration: () => set((state) => {
    const newState = !state.isCollaborating
    if (newState) {
      return { showJoinDialog: true }
    } else {
      websocketService.send('leave', { roomId: state.roomId, user: state.currentUser })
      websocketService.disconnect()
      return {
        isCollaborating: false,
        users: [{ id: '1', name: '我', color: '#667eea', isOnline: true, lastActive: Date.now() }],
        collaborationEvents: [],
        roomId: null,
        currentUser: null
      }
    }
  }),

  joinRoom: (userName, existingRoomId = null) => set((state) => {
    const roomId = existingRoomId || 'room-' + Date.now()
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a']
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    
    const user = { 
      id: Date.now().toString(), 
      name: userName, 
      color: randomColor, 
      isOnline: true, 
      lastActive: Date.now() 
    }
    
    if (!wsListenersSetup) {
      websocketService.on('joined', (data) => {
        set({ 
          users: data.users, 
          roomId: data.roomId, 
          isCollaborating: true, 
          showJoinDialog: false,
          nodes: data.nodes || [],
          edges: data.edges || []
        })
      })
      
      websocketService.on('joinError', (data) => {
        alert(data.error)
        set({ showJoinDialog: true })
      })
      
      websocketService.on('userJoined', (data) => {
        set((state) => ({
          users: [...state.users, data.user],
          collaborationEvents: [...state.collaborationEvents, { type: 'join', user: data.user.name, timestamp: Date.now() }]
        }))
      })
      
      websocketService.on('userLeft', (data) => {
        set((state) => ({
          users: state.users.filter(u => u.id !== data.user.id),
          collaborationEvents: [...state.collaborationEvents, { type: 'leave', user: data.user.name, timestamp: Date.now() }]
        }))
      })
      
      websocketService.on('addNode', (data) => {
        const state = get()
        set({ nodes: [...state.nodes, data.node] })
      })
      
      websocketService.on('deleteNode', (data) => {
        const state = get()
        set({
          nodes: state.nodes.filter(n => n.id !== data.nodeId),
          edges: state.edges.filter(e => e.source !== data.nodeId && e.target !== data.nodeId)
        })
      })
      
      websocketService.on('updateNode', (data) => {
        const state = get()
        set({
          nodes: state.nodes.map(n => n.id === data.nodeId ? { ...n, data: { ...n.data, ...data.nodeData } } : n)
        })
      })
      
      websocketService.on('addEdge', (data) => {
        const state = get()
        set({ edges: [...state.edges, data.edge] })
      })
      
      websocketService.on('deleteEdge', (data) => {
        const state = get()
        set({ edges: state.edges.filter(e => e.id !== data.edgeId) })
      })
      
      wsListenersSetup = true
    }
    
    websocketService.connect('ws://localhost:8080').then(() => {
      websocketService.setRoomId(roomId)
      websocketService.send('join', { roomId, user })
    })
    
    return {
      isCollaborating: true,
      currentUser: user,
      roomId,
      showJoinDialog: false
    }
  }),

  addUser: (user) => set((state) => ({
    users: [...state.users, { ...user, id: Date.now().toString(), isOnline: true, lastActive: Date.now() }],
    collaborationEvents: [...state.collaborationEvents, { type: 'join', user: user.name, timestamp: Date.now() }]
  })),

  removeUser: (userId) => set((state) => ({
    users: state.users.filter(u => u.id !== userId),
    collaborationEvents: [...state.collaborationEvents, { type: 'leave', user: state.users.find(u => u.id === userId)?.name, timestamp: Date.now() }]
  })),

  updateUserActivity: (userId) => set((state) => ({
    users: state.users.map(u => u.id === userId ? { ...u, lastActive: Date.now() } : u)
  })),

  broadcastChange: (type, data) => set((state) => {
    const randomUser = state.users.filter(u => u.id !== '1')[Math.floor(Math.random() * (state.users.length - 1))]
    if (randomUser) {
      return {
        collaborationEvents: [
          ...state.collaborationEvents,
          { type, user: randomUser.name, data, timestamp: Date.now() }
        ],
        users: state.users.map(u => u.id === randomUser.id ? { ...u, lastActive: Date.now() } : u)
      }
    }
    return state
  }),

  clearCollaborationEvents: () => set({ collaborationEvents: [] }),

  loadTemplate: (templateId) => set((state) => {
    const template = state.templates.find(t => t.id === templateId)
    return {
      nodes: template.nodes,
      edges: template.edges,
      history: [...state.history, { nodes: template.nodes, edges: template.edges }],
      historyIndex: state.historyIndex + 1
    }
  }),

  loadMindmap: (data) => set({
    nodes: data.nodes,
    edges: data.edges,
    history: [...[{ nodes: data.nodes, edges: data.edges }]],
    historyIndex: 0
  }),

  undo: () => set((state) => {
    if (state.historyIndex > 0) {
      const prevState = state.history[state.historyIndex - 1];
      return {
        nodes: prevState.nodes,
        edges: prevState.edges,
        historyIndex: state.historyIndex - 1
      };
    }
    return state;
  }),

  redo: () => set((state) => {
    if (state.historyIndex < state.history.length - 1) {
      const nextState = state.history[state.historyIndex + 1];
      return {
        nodes: nextState.nodes,
        edges: nextState.edges,
        historyIndex: state.historyIndex + 1
      };
    }
    return state;
  }),

  clearMindmap: () => set({
    nodes: [
      {
        id: '1',
        type: 'mindmap',
        data: { label: '中心主题', color: '#667eea', size: { width: 200, height: 80 } },
        position: { x: 400, y: 300 }
      }
    ],
    edges: [],
    selectedNode: null,
    history: [],
    historyIndex: -1
  }),

  updateProfile: (name) => set((state) => {
    const updatedUser = { ...state.currentUser, name }
    const updatedUsers = state.users.map(u => u.id === state.currentUser.id ? updatedUser : u)
    return {
      currentUser: updatedUser,
      users: updatedUsers
    }
  })
}))

export default useStore