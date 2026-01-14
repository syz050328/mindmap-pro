export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const path = url.pathname

    if (path === '/api/mindmaps') {
      return handleMindmapsAPI(request, env)
    } else if (path === '/api/collaboration') {
      return handleCollaborationAPI(request, env)
    } else if (path === '/api/templates') {
      return handleTemplatesAPI(request, env)
    } else if (path === '/api/export') {
      return handleExportAPI(request, env)
    }

    return new Response('Not Found', { status: 404 })
  }
}

async function handleMindmapsAPI(request, env) {
  const { method } = request

  if (method === 'GET') {
    const mindmaps = await env.MINDMAPS.list()
    const mindmapData = await Promise.all(
      mindmaps.keys.map(async (key) => {
        const value = await env.MINDMAPS.get(key.name)
        return JSON.parse(value)
      })
    )
    return new Response(JSON.stringify(mindmapData), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  if (method === 'POST') {
    const data = await request.json()
    const id = `mindmap-${Date.now()}`
    await env.MINDMAPS.put(id, JSON.stringify({ ...data, id }))
    return new Response(JSON.stringify({ id }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  if (method === 'PUT') {
    const data = await request.json()
    const { id } = data
    await env.MINDMAPS.put(id, JSON.stringify(data))
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  if (method === 'DELETE') {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    await env.MINDMAPS.delete(id)
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response('Method Not Allowed', { status: 405 })
}

async function handleCollaborationAPI(request, env) {
  const { method } = request

  if (method === 'GET') {
    const roomId = new URL(request.url).searchParams.get('room')
    const roomData = await env.ROOMS.get(roomId)
    return new Response(roomData || '{}', {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  if (method === 'POST') {
    const data = await request.json()
    const { roomId, nodes, edges, users } = data
    await env.ROOMS.put(roomId, JSON.stringify({ nodes, edges, users }))
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response('Method Not Allowed', { status: 405 })
}

async function handleTemplatesAPI(request, env) {
  const { method } = request

  if (method === 'GET') {
    const templates = await env.TEMPLATES.list()
    const templateData = await Promise.all(
      templates.keys.map(async (key) => {
        const value = await env.TEMPLATES.get(key.name)
        return JSON.parse(value)
      })
    )
    return new Response(JSON.stringify(templateData), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  if (method === 'POST') {
    const data = await request.json()
    const id = `template-${Date.now()}`
    await env.TEMPLATES.put(id, JSON.stringify({ ...data, id }))
    return new Response(JSON.stringify({ id }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response('Method Not Allowed', { status: 405 })
}

async function handleExportAPI(request, env) {
  const { method } = request

  if (method === 'POST') {
    const data = await request.json()
    const { nodes, edges, format } = data
    
    if (format === 'json') {
      return new Response(JSON.stringify({ nodes, edges }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    if (format === 'png') {
      return new Response(JSON.stringify({ success: true, message: 'PNG export handled on client side' }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }

  return new Response('Method Not Allowed', { status: 405 })
}
