package com.ducut.socialmedia.controller;

import com.ducut.socialmedia.model.Post;
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
        // Set timestamps for each post
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
}