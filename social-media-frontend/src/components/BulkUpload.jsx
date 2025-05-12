import { useState } from 'react';

export default function BulkUpload({ onBulkCreate }) {
  const [jsonInput, setJsonInput] = useState('');
  const [message, setMessage] = useState({ text: '', isError: false });

  const sampleData = `[
  {
    "username": "User1",
    "userImageUrl": "https://randomuser.me/api/portraits/women/1.jpg",
    "content": "First sample post"
  },
  {
    "username": "User2",
    "userImageUrl": "https://randomuser.me/api/portraits/men/1.jpg",
    "content": "Second sample post"
  }
]`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const postData = JSON.parse(jsonInput);
      const result = await onBulkCreate(postData);
      setMessage({
        text: result.success ? 'Posts created successfully!' : 'Failed to create posts',
        isError: !result.success
      });
      setTimeout(() => setMessage({ text: '', isError: false }), 3000);
    } catch (error) {
      setMessage({
        text: 'Invalid JSON format',
        isError: true
      });
    }
  };

  const loadSample = () => {
    setJsonInput(sampleData);
  };

  return (
    <div className="bulk-upload">
      <h3>Bulk Create Posts</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder={`Paste JSON array of posts here...\n\nSample format:\n${sampleData}`}
          rows={10}
        />
        <div className="bulk-actions">
          <button type="button" onClick={loadSample}>Load Sample</button>
          <button type="submit">Upload Posts</button>
        </div>
      </form>
      {message.text && (
        <div className={`message ${message.isError ? 'error' : 'success'}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}