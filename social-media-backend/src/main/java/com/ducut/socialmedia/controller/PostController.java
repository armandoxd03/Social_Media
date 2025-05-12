package com.ducut.socialmedia.controller;

import com.ducut.socialmedia.model.Comment;
import com.ducut.socialmedia.model.Post;
import com.ducut.socialmedia.repository.CommentRepository;
import com.ducut.socialmedia.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*")
public class PostController {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    // Get all posts
    @GetMapping
    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    // Create a single post
    @PostMapping
    public Post createPost(@RequestBody Post post) {
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());
        return postRepository.save(post);
    }

    // Bulk create posts
    @PostMapping("/bulk")
    public ResponseEntity<List<Post>> createPostsBulk(@RequestBody List<Post> posts) {
        posts.forEach(post -> {
            post.setCreatedAt(LocalDateTime.now());
            post.setUpdatedAt(LocalDateTime.now());
        });
        List<Post> savedPosts = postRepository.saveAll(posts);
        return ResponseEntity.ok(savedPosts);
    }

    // Get a single post by ID
    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable Long id) {
        Optional<Post> post = postRepository.findById(id);
        return post.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Update a post
    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable Long id, @RequestBody Post postDetails) {
        Optional<Post> postOptional = postRepository.findById(id);
        if (postOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Post post = postOptional.get();
        post.setContent(postDetails.getContent());
        post.setUsername(postDetails.getUsername());
        post.setUserImageUrl(postDetails.getUserImageUrl());
        post.setUpdatedAt(LocalDateTime.now());

        Post updatedPost = postRepository.save(post);
        return ResponseEntity.ok(updatedPost);
    }

    // Delete a post
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        if (!postRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        postRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Like a post
    @PostMapping("/{id}/like")
    public ResponseEntity<Post> likePost(@PathVariable Long id) {
        Optional<Post> postOptional = postRepository.findById(id);
        if (postOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Post post = postOptional.get();
        post.setLikeCount(post.getLikeCount() + 1);
        post.setUpdatedAt(LocalDateTime.now());
        Post updatedPost = postRepository.save(post);
        return ResponseEntity.ok(updatedPost);
    }

    // Share a post
    @PostMapping("/{id}/share")
    public ResponseEntity<Post> sharePost(@PathVariable Long id) {
        Optional<Post> postOptional = postRepository.findById(id);
        if (postOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Post post = postOptional.get();
        post.setShareCount(post.getShareCount() + 1);
        post.setUpdatedAt(LocalDateTime.now());
        Post updatedPost = postRepository.save(post);
        return ResponseEntity.ok(updatedPost);
    }

    // Comment Endpoints

    // Get all comments for a post
    @GetMapping("/{postId}/comments")
    public ResponseEntity<List<Comment>> getCommentsByPostId(@PathVariable Long postId) {
        List<Comment> comments = commentRepository.findByPostId(postId);
        return ResponseEntity.ok(comments);
    }

    // Add a comment to a post
    @PostMapping("/{postId}/comments")
    public ResponseEntity<Post> addComment(
            @PathVariable Long postId,
            @RequestBody Comment commentRequest) {

        return postRepository.findById(postId)
                .map(post -> {
                    Comment comment = new Comment(
                            commentRequest.getUsername(),
                            commentRequest.getUserImageUrl(),
                            commentRequest.getContent(),
                            post
                    );
                    commentRepository.save(comment);

                    // Re-fetch post to get updated comments list
                    Post updatedPost = postRepository.findById(postId).get();
                    return ResponseEntity.ok(updatedPost);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Update a comment
    @PutMapping("/{postId}/comments/{commentId}")
    public ResponseEntity<Post> updateComment(
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @RequestBody Comment commentRequest) {

        if (!postRepository.existsById(postId)) {
            return ResponseEntity.notFound().build();
        }

        return commentRepository.findById(commentId)
                .map(comment -> {
                    comment.setContent(commentRequest.getContent());
                    commentRepository.save(comment);
                    Post updatedPost = postRepository.findById(postId).get();
                    return ResponseEntity.ok(updatedPost);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Delete a comment
    @DeleteMapping("/{postId}/comments/{commentId}")
    public ResponseEntity<Post> deleteComment(
            @PathVariable Long postId,
            @PathVariable Long commentId) {

        if (!postRepository.existsById(postId)) {
            return ResponseEntity.notFound().build();
        }

        return commentRepository.findById(commentId)
                .map(comment -> {
                    commentRepository.delete(comment);
                    Post updatedPost = postRepository.findById(postId).get();
                    return ResponseEntity.ok(updatedPost);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Like a comment
    @PostMapping("/{postId}/comments/{commentId}/like")
    public ResponseEntity<Post> likeComment(
            @PathVariable Long postId,
            @PathVariable Long commentId) {

        if (!postRepository.existsById(postId)) {
            return ResponseEntity.notFound().build();
        }

        return commentRepository.findById(commentId)
                .map(comment -> {
                    comment.setLikeCount(comment.getLikeCount() + 1);
                    commentRepository.save(comment);
                    Post updatedPost = postRepository.findById(postId).get();
                    return ResponseEntity.ok(updatedPost);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}