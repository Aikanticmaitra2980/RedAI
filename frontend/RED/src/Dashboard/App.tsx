import { useState } from "react";

function App() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!input.trim()) return;
        setLoading(true);
        try {
            const res = await fetch("http://localhost:5000/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: input }),
            });
            const data = await res.json();
            if (res.ok) {
                setOutput(data.output);
            } else {
                setOutput("Error: " + (data.details || data.error));
            }
        } catch (e) {
            setOutput("Network error: " + (e instanceof Error ? e.message : String(e)));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main>
            <nav>
                <h1>RED AI</h1>
            </nav>
            <section className="chat-window">
                <div className="messages">
                    {output && (
                        <div className="message bot">
                            <div className="avatar">🤖</div>
                            <div className="bubble">
                                <pre>{output}</pre>
                            </div>
                        </div>
                    )}
                </div>
                <div className="input-area">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask RED AI..."
                    />
                    <button onClick={handleGenerate} disabled={loading}>
                        {loading ? "Generating..." : "Send"}
                    </button>
                </div>
            </section>
        </main>
    );
}

export default App;
