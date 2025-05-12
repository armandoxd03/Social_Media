import { useState } from 'react';
import { FaThumbsUp, FaShare, FaEdit, FaTrash, FaComment } from 'react-icons/fa';

export default function Post({ 
  post, 
  currentUser,
  onEdit, 
  onDelete, 
  onLike, 
  onShare,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onLikeComment
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    id: post.id,
    content: post.content,
    username: post.username,
    userImageUrl: post.userImageUrl
  });
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const success = await onEdit(editData);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleAddCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const success = await onAddComment(post.id, newComment);
    if (success) {
      setNewComment('');
    }
  };

  const handleUpdateCommentSubmit = async (commentId, content) => {
    const success = await onUpdateComment(post.id, commentId, content);
    if (success) {
      setEditingCommentId(null);
    }
  };

  return (
    <div className="post">
      {isEditing ? (
        <form onSubmit={handleEditSubmit} className="post-edit-form">
          <div className="form-group">
            <label htmlFor="edit-username">Username:</label>
            <input
              id="edit-username"
              type="text"
              name="username"
              value={editData.username}
              onChange={handleEditChange}
              required
              className="username-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-image-url">Profile Image URL:</label>
            <div className="image-url-input-container">
              <input
                id="edit-image-url"
                type="url"
                name="userImageUrl"
                value={editData.userImageUrl}
                onChange={handleEditChange}
                required
                className="image-url-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="edit-content">Post Content:</label>
            <textarea
              id="edit-content"
              name="content"
              value={editData.content}
              onChange={handleEditChange}
              required
              rows="4"
            />
          </div>

          <div className="post-edit-actions">
            <button type="submit" className="save-btn">Save Changes</button>
            <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="post-header">
            <img src={post.userImageUrl} alt={post.username} className="post-profile-pic" />
            <span className="post-username">{post.username}</span>
          </div>
          <div className="post-content">{post.content}</div>
          
          <div className="post-actions">
            <button 
              onClick={() => {
                setEditData({
                  id: post.id,
                  content: post.content,
                  username: post.username,
                  userImageUrl: post.userImageUrl
                });
                setIsEditing(true);
              }} 
              className="edit-btn"
            >
              <FaEdit /> Edit
            </button>
            <button onClick={() => setShowDeleteModal(true)} className="delete-btn">
              <FaTrash /> Delete
            </button>
          </div>
          
          <div className="post-stats">
            <button className="like-btn" onClick={() => onLike(post.id)}>
              <FaThumbsUp /> {post.likeCount > 0 && post.likeCount}
            </button>
            <button className="share-btn" onClick={() => onShare(post.id)}>
              <FaShare /> {post.shareCount > 0 && post.shareCount}
            </button>
            <button 
              className="comment-btn" 
              onClick={() => setShowComments(!showComments)}
            >
              <FaComment /> {post.comments?.length || 0}
            </button>
          </div>
        </>
      )}

{showComments && (
  <div className="comments-section">
    <form onSubmit={handleAddCommentSubmit} className="comment-form">
      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Write a comment..."
        rows="2"
        required
      />
      <button type="submit" className="comment-submit-btn">Post Comment</button>
    </form>

    <div className="comments-list">
      {post.comments?.map(comment => (
        <div key={comment.id} className="comment">
          <div className="comment-header">
            <img 
              src={comment.userImageUrl} 
              alt={comment.username} 
              className="comment-profile-pic"
            />
            <span className="comment-username">{comment.username}</span>
          </div>
          
          {editingCommentId === comment.id ? (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateCommentSubmit(comment.id, e.target.content.value);
              }}
              className="comment-edit-form"
            >
              <textarea
                name="content"
                defaultValue={comment.content}
                required
                rows="2"
              />
              <div className="comment-edit-actions">
                <button type="submit" className="save-btn">Save</button>
                <button type="button" onClick={() => setEditingCommentId(null)} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="comment-content">{comment.content}</div>
              <div className="comment-actions">
                <button 
                  onClick={() => onLikeComment(post.id, comment.id)}
                  className="comment-like-btn"
                >
                  <FaThumbsUp /> {comment.likeCount > 0 && comment.likeCount}
                </button>
                {comment.username === currentUser.username && (
                  <>
                    <button 
                      onClick={() => setEditingCommentId(comment.id)}
                      className="comment-edit-btn"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => onDeleteComment(post.id, comment.id)}
                      className="comment-delete-btn"
                    >
                      <FaTrash />
                    </button>
                  </>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal">
          <div className="modal-content">
            <p>Are you sure you want to delete this post?</p>
            <div className="modal-actions">
              <button onClick={() => {
                onDelete(post.id);
                setShowDeleteModal(false);
              }}>Yes</button>
              <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}