import React, { useState, useEffect } from 'react';
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

// Function to convert simple Markdown to HTML for display
const convertMarkdownToHtml = (text: string): string => {
  return text
    // Convert **bold** to <strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Convert *italic* to <em>
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Convert line breaks to <br>
    .replace(/\n/g, '<br>')
    // Convert bullet points
    .replace(/^\* (.*?)$/gm, '• $1');
};

// Email validation utility
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

const validateEmails = (emailString: string): { valid: string[], invalid: string[] } => {
  const emails = emailString.split(',').map(email => email.trim()).filter(email => email);
  const valid: string[] = [];
  const invalid: string[] = [];
  
  emails.forEach(email => {
    if (validateEmail(email)) {
      valid.push(email);
    } else {
      invalid.push(email);
    }
  });
  
  return { valid, invalid };
};

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState('');
  const [customPrompt, setCustomPrompt] = useState('Summarize the following meeting notes in bullet points, highlighting key decisions and action items:');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [isEditingMode, setIsEditingMode] = useState(false);
  
  // Email sharing state
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState('');
  const [emailSubject, setEmailSubject] = useState('Meeting Summary');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailError, setEmailError] = useState('');

  // Close modal with Escape key and prevent body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showEmailForm && !isSendingEmail) {
        setShowEmailForm(false);
        setEmailSuccess('');
        setEmailError('');
      }
    };

    if (showEmailForm) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscape);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [showEmailForm, isSendingEmail]);

  // Helper function to close modal and reset states
  const closeEmailModal = () => {
    if (!isSendingEmail) {
      setShowEmailForm(false);
      setEmailSuccess('');
      setEmailError('');
    }
  };

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
    // Clear previous states
    setError('');
    setEmailSuccess('');
    setEmailError('');
    
    // Validate email addresses
    const { valid: validEmails, invalid: invalidEmails } = validateEmails(emailRecipients);
    
    if (validEmails.length === 0) {
      setEmailError('Please enter at least one valid email address');
      return;
    }
    
    if (invalidEmails.length > 0) {
      setEmailError(`Invalid email addresses: ${invalidEmails.join(', ')}`);
      return;
    }

    if (!summary.trim()) {
      setEmailError('No summary to send');
      return;
    }

    if (!emailSubject.trim()) {
      setEmailError('Please enter an email subject');
      return;
    }

    setIsSendingEmail(true);

    try {
      const emailData: EmailRequest = {
        to: validEmails,
        subject: emailSubject.trim(),
        summary: summary,
        originalNotes: file ? undefined : textInput || undefined
      };

      const response = await axios.post(`${API_BASE_URL}/email`, emailData);
      
      if (response.data.success) {
        setEmailSuccess(`✅ Email sent successfully to ${validEmails.length} recipient(s)!`);
        // Auto-close modal after 3 seconds
        setTimeout(() => {
          setShowEmailForm(false);
          setEmailRecipients('');
          setEmailSuccess('');
          setEmailError('');
        }, 3000);
      } else if (response.data.mockEmail) {
        setEmailError('⚠️ Email service not configured. Check your backend environment settings.');
      } else {
        setEmailError('❌ Failed to send email. Please try again.');
      }
    } catch (err: unknown) {
      console.error('Email sending error:', err);
      
      let errorMessage = 'Failed to send email. ';
      
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 500) {
          errorMessage += 'Server error. Please check your email configuration.';
        } else if (err.response?.status === 400) {
          errorMessage += err.response.data?.error || 'Invalid request data.';
        } else if (err.code === 'NETWORK_ERROR' || !err.response) {
          errorMessage += 'Network error. Please check your connection.';
        } else {
          errorMessage += `Server responded with status ${err.response?.status}.`;
        }
      } else {
        errorMessage += 'An unexpected error occurred.';
      }
      
      setEmailError(`❌ ${errorMessage}`);
      
      // Auto-close on error after 5 seconds
      setTimeout(() => {
        setShowEmailForm(false);
        setEmailError('');
      }, 5000);
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

        {/* Summary Section */}
        {summary && (
          <section className="summary-section">
            <h2>Generated Summary</h2>
            <div className="summary-actions">
              <button 
                onClick={() => setIsEditingMode(!isEditingMode)}
                className="edit-button"
              >
                {isEditingMode ? '👁️ Preview' : '✏️ Edit'}
              </button>
              <button 
                onClick={() => setShowEmailForm(!showEmailForm)}
                className="share-button"
              >
                📧 Share via Email
              </button>
            </div>
            
            {isEditingMode ? (
              <textarea
                value={summary}
                onChange={handleSummaryEdit}
                className="summary-text"
                rows={15}
                placeholder="Your AI-generated summary will appear here..."
              />
            ) : (
              <div 
                className="summary-display"
                dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(summary) }}
              />
            )}
          </section>
        )}

        {/* Email Modal Dialog */}
        {showEmailForm && (
          <div 
            className="modal-overlay" 
            onClick={(e) => {
              if (e.target === e.currentTarget && !isSendingEmail) {
                closeEmailModal();
              }
            }}
          >
            <div className="modal-dialog">
              <div className="modal-header">
                <h3>📧 Share Summary via Email</h3>
                <button 
                  className="modal-close"
                  onClick={closeEmailModal}
                  disabled={isSendingEmail}
                  aria-label="Close dialog"
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                {/* Success/Error Messages in Modal */}
                {emailSuccess && (
                  <div className="modal-success-message">
                    {emailSuccess}
                  </div>
                )}
                
                {emailError && (
                  <div className="modal-error-message">
                    {emailError}
                  </div>
                )}
                
                <div className="input-group">
                  <label htmlFor="email-recipients">Recipients (comma-separated)</label>
                  <input
                    id="email-recipients"
                    type="text"
                    value={emailRecipients}
                    onChange={(e) => setEmailRecipients(e.target.value)}
                    placeholder="email1@example.com, email2@example.com"
                    disabled={isSendingEmail}
                    className="modal-input"
                    autoComplete="email"
                  />
                </div>
                
                <div className="input-group">
                  <label htmlFor="email-subject">Subject</label>
                  <input
                    id="email-subject"
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Meeting Summary"
                    disabled={isSendingEmail}
                    className="modal-input"
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  onClick={closeEmailModal}
                  className="modal-cancel-button"
                  disabled={isSendingEmail}
                >
                  Cancel
                </button>
                <button 
                  onClick={sendEmail}
                  disabled={isSendingEmail || !emailRecipients.trim()}
                  className="modal-send-button"
                >
                  {isSendingEmail ? (
                    <>
                      <span>⏳</span>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating GitHub Button */}
      <a 
        href="https://github.com/the-adee/ai-powered-meeting-notes-summarizer" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="github-floating-button"
        title="View source code on GitHub"
      >
        <svg className="github-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      </a>
    </div>
  );
}

export default App;
