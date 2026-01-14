class WebSocketService {
  constructor() {
    this.ws = null
    this.listeners = new Map()
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 3000
    this.roomId = null
  }

  connect(url) {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url)
        
        this.ws.onopen = () => {
          console.log('WebSocket连接成功')
          this.reconnectAttempts = 0
          this.emit('connected')
          resolve()
        }
        
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            this.emit(data.type, data)
          } catch (error) {
            console.error('解析消息失败:', error)
          }
        }
        
        this.ws.onerror = (error) => {
          console.error('WebSocket错误:', error)
          this.emit('error', error)
        }
        
        this.ws.onclose = () => {
          console.log('WebSocket连接关闭')
          this.emit('disconnected')
          this.attemptReconnect()
        }
      } catch (error) {
        console.error('WebSocket连接失败:', error)
        reject(error)
      }
    })
  }

  send(type, data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = { type, ...data }
      if (this.roomId && !message.roomId) {
        message.roomId = this.roomId
      }
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket未连接，无法发送消息')
    }
  }

  setRoomId(roomId) {
    this.roomId = roomId
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data))
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`尝试重新连接 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      setTimeout(() => {
        this.connect(this.url)
      }, this.reconnectDelay)
    } else {
      console.error('达到最大重连次数')
      this.emit('maxReconnectAttemptsReached')
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN
  }
}

export default new WebSocketService()
