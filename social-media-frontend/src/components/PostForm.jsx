import { useState, useEffect } from 'react';

export default function PostForm({ onSubmit, initialData, onCancel }) {
  const [content, setContent] = useState('');

  // Initialize form with post data when editing
  useEffect(() => {
    if (initialData) {
      setContent(initialData.content);
    } else {
      setContent('');
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    const success = await onSubmit(initialData 
      ? { ...initialData, content }  // For edit
      : content                      // For create
    );
    
    if (success && !initialData) {
      setContent(''); // Clear form after successful post creation
    }
  };

  return (
    <form onSubmit={handleSubmit} className="post-form">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        required
      />
      <div className="form-actions">
        <button type="submit">{initialData ? 'Update' : 'Post'}</button>
        {initialData && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}