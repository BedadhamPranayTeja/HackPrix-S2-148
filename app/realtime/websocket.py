from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
import asyncio

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.admin_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, user_id: str, user_role: str):
        await websocket.accept()
        
        if user_role == "admin":
            self.admin_connections.append(websocket)
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        
        if websocket in self.admin_connections:
            self.admin_connections.remove(websocket)

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except:
                    pass

    async def broadcast_to_admins(self, message: dict):
        for connection in self.admin_connections:
            try:
                await connection.send_text(json.dumps(message))
            except:
                pass

    async def broadcast(self, message: dict):
        for user_connections in self.active_connections.values():
            for connection in user_connections:
                try:
                    await connection.send_text(json.dumps(message))
                except:
                    pass

manager = ConnectionManager()

@router.websocket("/connect/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str, user_role: str = "user"):
    await manager.connect(websocket, user_id, user_role)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            if message.get("type") == "emergency_alert":
                # Broadcast emergency to all admins
                await manager.broadcast_to_admins({
                    "type": "emergency_alert",
                    "data": message.get("data"),
                    "user_id": user_id
                })
            elif message.get("type") == "report_update":
                # Send update to specific user
                target_user = message.get("target_user")
                if target_user:
                    await manager.send_personal_message({
                        "type": "report_update",
                        "data": message.get("data")
                    }, target_user)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)

# Helper functions for other modules
async def notify_emergency_created(emergency_data: dict):
    """Notify all admins of new emergency"""
    await manager.broadcast_to_admins({
        "type": "emergency_created",
        "data": emergency_data
    })

async def notify_report_updated(report_data: dict, user_id: str):
    """Notify user of report update"""
    await manager.send_personal_message({
        "type": "report_updated",
        "data": report_data
    }, user_id)