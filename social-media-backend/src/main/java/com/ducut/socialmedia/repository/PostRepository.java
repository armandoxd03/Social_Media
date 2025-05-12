package com.ducut.socialmedia.repository;

import com.ducut.socialmedia.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {
    // Basic CRUD operations are provided by JpaRepository
}