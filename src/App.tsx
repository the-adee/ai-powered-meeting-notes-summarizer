import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

interface SummaryResponse {
  summary: string;
  originalLength?: number;
  summaryLength?: number;
  warning?: string;
}

interface EmailRequest {
  to: string[];
  subject: string;
  summary: string;
  originalNotes?: string;
}

const API_BASE_URL = 'http://localhost:3001/api';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState('');
  const [customPrompt, setCustomPrompt] = useState('Summarize the following meeting notes in bullet points, highlighting key decisions and action items:');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  
  // Email sharing state
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState('');
  const [emailSubject, setEmailSubject] = useState('Meeting Summary');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setTextInput(''); // Clear text input when file is selected
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(e.target.value);
    if (e.target.value && file) {
      setFile(null); // Clear file when text is entered
    }
  };

  const generateSummary = async () => {
    if (!file && !textInput.trim()) {
      setError('Please provide either a text file or enter text directly');
      return;
    }

    setIsLoading(true);
    setError('');
    setWarning('');
    setSummary('');

    try {
      const formData = new FormData();
      
      if (file) {
        formData.append('file', file);
      } else {
        formData.append('text', textInput);
      }
      
      if (customPrompt.trim()) {
        formData.append('prompt', customPrompt);
      }

      const response = await axios.post<SummaryResponse>(`${API_BASE_URL}/summarize`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSummary(response.data.summary);
      if (response.data.warning) {
        setWarning(response.data.warning);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate summary');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummaryEdit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSummary(e.target.value);
  };

  const sendEmail = async () => {
    const recipients = emailRecipients.split(',').map(email => email.trim()).filter(email => email);
    
    if (recipients.length === 0) {
      setError('Please enter at least one email address');
      return;
    }

    if (!summary.trim()) {
      setError('No summary to send');
      return;
    }

    setIsSendingEmail(true);
    setError('');
    setEmailSuccess('');

    try {
      const emailData: EmailRequest = {
        to: recipients,
        subject: emailSubject || 'Meeting Summary',
        summary: summary,
        originalNotes: file ? undefined : textInput || undefined
      };

      const response = await axios.post(`${API_BASE_URL}/email`, emailData);
      
      if (response.data.success) {
        setEmailSuccess(`Email sent successfully to ${recipients.length} recipient(s)!`);
        setShowEmailForm(false);
        setEmailRecipients('');
      } else if (response.data.mockEmail) {
        setWarning('Email service not configured. This would send: ' + JSON.stringify(response.data.mockEmail, null, 2));
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>📝 AI-Powered Meeting Notes Summarizer</h1>
        <p>Upload your meeting transcript or paste text, and get an AI-generated summary</p>
      </header>

      <main className="main-content">
        {/* Input Section */}
        <section className="input-section">
          <h2>Input Your Meeting Notes</h2>
          
          <div className="input-method">
            <div className="file-upload">
              <label htmlFor="file-input">Upload Text File:</label>
              <input
                id="file-input"
                type="file"
                accept=".txt"
                onChange={handleFileChange}
                disabled={isLoading}
              />
              {file && <p className="file-info">Selected: {file.name}</p>}
            </div>
            
            <div className="text-divider">OR</div>
            
            <div className="text-input">
              <label htmlFor="text-area">Paste Text Directly:</label>
              <textarea
                id="text-area"
                value={textInput}
                onChange={handleTextChange}
                placeholder="Paste your meeting notes here..."
                rows={8}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Custom Prompt */}
          <div className="prompt-section">
            <label htmlFor="custom-prompt">Custom Instructions:</label>
            <textarea
              id="custom-prompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g., Summarize in bullet points for executives"
              rows={2}
              disabled={isLoading}
            />
          </div>

          <button 
            onClick={generateSummary}
            disabled={isLoading || (!file && !textInput.trim())}
            className="generate-button"
          >
            {isLoading ? 'Generating Summary...' : 'Generate Summary'}
          </button>
        </section>

        {/* Warning Messages */}
        {warning && (
          <div className="warning-message">
            <strong>⚠️ Note:</strong> {warning}
          </div>
        )}

        {/* Error Messages */}
        {error && (
          <div className="error-message">
            <strong>❌ Error:</strong> {error}
          </div>
        )}

        {/* Success Messages */}
        {emailSuccess && (
          <div className="success-message">
            <strong>✅ Success:</strong> {emailSuccess}
          </div>
        )}

        {/* Summary Section */}
        {summary && (
          <section className="summary-section">
            <h2>Generated Summary</h2>
            <div className="summary-actions">
              <button 
                onClick={() => setShowEmailForm(!showEmailForm)}
                className="share-button"
              >
                📧 Share via Email
              </button>
            </div>
            
            <textarea
              value={summary}
              onChange={handleSummaryEdit}
              className="summary-text"
              rows={15}
              placeholder="Your AI-generated summary will appear here..."
            />

            {/* Email Form */}
            {showEmailForm && (
              <div className="email-form">
                <h3>Share Summary via Email</h3>
                <div className="email-inputs">
                  <div className="input-group">
                    <label htmlFor="email-recipients">Recipients (comma-separated):</label>
                    <input
                      id="email-recipients"
                      type="text"
                      value={emailRecipients}
                      onChange={(e) => setEmailRecipients(e.target.value)}
                      placeholder="email1@example.com, email2@example.com"
                      disabled={isSendingEmail}
                    />
                  </div>
                  
                  <div className="input-group">
                    <label htmlFor="email-subject">Subject:</label>
                    <input
                      id="email-subject"
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Meeting Summary"
                      disabled={isSendingEmail}
                    />
                  </div>
                  
                  <div className="email-actions">
                    <button 
                      onClick={sendEmail}
                      disabled={isSendingEmail || !emailRecipients.trim()}
                      className="send-email-button"
                    >
                      {isSendingEmail ? 'Sending...' : 'Send Email'}
                    </button>
                    <button 
                      onClick={() => setShowEmailForm(false)}
                      className="cancel-button"
                      disabled={isSendingEmail}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>Built with React, TypeScript, and AI-powered summarization</p>
      </footer>
    </div>
  );
}

export default App;
