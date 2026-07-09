export interface SseClient {
  projectId: number
  send: (data: any) => void
}

const sseClients = new Map<number, SseClient[]>()

export function addSseClient(projectId: number, client: SseClient) {
  if (!sseClients.has(projectId)) {
    sseClients.set(projectId, [])
  }
  sseClients.get(projectId)!.push(client)
  console.log(`[SSE] Client connected to project ${projectId}. Total: ${sseClients.get(projectId)!.length}`)
}

export function removeSseClient(projectId: number, client: SseClient) {
  const clients = sseClients.get(projectId)
  if (clients) {
    const idx = clients.indexOf(client)
    if (idx !== -1) {
      clients.splice(idx, 1)
    }
    console.log(`[SSE] Client disconnected from project ${projectId}. Remaining: ${clients.length}`)
    if (clients.length === 0) {
      sseClients.delete(projectId)
    }
  }
}

export function broadcastProjectUpdate(projectId: number, eventType: string) {
  const clients = sseClients.get(projectId)
  if (clients) {
    console.log(`[SSE] Broadcasting '${eventType}' to ${clients.length} clients on project ${projectId}`)
    clients.forEach((client) => {
      try {
        client.send({ type: eventType, timestamp: Date.now() })
      } catch (err) {
        console.error(`[SSE] Failed to send update to client on project ${projectId}`, err)
      }
    })
  }
}
