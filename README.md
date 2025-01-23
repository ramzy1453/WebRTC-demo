# Real-Time Video Chat with WebRTC from Scratch

🚀 **real-time video chat application built from scratch using WebRTC, React, and WebSocket.**

This project demonstrates how to build a peer-to-peer video chat application using modern web technologies. It includes video streaming, audio communication, and text messaging via WebRTC's `RTCDataChannel`.

---

## Features

- **Real-Time Video & Audio Communication**: Stream video and audio between peers using WebRTC.
- **Text Messaging**: Send and receive messages in real-time using WebRTC's `RTCDataChannel`.
- **Peer-to-Peer Connection**: Direct communication between users without a central server for media streaming.
- **WebSocket Signaling**: Uses WebSocket for signaling (offer/answer and ICE candidate exchange).

---

## Technologies Used

- **Frontend**: React, TypeScript
- **WebRTC**: Peer-to-peer video, audio, and data channels
- **Signaling**: WebSocket (Node.js server for signaling)

---

## How It Works

1. **Signaling**: The WebSocket server facilitates the exchange of SDP offers/answers and ICE candidates between peers.
2. **WebRTC Connection**: Once the signaling is complete, a direct peer-to-peer connection is established using WebRTC.
3. **Media Streaming**: Video and audio streams are transmitted directly between peers.
4. **Data Messaging**: Text messages are sent and received using WebRTC's `RTCDataChannel`.

---
