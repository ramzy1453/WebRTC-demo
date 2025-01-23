import { useCallback, useEffect, useRef, useState } from "react";

export default function VideoCapture() {
  const [input, setInput] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [messages, setMessages] = useState<string[]>([]);
  const addMsg = useCallback((msg: string) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  useEffect(() => {
    const socket = new WebSocket("ws://192.168.1.8:8080/");

    setSocket(socket);

    const pc = new RTCPeerConnection();
    setPeerConnection(pc);

    let dc: RTCDataChannel;

    pc.ondatachannel = (e) => {
      dc = e.channel;

      dc.onclose = () => {
        addMsg("datachannel closed");
      };

      dc.onopen = () => {
        addMsg("datachannel opened");
      };

      dc.onmessage = (e) => {
        addMsg("message received: " + e.data);
      };
    };

    pc.onicecandidate = (e) => {
      addMsg("icecandidate event");
      if (e.candidate) {
        socket.send(JSON.stringify({ ice: e.candidate }));
      }
    };

    pc.ontrack = (e) => {
      console.log("Flux reçu :", e.streams);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };

    socket.onmessage = async (e) => {
      const message = JSON.parse(e.data);

      if (message.offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(message.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        addMsg("sending answer");
        socket.send(JSON.stringify({ answer }));
      } else if (message.answer) {
        await pc.setRemoteDescription(
          new RTCSessionDescription(message.answer)
        );
        addMsg("sending offer");
      } else if (message.ice) {
        await pc.addIceCandidate(new RTCIceCandidate(message.ice));
        addMsg("ice added");
      }
    };

    socket.onopen = () => {
      addMsg("connected to server");
      setSocket(socket);
    };

    return () => {
      socket.close();
      pc.close();
    };
  }, [addMsg]);

  async function start() {
    if (!navigator || !navigator.mediaDevices.getUserMedia) {
      console.error("navigator.mediaDevices.getUserMedia n'est pas supporté");
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    stream.getTracks().forEach((track) => {
      peerConnection!.addTrack(track, stream);
    });

    const dc = peerConnection!.createDataChannel("myChannel");
    setDataChannel(dc);

    dc.onopen = () => {
      console.log("datachannel opened");
      addMsg("datachannel opened");
    };

    dc.onmessage = (e) => {
      addMsg("message received: " + e.data);
    };

    const offer = await peerConnection!.createOffer();
    await peerConnection!.setLocalDescription(offer);
    socket!.send(JSON.stringify({ offer }));
  }

  async function sendMessage(dc: RTCDataChannel, message: string) {
    if (dc && dc.readyState === "open") {
      dc.send(message);
    } else {
      console.error("Le canal de données n'est pas ouvert.");
    }
  }

  function chooseUsername() {
    const username = prompt("Please choose a username");
    if (username) {
      setUsername(username);
    }
  }

  return (
    <div className="space-y-4 max-w-5xl border mx-auto mx-4 my-8">
      {username && username !== "" && (
        <h1 className="text-2xl">Hello {username}</h1>
      )}
      <div className="flex space-x-4">
        <button
          className="bg-blue-600 text-white px-2 py-1 rounded-lg"
          onClick={start}
        >
          Start Connection
        </button>
        <button
          className="bg-red-600 text-white px-2 py-1 rounded-lg"
          onClick={chooseUsername}
        >
          Choose username
        </button>
      </div>
      <div className="space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border px-2 py-1 rounded outline-none"
        />
        <button
          className="bg-blue-600 text-white px-2 py-1 rounded"
          onClick={() => sendMessage(dataChannel!, input)}
        >
          Send
        </button>
      </div>
      <div className="flex space-x-4">
        <video ref={localVideoRef} autoPlay muted className="w-1/2 border" />
        <video ref={remoteVideoRef} autoPlay muted className="w-1/2 border" />
      </div>
      <ul>
        {messages.map((msg, i) => (
          <li key={i}>- {msg}</li>
        ))}
      </ul>
    </div>
  );
}
