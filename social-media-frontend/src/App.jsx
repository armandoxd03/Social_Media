import { useState, useEffect } from 'react';
import axios from 'axios';
import UserProfile from './components/UserProfile';
import Post from './components/Post';
import PostForm from './components/PostForm';
import BulkUpload from './components/BulkUpload';
import './styles.css';

export default function App() {
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [user, setUser] = useState({
    username: 'Anonymous',
    userImageUrl: 'https://randomuser.me/api/portraits/lego/1.jpg'
  });
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [alerts, setAlerts] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/posts';

  // Fetch all posts on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(API_URL);
      setPosts(response.data);
    } catch (error) {
      addAlert('Failed to fetch posts', 'error');
    }
  };

  // Create a new post
  const handleCreatePost = async (content) => {
    try {
      const newPost = {
        username: user.username,
        userImageUrl: user.userImageUrl,
        content
      };
      const response = await axios.post(API_URL, newPost);
      setPosts([response.data, ...posts]);
      addAlert('Post created successfully!');
      return true;
    } catch (error) {
      addAlert('Failed to create post', 'error');
      return false;
    }
  };

  // Bulk create posts
  const handleBulkCreate = async (postData) => {
    try {
      const response = await axios.post(`${API_URL}/bulk`, postData);
      setPosts([...response.data, ...posts]);
      addAlert(`${response.data.length} posts created successfully!`);
      return { success: true };
    } catch (error) {
      addAlert('Failed to create posts', 'error');
      return { success: false };
    }
  };

  // Update a post
  const handleUpdatePost = async (updatedPost) => {
    try {
      const response = await axios.put(`${API_URL}/${updatedPost.id}`, updatedPost);
      setPosts(posts.map(p => p.id === updatedPost.id ? response.data : p));
      addAlert('Post updated successfully!');
      return true;
    } catch (error) {
      addAlert('Failed to update post', 'error');
      return false;
    }
  };

  // Delete a post
  const handleDeletePost = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setPosts(posts.filter(post => post.id !== id));
      addAlert('Post deleted successfully!');
    } catch (error) {
      addAlert('Failed to delete post', 'error');
    }
  };

  // Like a post
  const handleLikePost = async (id) => {
    try {
      const response = await axios.post(`${API_URL}/${id}/like`);
      setPosts(posts.map(p => p.id === id ? response.data : p));
    } catch (error) {
      addAlert('Failed to like post', 'error');
    }
  };

  // Share a post
  const handleSharePost = async (id) => {
    try {
      const response = await axios.post(`${API_URL}/${id}/share`);
      setPosts(posts.map(p => p.id === id ? response.data : p));
      addAlert('Post shared!');
    } catch (error) {
      addAlert('Failed to share post', 'error');
    }
  };

// Add comment to post
const handleAddComment = async (postId, commentContent) => {
  try {
    // Step 1: Add the comment via API
    const response = await axios.post(`${API_URL}/${postId}/comments`, {
      username: user.username,
      userImageUrl: user.userImageUrl,
      content: commentContent
    });

    // Step 2: Re-fetch the post to get updated comments
    const updatedPostResponse = await axios.get(`${API_URL}/${postId}`);
    const updatedPost = updatedPostResponse.data;

    // Step 3: Update the state with the refetched post
    setPosts(posts.map(post => post.id === postId ? updatedPost : post));

    addAlert('Comment added successfully!');
    return true;
  } catch (error) {
    addAlert('Failed to add comment', 'error');
    return false;
  }
};

 // Update comment
const handleUpdateComment = async (postId, commentId, updatedContent) => {
  try {
    const response = await axios.put(`${API_URL}/${postId}/comments/${commentId}`, {
      content: updatedContent
    });

    // Update the comments locally
    setPosts(posts.map(post =>
      post.id === postId ? {
        ...post,
        comments: post.comments.map(comment =>
          comment.id === commentId ? response.data : comment
        )
      } : post
    ));

    addAlert('Comment updated successfully!');
    return true;
  } catch (error) {
    addAlert('Failed to update comment', 'error');
    return false;
  }
};

  // Delete comment
const handleDeleteComment = async (postId, commentId) => {
  try {
    await axios.delete(`${API_URL}/${postId}/comments/${commentId}`);

    // Remove the comment from the local state
    setPosts(posts.map(post =>
      post.id === postId ? {
        ...post,
        comments: post.comments.filter(comment => comment.id !== commentId)
      } : post
    ));

    addAlert('Comment deleted successfully!');
  } catch (error) {
    addAlert('Failed to delete comment', 'error');
  }
};
// Like comment
const handleLikeComment = async (postId, commentId) => {
  try {
    const response = await axios.post(`${API_URL}/${postId}/comments/${commentId}/like`);

    // Update the like count for the comment
    setPosts(posts.map(post =>
      post.id === postId ? {
        ...post,
        comments: post.comments.map(comment =>
          comment.id === commentId ? { ...comment, likeCount: response.data.likeCount } : comment
        )
      } : post
    ));

  } catch (error) {
    addAlert('Failed to like comment', 'error');
  }
};

  // Update user profile
  const handleUserUpdate = (newUserData) => {
    setUser(newUserData);
    addAlert('Profile updated!');
  };

// Add alert message
const addAlert = (message, type = 'success') => {
  const id = Date.now();
  setAlerts(prevAlerts => {
    const newAlerts = [...prevAlerts, { id, message, type }];
    setTimeout(() => {
      setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id));
    }, 3000);
    return newAlerts;
  });
};


  return (
    <div className="app-container">
      <div className="app">
        <div className="alerts-container">
          {alerts.map(alert => (
            <div key={alert.id} className={`alert ${alert.type}`}>
              {alert.message}
            </div>
          ))}
        </div>

        <header className="app-header">
          <h1>Social Media App</h1>
          <UserProfile user={user} onUpdate={handleUserUpdate} />
        </header>

        <main className="app-main">
          <button 
            className="bulk-toggle-btn"
            onClick={() => setShowBulkUpload(!showBulkUpload)}
          >
            {showBulkUpload ? 'Hide Bulk Upload' : 'Bulk Upload Posts'}
          </button>

          {showBulkUpload && <BulkUpload onBulkCreate={handleBulkCreate} />}

          <PostForm 
            onSubmit={editingPost ? handleUpdatePost : handleCreatePost}
            initialData={editingPost}
            onCancel={() => setEditingPost(null)}
          />

          <div className="posts-container">
            {posts.map(post => (
              <Post
                key={post.id}
                post={post}
                currentUser={user}
                onEdit={handleUpdatePost}
                onDelete={handleDeletePost}
                onLike={handleLikePost}
                onShare={handleSharePost}
                onAddComment={handleAddComment}
                onUpdateComment={handleUpdateComment}
                onDeleteComment={handleDeleteComment}
                onLikeComment={handleLikeComment}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}