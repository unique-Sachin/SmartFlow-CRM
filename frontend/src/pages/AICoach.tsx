import LightbulbIcon from "@mui/icons-material/Lightbulb";
import SendIcon from "@mui/icons-material/Send";
import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import ReactMarkdown from "react-markdown";

const exampleQuestions = [
  "How do I add a new lead?",
  "What is the best way to track deal progress?",
  "How can I improve my conversion rate?",
  "How do I assign leads to team members?",
  "What reports are available in this CRM?",
  "How many deals are in the pipeline?",
];

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AICoach: React.FC = () => {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<
    { question: string; answer: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { token } = useAuth();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  const handleAsk = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    const question = input.trim();
    setInput("");
    try {
      const res = await fetch(`${API_URL}/ai/coach`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "AI error");
      setHistory((h) => [...h, { question, answer: data.answer }]);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleExample = (q: string) => setInput(q);

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
        <Box display="flex" alignItems="center" mb={2} gap={1}>
          <LightbulbIcon color="warning" sx={{ fontSize: 32 }} />
          <Typography variant="h5" fontWeight={700}>
            AI Coach
          </Typography>
        </Box>
        <Typography color="text.secondary" mb={2}>
          Ask any question or get suggestions about using SmartFlow CRM. Try one
          of these:
        </Typography>
        <Box mb={2} display="flex" gap={1} flexWrap="wrap">
          {exampleQuestions.map((q) => (
            <Chip
              key={q}
              label={q}
              onClick={() => handleExample(q)}
              sx={{ cursor: "pointer", mb: 1 }}
            />
          ))}
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Box
          sx={{
            maxHeight: 350,
            overflowY: "auto",
            mb: 2,
            bgcolor: "#f9f9fb",
            borderRadius: 2,
            p: 2,
          }}
        >
          <List>
            {history.map((item, idx) => (
              <React.Fragment key={idx}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={
                      <Typography fontWeight={600}>
                        You: {item.question}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography fontWeight={600} mt={1}>
                          AI:
                        </Typography>
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => (
                              <Typography
                                variant="body2"
                                color="primary.main"
                                paragraph
                              >
                                {children}
                              </Typography>
                            ),
                            strong: ({ children }) => (
                              <Typography component="span" fontWeight={700}>
                                {children}
                              </Typography>
                            ),
                            h3: ({ children }) => (
                              <Typography
                                variant="subtitle1"
                                fontWeight="bold"
                                mt={2}
                              >
                                {children}
                              </Typography>
                            ),
                            li: ({ children }) => (
                              <li>
                                <Typography variant="body2" component="span">
                                  {children}
                                </Typography>
                              </li>
                            ),
                          }}
                        >
                          {item.answer}
                        </ReactMarkdown>
                      </>
                    }
                  />
                </ListItem>
                {idx < history.length - 1 && <Divider />}
              </React.Fragment>
            ))}
            {loading && (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography color="text.secondary">
                      AI is thinking...
                    </Typography>
                  }
                />
              </ListItem>
            )}
            <div ref={chatEndRef} />
          </List>
        </Box>
        {error && (
          <Typography color="error" mb={2}>
            {error}
          </Typography>
        )}
        <Box display="flex" gap={1}>
          <TextField
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Type your question..."
            multiline
            minRows={1}
            maxRows={4}
            fullWidth
            disabled={loading}
          />
          <IconButton
            color="primary"
            onClick={handleAsk}
            disabled={loading || !input.trim()}
            size="large"
          >
            {loading ? <CircularProgress size={24} /> : <SendIcon />}
          </IconButton>
        </Box>
      </Paper>
    </Container>
  );
};

import { Container } from "@mui/material";
export default AICoach;
