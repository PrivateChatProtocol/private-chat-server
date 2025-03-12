export function renderIndexPage(version: string, port: string | number): string {
  return `
    <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Private Chat Protocol</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 900px;
                        margin: 0 auto;
                        padding: 2rem;
                        background-color: #f9f9f9;
                    }
                    header {
                        text-align: center;
                        margin-bottom: 2rem;
                        padding-bottom: 1rem;
                        border-bottom: 1px solid #eaeaea;
                    }
                    h1 {
                        color: #2c3e50;
                        font-size: 2.5rem;
                    }
                    h2 {
                        color: #3498db;
                        margin: 0;
                    }
                    h3 {
                        color: #2980b9;
                    }
                    .subtitle {
                        color: #7f8c8d;
                        font-size: 1.2rem;
                    }
                    .version {
                        display: inline-block;
                        background-color: #3498db;
                        color: white;
                        border-radius: 20px;
                        padding: 0.25rem 1rem;
                        font-size: 0.9rem;
                        margin-top: 1rem;
                    }
                    section {
                        margin: 2rem 0;
                        padding: 2rem;
                        background-color: white;
                        border-radius: 5px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                    }
                    .message-types {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 1rem;
                    }
                    .message-type {
                        padding: 1rem;
                        border-radius: 5px;
                        background-color: #f8f9fa;
                        border-left: 3px solid #3498db;
                    }
                    code {
                        display: block;
                        padding: 1rem;
                        background-color: #f4f6f8;
                        border-radius: 5px;
                        overflow-x: auto;
                        font-family: monospace;
                    }
                    footer {
                        text-align: center;
                        margin-top: 2rem;
                        padding-top: 1rem;
                        border-top: 1px solid #eaeaea;
                        color: #7f8c8d;
                        font-size: 0.9rem;
                    }
                </style>
            </head>
            <body>
                <header>
                    <h1>Private Chat Protocol</h1>
                    <p class="subtitle">Secure, Reliable, Real-time Communication</p>
                    <span class="version">v${version}</span>
                </header>
                
                <section>
                    <h2>About Private Chat Protocol</h2>
                    <p>
                        Private Chat Protocol is a WebSocket-based communication system designed for secure and efficient real-time messaging.
                        The protocol supports various message types, room-based communication, and user authentication mechanisms.
                    </p>
                </section>
                
                <section>
                    <h2>Key Features</h2>
                    <ul>
                        <li>Real-time bidirectional communication via WebSockets</li>
                        <li>Room-based messaging for organized conversations</li>
                        <li>Support for text, images, and system messages</li>
                        <li>Username validation to prevent duplicates</li>
                        <li>Robust error handling and reporting</li>
                    </ul>
                </section>
                
                <section>
                    <h2>Message Types</h2>
                    <div class="message-types">
                        <div class="message-type">
                            <h3>JOIN_ROOM</h3>
                            <p>Sent when a user wants to join a specific chat room</p>
                        </div>
                        <div class="message-type">
                            <h3>LEAVE_ROOM</h3>
                            <p>Sent when a user exits a chat room</p>
                        </div>
                        <div class="message-type">
                            <h3>CHAT_MESSAGE</h3>
                            <p>Standard text message shared in a room</p>
                        </div>
                        <div class="message-type">
                            <h3>IMAGE_MESSAGE</h3>
                            <p>Message containing image data (base64 encoded)</p>
                        </div>
                        <div class="message-type">
                            <h3>USER_LIST</h3>
                            <p>System message containing the list of users in a room</p>
                        </div>
                        <div class="message-type">
                            <h3>ERROR</h3>
                            <p>System-generated error messages</p>
                        </div>
                    </div>
                </section>
                
                <section>
                    <h2>Connection Example</h2>
                    <code>
                        // Connect to WebSocket server<br>
                        const ws = new WebSocket('ws://your-server/ws');<br><br>
                        
                        // Join a room<br>
                        ws.send(JSON.stringify({<br>
                            &nbsp;&nbsp;type: 'JOIN_ROOM',<br>
                            &nbsp;&nbsp;roomId: 'room-123',<br>
                            &nbsp;&nbsp;username: 'user123',<br>
                            &nbsp;&nbsp;timestamp: Date.now()<br>
                        }));<br><br>
                        
                        // Send a message<br>
                        ws.send(JSON.stringify({<br>
                            &nbsp;&nbsp;type: 'CHAT_MESSAGE',<br>
                            &nbsp;&nbsp;roomId: 'room-123',<br>
                            &nbsp;&nbsp;username: 'user123',<br>
                            &nbsp;&nbsp;content: 'Hello world!',<br>
                            &nbsp;&nbsp;timestamp: Date.now()<br>
                        }));
                    </code>
                </section>
                
                <footer>
                    <p>Private Chat Protocol is running on port ${port} • Server Version: v${version}</p>
                </footer>
            </body>
      </html>
  `;
}
