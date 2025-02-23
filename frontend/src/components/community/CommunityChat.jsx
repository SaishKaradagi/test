import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Users } from "lucide-react";

const CommunityChat = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Socket initialization
    const newSocket = io("http://localhost:3000", {
      transports: ["websocket", "polling"],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    // Socket event handlers
    newSocket.on("connect", () => {
      console.log("Connected to server");
      setConnectionStatus("connected");
      // Use a mock email for testing - replace with actual user email later
      newSocket.emit("user_join", "test@example.com");
    });

    newSocket.on("connect_error", (error) => {
      console.log("Connection error:", error);
      setConnectionStatus("error");
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
      setConnectionStatus("disconnected");
    });

    newSocket.on("chat_message", (message) => {
      console.log("Received message:", message);
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on("user_list", (users) => {
      console.log("Online users:", users);
      setOnlineUsers(users);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim() && socket && connectionStatus === "connected") {
      console.log("Sending message:", messageInput);
      socket.emit("send_message", messageInput);
      setMessageInput("");
    }
  };

  // Debug connection status
  useEffect(() => {
    console.log("Connection status:", connectionStatus);
  }, [connectionStatus]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Online Users Sidebar */}
        <Card className="md:col-span-1 h-[calc(100vh-12rem)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Online Users ({onlineUsers.length})
              <Badge
                variant={
                  connectionStatus === "connected" ? "success" : "destructive"
                }
              >
                {connectionStatus}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-16rem)]">
              <div className="space-y-4">
                {onlineUsers.map((user, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{user[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{user}</span>
                    <Badge variant="secondary" className="ml-auto">
                      online
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="md:col-span-3 h-[calc(100vh-12rem)]">
          <CardHeader>
            <CardTitle>Community Chat</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col h-full">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        msg.type === "system"
                          ? "justify-center"
                          : "items-start gap-3"
                      }`}
                    >
                      {msg.type === "system" ? (
                        <span className="text-sm text-gray-500">
                          {msg.content}
                        </span>
                      ) : (
                        <>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {msg.username[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2">
                              <span className="font-medium">
                                {msg.username}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="mt-1 text-sm bg-gray-100 rounded-lg p-3">
                              {msg.content}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                    disabled={connectionStatus !== "connected"}
                  />
                  <Button
                    type="submit"
                    disabled={connectionStatus !== "connected"}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommunityChat;
